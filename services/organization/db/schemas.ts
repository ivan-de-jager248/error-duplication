import { boolean, integer, json, pgTable, primaryKey, real, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the Organization table
export const organizations = pgTable('organization', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    dateCreated: timestamp('date_created', { mode: 'string' }).defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull()
});

// Define the OrganizationLeaveSettings table
export const organizationLeaveSettings = pgTable('organization_leave_settings', {
    organizationId: integer('organization_id').references(() => organizations.id, {onDelete: 'cascade'}).notNull(),
    leaveType: integer('leave_type_id').notNull(),
    annualAccrualRate: real('annual_accrual_rate').default(0.0).notNull(),
    initialAllocation: real('initial_allocation').default(0.0).notNull(),
    maxCarryOver: real('max_carry_over').default(0.0).notNull()
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.organizationId, table.leaveType] })
    }
});

// Define the OrganizationMembership table
export const organizationMemberships = pgTable('organization_membership', {
    userId: integer('user_id').notNull(),
    organizationId: integer('organization_id').references(() => organizations.id, {onDelete: 'cascade'}).notNull(),
    roleId: integer('role_id').references(() => roles.id, {onDelete: 'cascade'}).notNull(),
    groupId: integer('group_id'),
    dateJoined: timestamp('date_joined', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.organizationId] })
    }
});

export const roles = pgTable('role', {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').references(() => organizations.id, {onDelete: 'cascade'}).notNull(),
    permissions: json('permissions').default([]).$type<Permissions>().notNull(),
    name: varchar('name', { length: 50 }).notNull()
}, (table) => {
    return {
        unq: unique().on(table.name, table.organizationId)
    }
});

export const organizationMembershipRelations = relations(organizationMemberships, ({one}) => ({
    role: one(roles, {
        fields: [organizationMemberships.roleId],
        references: [roles.id]
    })
}));

// Update the defaultRolesAndPermissions with the new type
export const defaultRolesAndPermissions: Record<string, SpecificPermissions> = {
    owner: {
        leave_request: { view_all: true, approve: true, create: true, delete: true },
        user: { create: true, update: true, delete: true },
        role: { create: true, update: true, delete: true },
        organization: { update_settings: true, delete: true }
    },
    admin: {
        leave_request: { view_all: true, approve: true, create: true, delete: true },
        user: { create: true, update: true, delete: true },
        role: { create: true, update: true, delete: true },
        organization: { update_settings: true, delete: true }
    },
    manager: {
        leave_request: { view_all: true, approve: true, create: true, delete: true },
        user: { create: true, update: true, delete: true },
        role: { create: true, update: true, delete: true },
        organization: { update_settings: true, delete: true }
    },
    employee: {
        leave_request: { view_all: false, approve: false, create: true, delete: false },
        user: { create: false, update: false, delete: false },
        role: { create: false, update: false, delete: false },
        organization: { update_settings: false, delete: false }
    }
};

// Define the Organization interface
export interface Organization {
    id: number;
    name: string;
    dateCreated: string;
    isActive: boolean;
}

export interface CreateOrganization {
    name: string;
    isActive?: boolean;
}

// Define the OrganizationLeaveSettings interface
export interface OrganizationLeaveSettings {
    organizationId: number;
    leaveType: number;
    annualAccrualRate: number;
    initialAllocation: number;
    maxCarryOver: number;
}

export interface UpdateOrganizationLeaveSettings {
    organizationId: number;
    leaveType: number;
    annualAccrualRate?: number | undefined;
    initialAllocation?: number | undefined;
    maxCarryOver?: number | undefined;
}

// Define the OrganizationMembership interface
export interface OrganizationMembership {
    organizationId: number;
    userId: number;
    roleId: number;
    groupId: number | null;
    dateJoined: string;
}

export type OrganizationMembershipWithRole = Omit<OrganizationMembership, 'roleId'> & {
    role: Role;
}

export interface SaveOrganizationMembership {
    organizationId: number;
    userId: number;
    roleId: number;
    groupId?: number | null | undefined;
}

// Define the Roles interface
export interface Role {
    id: number;
    name: string;
    organizationId: number;
    permissions: Permissions;
}

export interface CreateRole {
    name: string;
    organizationId: number;
    permissions?: Permissions | undefined;
}

// Role Permissions

// Define specific permission types for each entity
type LeaveRequestPermission = {
    view_all: boolean;
    approve: boolean;
    create: boolean;
    delete: boolean;
};

type UserPermission = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

type RolePermission = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

type OrganizationPermission = {
    update_settings: boolean;
    delete: boolean;
};

// Define a more specific Permission type
type SpecificPermissions = {
    leave_request: LeaveRequestPermission;
    user: UserPermission;
    role: RolePermission;
    organization: OrganizationPermission;
};

export type Permissions = SpecificPermissions;
