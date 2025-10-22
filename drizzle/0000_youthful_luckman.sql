CREATE TABLE "github_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"githubId" varchar(255) NOT NULL,
	"accessToken" varchar(255) NOT NULL,
	"refreshToken" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"address" char(42) PRIMARY KEY NOT NULL,
	"displayName" varchar(255) NOT NULL,
	"internalId" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_internalId_unique" UNIQUE("internalId")
);
--> statement-breakpoint
ALTER TABLE "github_accounts" ADD CONSTRAINT "github_accounts_userId_users_internalId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("internalId") ON DELETE no action ON UPDATE no action;