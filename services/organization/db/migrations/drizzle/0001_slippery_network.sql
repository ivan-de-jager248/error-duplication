CREATE TABLE IF NOT EXISTS "organization_membership" (
	"user_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"group_id" integer,
	"date_joined" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_membership_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_membership" ADD CONSTRAINT "organization_membership_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
