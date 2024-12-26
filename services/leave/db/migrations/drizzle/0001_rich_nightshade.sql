ALTER TABLE "leave_type" DROP CONSTRAINT "leave_type_name_unique";--> statement-breakpoint
ALTER TABLE "leave_balances" DROP CONSTRAINT "leave_balances_user_id_leave_type_id_pk";--> statement-breakpoint
ALTER TABLE "leave_request" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_organization_membership_id_leave_type_id_pk" PRIMARY KEY("organization_membership_id","leave_type_id");--> statement-breakpoint
ALTER TABLE "leave_balances" ADD COLUMN "organization_membership_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_request" ADD COLUMN "organization_membership_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_type" ADD COLUMN "organization_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_type" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_balances" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "leave_request" DROP COLUMN IF EXISTS "user_id";