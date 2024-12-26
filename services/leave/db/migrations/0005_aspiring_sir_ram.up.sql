DO $$ BEGIN
    ALTER TABLE "leave_balances" ADD COLUMN "organization_id" integer NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "leave_balances" ADD COLUMN "user_id" integer NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "leave_request" ADD COLUMN "organization_id" integer NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "leave_request" ADD COLUMN "user_id" integer NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

ALTER TABLE "leave_balances" DROP COLUMN IF EXISTS "organization_membership_id";--> statement-breakpoint
ALTER TABLE "leave_request" DROP COLUMN IF EXISTS "organization_membership_id";
ALTER TABLE "leave_balances" DROP CONSTRAINT IF EXISTS "leave_balances_organization_membership_id_leave_type_id_pk";--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_organization_id_user_id_leave_type_id_pk" PRIMARY KEY("organization_id","user_id","leave_type_id");--> statement-breakpoint