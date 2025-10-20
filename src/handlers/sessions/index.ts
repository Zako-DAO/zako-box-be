import { Hono } from 'hono'
import { jwtMiddleware } from '../../middlewares/jwt'
import { isAddress, parseSignature, verifyMessage } from 'viem'
import { db } from '../../db'
import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'
import { redis } from 'bun'
import { getSessionMessageKey } from '../../utils/redis'
import { sign, JwtVariables } from 'hono/jwt'
import { setCookie } from 'hono/cookie'

export const sessions = new Hono<{ Variables: JwtVariables }>()
  .use(jwtMiddleware)
  .get('/', (c) => {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    return c.json({ data: jwtPayload })
  })
  .post('/', async (c) => {
    const address = c.req.query('address')
    const signedMessage = c.req.query('signed_message') as `0x${string}`

    if (!address || !signedMessage) {
      return c.json({ error: 'Address and signed message are required' }, 400)
    }

    if (!isAddress(address)) {
      return c.json({ error: 'Invalid address, or wrong checksum format' }, 400)
    }

    const rawMessage = await redis.get(getSessionMessageKey(address))
    if (!rawMessage) {
      return c.json({ error: 'Session message not found' }, 400)
    }

    const verified = await verifyMessage({
      address,
      message: rawMessage,
      signature: parseSignature(signedMessage),
    })
    if (!verified) {
      return c.json({ error: 'Invalid session message signature' }, 400)
    }

    const usersResult = await db.select().from(users).where(eq(users.address, address)).limit(1)
    if (usersResult.length === 0) {
      await db.insert(users).values({
        address,
        displayName: address,
      })
    }

    const user = usersResult[0]

    const timeSecondNow = Math.floor(Date.now() / 1000)
    setCookie(c, 'session', await sign({
      user: user,
      exp: timeSecondNow + 60 * 60 * 24,
      nbf: timeSecondNow,
      iat: timeSecondNow,
      iss: Bun.env.JWT_ISSUER,
    }, Bun.env.JWT_SECRET))

    return c.json({ data: user })
  })
