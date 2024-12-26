ALTER TABLE "leave_request" ADD COLUMN "approver_id" integer;--> statement-breakpoint
ALTER TABLE "leave_request" ADD COLUMN "approval_date" timestamp;--> statement-breakpoint
ALTER TABLE "leave_request" ADD COLUMN "rejection_reason" text;