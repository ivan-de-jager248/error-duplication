DO $$ BEGIN
 CREATE TYPE "public"."leave_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_balances" (
	"user_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"total_leave" real DEFAULT 0 NOT NULL,
	"used_leave" real DEFAULT 0 NOT NULL,
	"last_updated" timestamp NOT NULL,
	CONSTRAINT "leave_balances_user_id_leave_type_id_pk" PRIMARY KEY("user_id","leave_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "leave_request_status" DEFAULT 'PENDING',
	"reason" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "leave_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
