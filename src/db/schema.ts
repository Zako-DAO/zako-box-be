import { char, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  address: char({ length: 42 }).primaryKey(),
  displayName: varchar({ length: 255 }).notNull(),
  internalId: uuid().notNull().defaultRandom().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
})

export const githubAccounts = pgTable('github_accounts', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().unique().references(() => users.internalId),
  githubId: varchar({ length: 255 }).unique().notNull(),
  accessToken: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
}, table => ({
  githubIdIdx: index('github_accounts_github_id_idx').on(table.githubId),
  userIdIdx: index('github_accounts_user_id_idx').on(table.userId),
}))
