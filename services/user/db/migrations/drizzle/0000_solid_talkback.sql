CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"date_created" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
