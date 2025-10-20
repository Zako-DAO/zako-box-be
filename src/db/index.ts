import { drizzle } from 'drizzle-orm/node-postgres'
import Redis from 'ioredis'

export const db = drizzle(Bun.env.DATABASE_URL)
export const redis = new Redis(Bun.env.REDIS_URL)
