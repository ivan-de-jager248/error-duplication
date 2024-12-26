ALTER TABLE "role" DROP CONSTRAINT "role_name_unique";--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_name_organization_id_unique" UNIQUE("name","organization_id");