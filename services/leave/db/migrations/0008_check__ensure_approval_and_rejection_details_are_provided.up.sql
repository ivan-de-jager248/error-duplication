-- Custom SQL migration file, put you code below! --

-- Drop existing constraints if they exist
ALTER TABLE "leave_request" DROP CONSTRAINT IF EXISTS "rejection_reason_check";
ALTER TABLE "leave_request" DROP CONSTRAINT IF EXISTS "approval_check";

-- Add rejection reason check
ALTER TABLE "leave_request"
ADD CONSTRAINT "rejection_reason_check"
CHECK (
    (status != 'REJECTED') OR 
    (status = 'REJECTED' AND rejection_reason IS NOT NULL)
);

-- Add approval check
ALTER TABLE "leave_request"
ADD CONSTRAINT "approval_check"
CHECK (
    (status != 'APPROVED') OR 
    (status = 'APPROVED' AND approver_id IS NOT NULL AND approval_date IS NOT NULL)
);