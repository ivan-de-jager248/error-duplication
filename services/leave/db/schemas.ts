import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
  date,
  pgEnum,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";

export const leaveTypes = pgTable("leave_type", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const leaveBalances = pgTable(
  "leave_balances",
  {
    organizationId: integer("organization_id").notNull(),
    userId: integer("user_id").notNull(),
    type: integer("leave_type_id")
      .references(() => leaveTypes.id)
      .notNull(),
    totalLeave: real("total_leave").default(0.0).notNull(),
    usedLeave: real("used_leave").default(0.0).notNull(),
    lastUpdated: timestamp("last_updated", { mode: "string" })
      .$onUpdate(() => new Date().toISOString())
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.organizationId, table.userId, table.type],
      }),
    };
  },
);

export const leaveRequestStatusEnum = pgEnum("leave_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const leaveRequests = pgTable("leave_request", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id").notNull(),
  type: integer("leave_type_id")
    .references(() => leaveTypes.id)
    .notNull(),
  dateCreated: timestamp("date_created", { mode: "string" })
    .defaultNow()
    .notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: leaveRequestStatusEnum("status")
    .default(leaveRequestStatusEnum.enumValues[0])
    .notNull(),
  reason: text("reason").notNull(),
  reviewerId: integer("reviewer_id"),
  reviewTimestamp: timestamp("review_timestamp", { mode: "string" }),
  rejectionReason: text("rejection_reason"),
  workingDays: real("working_days").default(0.0).notNull(),
});

// Types

// Predefined Leave Types
export enum PredefinedLeaveTypes {
  ANNUAL_LEAVE = "ANNUAL_LEAVE",
  SICK_LEAVE = "SICK_LEAVE",
  PERSONAL_LEAVE = "PERSONAL_LEAVE",
  UNPAID_LEAVE = "UNPAID_LEAVE",
}

export interface LeaveRequest {
  id: number;
  organizationId: number;
  userId: number;
  type: number;
  dateCreated: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason: string;
}

export interface SaveLeaveRequest {
  id: number;
  organizationId: number;
  startDate?: string | undefined;
  endDate?: string | undefined;
  reason?: string | undefined;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined;
  reviewerId?: number | null | undefined;
  reviewTimestamp?: string | null | undefined;
  rejectionReason?: string | null | undefined;
}

export interface CreateLeaveRequest {
  organizationId: number;
  userId: number;
  type: number;
  startDate: string;
  endDate: string;
  reason: string;
  workingDays: number;
}

export interface LeaveBalance {
  organizationId: number;
  userId: number;
  type: number;
  totalLeave: number;
  usedLeave: number;
  lastUpdated: string;
}

export interface CreateLeaveBalance {
  organizationId: number;
  userId: number;
  type: number;
  totalLeave?: number | undefined;
  usedLeave?: number | undefined;
}

export interface UpdateLeaveBalance {
  organizationId: number;
  userId: number;
  type: number;
  totalLeave?: number | undefined;
  usedLeave?: number | undefined;
}

export interface LeaveType {
  id: number;
  organizationId: number;
  name: string;
  isActive: boolean;
}
