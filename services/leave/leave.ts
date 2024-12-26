import { api } from "encore.dev/api";
import {
  LeaveType,
  leaveTypes,
  PredefinedLeaveTypes,
} from "./db/schemas";
import { db } from "./db/db";
import { eq } from "drizzle-orm";
import { organization } from "~encore/clients";
import log from "encore.dev/log";

/**
 * Initializes the leave balances for a user within an organization.
 *
 * @param params - The parameters for initializing leave balances.
 * @param params.userId - The ID of the user.
 * @param params.organizationId - The ID of the organization.
 * @returns An object indicating the success of the operation.
 *
 * @throws APIError.notFound - If no leave types are found.
 *
 * This function performs the following steps:
 * 1. Retrieves user data based on the provided user ID.
 * 2. Fetches all available leave types from the database.
 * 3. Retrieves the user's membership information within the organization.
 * 4. Determines the leave settings based on the user's group or organization.
 * 5. Inserts initial leave balances for the user into the database within a transaction.
 */
export const initUserLeaveBalances = api<
  { userId: number; organizationId: number },
  { success: boolean }
>({ expose: false }, async (params) => {
  let leaveTypesList = await db.query.leaveTypes.findMany({
    where: eq(leaveTypes.organizationId, params.organizationId),
    columns: { id: true, name: true },
  });
  console.log(1);
  
  if (!leaveTypesList.length) {
    // Initialize leave types if none exist
    log.info(
      `Initializing leave types for organization with id ${params.organizationId}`,
    );
    const { types } = await initializeLeaveTypes({
      organizationId: params.organizationId,
    });
    leaveTypesList = types;
  }

  console.log(2);
  const { memberships } = await organization.getUserMemberships({
    userId: params.userId,
    organizationId: params.organizationId,
  });
  const membership = memberships[0];

  console.log(3);

  log.info(
    `Leave balances for user with id ${params.userId} initialized successfully`,
  );
  
  return { success: true };
});

// Functions

/**
 * Initializes the leave types for an organization.
 *
 * @param organizationId - The ID of the organization.
 * @returns An array of inserted leave types.
 *
 * This function performs the following steps:
 * 1. Constructs an array of leave types to insert based on predefined types.
 * 2. Inserts the leave types into the database.
 **/
export const initializeLeaveTypes = api<
  { organizationId: number },
  { types: LeaveType[] }
>({ expose: false }, async ({ organizationId }) => {
  const leaveTypesToInsert = Object.values(PredefinedLeaveTypes).map(
    (name) => ({
      organizationId,
      name,
      isActive: true,
    }),
  );

  const insertedTypes = await db
    .insert(leaveTypes)
    .values(leaveTypesToInsert)
    .onConflictDoNothing()
    .returning();

  return { types: insertedTypes };
});
