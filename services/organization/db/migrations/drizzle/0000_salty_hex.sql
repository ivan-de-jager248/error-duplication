CREATE TABLE IF NOT EXISTS "organization_leave_settings" (
	"organization_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"annual_accrual_rate" real DEFAULT 0 NOT NULL,
	"initial_allocation" real DEFAULT 0 NOT NULL,
	"max_carry_over" real DEFAULT 0 NOT NULL,
	CONSTRAINT "organization_leave_settings_organization_id_leave_type_id_pk" PRIMARY KEY("organization_id","leave_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "organization_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_leave_settings" ADD CONSTRAINT "organization_leave_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
