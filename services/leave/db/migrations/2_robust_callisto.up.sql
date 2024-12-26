-- Drop the existing primary key constraint
ALTER TABLE "leave_balances" DROP CONSTRAINT IF EXISTS "leave_balances_pkey";
ALTER TABLE "leave_balances" DROP CONSTRAINT IF EXISTS "leave_balances_pk";
ALTER TABLE "leave_balances" DROP CONSTRAINT IF EXISTS "leave_balances_user_id_leave_type_id_pk";


-- Remove the id column
ALTER TABLE "leave_balances" DROP COLUMN IF EXISTS "id";

-- Add the composite primary key
DO $$ BEGIN
    ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_user_id_leave_type_id_pk" PRIMARY KEY("user_id", "leave_type_id");
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_column THEN null;
END $$;