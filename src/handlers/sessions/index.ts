import type { JwtVariables } from 'hono/jwt'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { isAddress, verifyMessage } from 'viem'
import { db, redis } from '../../db'
import { users } from '../../db/schema'
import { getSessionMessageKey } from '../../utils/redis'

export const sessions = new Hono<{ Variables: JwtVariables }>()
  .get('/', async (c) => {
    const cookie = c.req.header('Cookie')
    if (!cookie) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const session = cookie.split('; ').find(cookie => cookie.startsWith('session='))?.split('=')[1]
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const jwtPayload = await verify(session, Bun.env.JWT_SECRET)

    return c.json({ data: jwtPayload.user })
  })
  .post('/', async (c) => {
    const body = await c.req.json()
    const address = body.address as `0x${string}`
    const signature = body.signature as `0x${string}`

    if (!address || !signature) {
      return c.json({ error: 'Address and signature are required' }, 400)
    }

    if (!isAddress(address)) {
      return c.json({ error: 'Invalid address, or wrong checksum format' }, 400)
    }

    const rawMessage = (await redis.get(getSessionMessageKey(address))) as `0x${string}`
    if (!rawMessage) {
      return c.json({ error: 'Session message not found' }, 404)
    }

    let verified = false
    try {
      verified = await verifyMessage({
        address,
        message: { raw: rawMessage },
        signature,
      })
    }
    catch {
      return c.json({ error: 'Invalid session message signature' }, 400)
    }

    if (!verified) {
      return c.json({ error: 'Invalid session message signature' }, 400)
    }

    let usersResult = await db.select().from(users).where(eq(users.address, address)).limit(1)
    if (usersResult.length === 0) {
      usersResult = await db.insert(users).values({
        address,
        displayName: address,
      }).returning()
    }

    const user = usersResult[0]

    const timeSecondNow = Math.floor(Date.now() / 1000)
    const jwt = await sign({
      user,
      exp: timeSecondNow + 60 * 60 * 24,
      nbf: timeSecondNow,
      iat: timeSecondNow,
      iss: Bun.env.JWT_ISSUER,
    }, Bun.env.JWT_SECRET)
    setCookie(c, 'session', jwt, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: 'strict',
    })

    return c.json({ data: user }, 201)
  })
  .delete('/', async (c) => {
    deleteCookie(c, 'session')
    return c.json({ data: 'Session deleted' }, 200)
  })
