ALTER TABLE "leave_balances"
ALTER COLUMN "last_updated" TYPE timestamp
USING "last_updated"::timestamp;