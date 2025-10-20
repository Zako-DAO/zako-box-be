import { drizzle } from 'drizzle-orm/bun-sql'

export const db = drizzle(Bun.env.POSTGRES_URL)
