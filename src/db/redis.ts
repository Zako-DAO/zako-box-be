import Redis from 'ioredis'

export const redisClient = new Redis(Bun.env.REDIS_PORT, Bun.env.REDIS_HOST, {
  password: Bun.env.REDIS_PASSWORD,
  db: Bun.env.REDIS_DB,
})

redisClient.hello().then()
