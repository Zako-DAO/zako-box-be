ALTER TABLE "github_accounts" DROP COLUMN "refreshToken";--> statement-breakpoint
ALTER TABLE "github_accounts" ADD CONSTRAINT "github_accounts_userId_unique" UNIQUE("userId");--> statement-breakpoint
ALTER TABLE "github_accounts" ADD CONSTRAINT "github_accounts_githubId_unique" UNIQUE("githubId");