import { char, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  address: char({ length: 42 }).primaryKey(),
  displayName: varchar({ length: 255 }).notNull(),
  internalId: uuid().notNull().defaultRandom().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
})

export const githubAccounts = pgTable('github_accounts', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => users.internalId),
  githubId: varchar({ length: 255 }).notNull(),
  accessToken: varchar({ length: 255 }).notNull(),
  refreshToken: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
})
