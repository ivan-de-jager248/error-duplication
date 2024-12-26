ALTER TABLE "role" ADD COLUMN "organization_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "permissions" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role" ADD CONSTRAINT "role_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
