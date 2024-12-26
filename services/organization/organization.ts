import { api, APIError } from "encore.dev/api";
import { CreateOrganization, defaultRolesAndPermissions, Organization, OrganizationLeaveSettings, organizationLeaveSettings, OrganizationMembership, organizationMemberships, OrganizationMembershipWithRole, organizations, Role, roles, SaveOrganizationMembership } from "./db/schemas";
import { db } from "./db/db";
import { leave } from "~encore/clients";
import { getAuthData } from "~encore/auth";
import { eq, and, sql } from "drizzle-orm";
import log from "encore.dev/log";

// Organization

export const createOrg = api<CreateOrganizationParams, { org: Organization }>(
    { method: 'POST', path: '/organization', expose: true, auth: true },
    async (params) => {
        const [org] = await db.insert(organizations).values(params).returning();

        // Perform organization initialization
        log.info(`Initializing organization with id ${org.id}`);
        await createDefaultRoles(org.id);
        const { types } = await leave.initializeLeaveTypes({ organizationId: org.id });

        log.info(`Initializing default leave settings for organization with id ${org.id}`);
        await initDefaultLeaveSettings(org.id, types);

        // Create owner 
        const userData = getAuthData()!;
        log.info(`Creating roles for organization with id ${org.id} and adding user with id ${userData.user.id} as owner`);
        await updateUserToOwner(userData.user.id, org.id);

        log.info(`Organization with id ${org.id} created successfully`);
        return { org };
    }
)

// Memberships

/**
 * Retrieves the membership details of a user within a specific organization.
 * 
 * @param params - The parameters required to fetch the membership details.
 * @param params.userId - The ID of the user.
 * @param params.organizationId - The ID of the organization.
 * @param params.withRoles - Whether to include role details in the response.
 * @returns An object containing the membership details of the user within the organization.
 * @throws APIError.notFound - If the user membership in the organization is not found.
 */
export const getUserMemberships: GetUserMembershipOverloads = api<GetUserMembershipParams, GetUserMembershipResponse>(
    { method: 'GET', path: '/users/:userId/memberships', expose: true, auth: true },
    async (params) => {
        console.log(6);
        
        const { memberships } = await _getUserMemberships(params);
        console.log(7, memberships);
        
        if (!memberships.length) {
            log.info(`No memberships found for user ${params.userId}`);
            throw APIError.notFound(`User with id ${params.userId} has no memberships ${params.organizationId ? `in organization with id ${params.organizationId}` : ''}`);
        }

        return { memberships };
    }
) as GetUserMembershipOverloads;

/**
 * @internal
 * 
 * Retrieves the membership details of a user within a specific organization.
 * 
 * @param params - The parameters required to fetch the membership details.
 * @param params.userId - The ID of the user.
 * @param params.organizationId - The ID of the organization.
 * @param params.withRoles - Whether to include role details in the response.
 * @returns An object containing the membership details of the user within the organization.
 * @throws APIError.notFound - If the user membership in the organization is not found.
 */
export const _getUserMemberships: GetUserMembershipOverloads = api<GetUserMembershipParams, GetUserMembershipResponse>(
    { expose: false },
    async (params) => {
        log.info(`Getting memberships for user with id ${params.userId}`);

        let whereStatement = eq(organizationMemberships.userId, params.userId);

        if (params.organizationId) {
            log.info(`Filtering memberships for organization with id ${params.organizationId}`);
            whereStatement = and(whereStatement ?? sql`TRUE`, eq(organizationMemberships.organizationId, params.organizationId))!;
        }

        // Build query params
        const queryParams: any = {
            with: {
                role: params.withRoles || undefined,
            },
            where: whereStatement
        }

        // If roles are requested, don't include roleId in the query
        if (params.withRoles) {
            queryParams.columns = {
                roleId: false
            }
        }

        // Query memberships
        const memberships = await db.query.organizationMemberships.findMany(queryParams);
        log.info(`Found ${memberships.length} memberships for user ${params.userId}`, { memberships });

        return {
            memberships: memberships
        };
    }
) as GetUserMembershipOverloads;

export const addUserToOrg = api<AddUserToOrgParams, OrganizationMembership>(
    { method: 'POST', path: '/organization/:organizationId/users', expose: true, auth: true },
    async (params) => {
        // Get role information
        const ownerRole = await getRole({ name: 'owner', organizationId: params.organizationId });
        
        // Check if the role to be assigned is owner
        const isOwnerRole = params.roleId === ownerRole.role.id;

        // If not adding an owner, check user's membership and permissions
        if (!isOwnerRole) {
            const userData = await getAuthData()!;

            const { memberships } = await _getUserMemberships({ userId: userData.user.id, organizationId: params.organizationId, withRoles: true });

            if (!memberships.length) {
                throw APIError.permissionDenied('You must be a member of the organization to add users');
            }

            const [membership] = memberships;
            const userIsOwner = membership.role.name === 'owner';
            const userIsAdmin = membership.role.name === 'admin';

            if (!userIsOwner && !userIsAdmin) {
                throw APIError.permissionDenied('Only owners and admins can add users to an organization');
            }
        }
        
        // If role is not provided, default to employee
        if (!params.roleId) {
            params.roleId = (await getRole({ name: 'employee', organizationId: params.organizationId })).role.id;
        }

        const [newMembership] = await db.insert(organizationMemberships).values(params as SaveOrganizationMembership).returning();

        // Init leave balances for user
        await leave.initUserLeaveBalances({ userId: params.userId, organizationId: params.organizationId });

        return newMembership;
    }
);

// Roles

export const getRole = api<{ id?: number, name?: string, organizationId: number }, { role: Role }>(
    { expose: false },
    async (p) => {
        if (p.id === undefined && p.name === undefined) {
            throw APIError.invalidArgument('Either id or name must be provided');
        }

        const roleQuery = db.select().from(roles).where(eq(roles.organizationId, p.organizationId)).$dynamic();

        if (p.id !== undefined) {
            const [role] = await roleQuery.where(eq(roles.id, p.id)).limit(1);

            if (!role) throw APIError.notFound(`Role with id ${p.id} was not found`);

            return { role };
        }

        if (p.name !== undefined) {
            roleQuery.where(eq(sql`lower(${roles.name})`, p.name.toLocaleLowerCase()));
        }

        const [role] = await roleQuery.limit(1);

        if (!role) {
            throw APIError.notFound(`Role with name ${p.name} was not found`);
        }

        return { role };
    }
);

// Functions

const updateUserToOwner = async (userId: number, organization: number) => {
    const { role } = await getRole({ name: 'owner', organizationId: organization });

    await addUserToOrg({
        userId,
        organizationId: organization,
        roleId: role.id
    });
}

/**
 * Initializes the default leave settings for an organization.
 * 
 * @param organization - The ID of the organization.
 * @throws APIError.internal - If no leave types are found.
 * 
 * This function performs the following steps:
 * 1. Retrieves all leave types for the organization.
 * 2. Checks if any leave types exist.
 * 3. Initializes the leave settings for each leave type.
 */
const initDefaultLeaveSettings = async (organization: number, types: any[]) => {
    const leaveTypeIds = types.map((lt) => lt.id);

    // Start a transaction
    await db.transaction(async (trx) => {
        const insertValues = leaveTypeIds.map((leaveType) => ({
            organizationId: organization,
            leaveType,
            annualAccrualRate: 0,
            initialAllocation: 0,
            maxCarryOver: 0
        } as OrganizationLeaveSettings));

        // Batch insert
        await trx.insert(organizationLeaveSettings).values(insertValues);
    });
}

// Function to create default roles for a new organization
async function createDefaultRoles(organizationId: number) {
    const roleValues = Object.entries(defaultRolesAndPermissions).map(([roleName, rolePermissions]) => ({
        organizationId,
        name: roleName,
        permissions: rolePermissions
    }));

    await db.insert(roles).values(roleValues);
}

// Interfaces and types

type AddUserToOrgParams = Omit<SaveOrganizationMembership, 'roleId'> & {
    roleId?: number;
}

type CreateOrganizationParams = Omit<CreateOrganization, 'isActive'>;

interface GetUserMembershipParams {
    userId: number;
    organizationId?: number;
    withRoles?: boolean;
}

interface GetUserMembershipResponse {
    memberships: OrganizationMembership[] | OrganizationMembershipWithRole[];
}

type GetUserMembershipOverloads = {
    (params: { userId: number, withRoles: true }): Promise<{ memberships: OrganizationMembershipWithRole[] }>;
    (params: { userId: number, withRoles?: false | undefined }): Promise<{ memberships: OrganizationMembership[] }>;
    (params: { userId: number, withRoles?: boolean }): Promise<{ memberships: OrganizationMembership[] | OrganizationMembershipWithRole[] }>;
    (params: { userId: number, organizationId: number, withRoles: true }): Promise<{ memberships: [OrganizationMembershipWithRole] }>;
    (params: { userId: number, organizationId: number, withRoles?: false | undefined }): Promise<{ memberships: [OrganizationMembership] }>;
    (params: { userId: number, organizationId: number, withRoles?: boolean }): Promise<{ memberships: [OrganizationMembership] | [OrganizationMembershipWithRole] }>;
}