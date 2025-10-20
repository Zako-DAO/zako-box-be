import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { eq } from 'drizzle-orm'
import { sign } from 'hono/jwt'
import { testClient } from 'hono/testing'
import { signMessage } from 'viem/accounts'
import { db, redis } from '../../db'
import { users } from '../../db/schema'
import { getSessionMessageKey } from '../../utils/redis'
import { generateSessionMessage } from '../../utils/session-message'
import { sessions } from './index'

describe('get session', async () => {
  const client = testClient(sessions)

  it('should return 401 if no session is set', async () => {
    const response = await client.index.$get()
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('should return 401 if cookie is empty', async () => {
    const response = await sessions.request('/', {
      method: 'GET',
      headers: {
        Cookie: 'session=',
      },
    })
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('should return 200 if session is set', async () => {
    const timeSecondNow = Math.floor(Date.now() / 1000)
    const cookie = await sign({
      user: { address: Bun.env.TEST_ETH_ADDRESS, displayName: Bun.env.TEST_ETH_ADDRESS },
      exp: timeSecondNow + 60 * 60 * 24,
      nbf: timeSecondNow,
      iat: timeSecondNow,
      iss: Bun.env.JWT_ISSUER,
    }, Bun.env.JWT_SECRET)

    const response = await sessions.request('/', {
      method: 'GET',
      headers: {
        Cookie: `session=${cookie}`,
      },
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { address: Bun.env.TEST_ETH_ADDRESS, displayName: Bun.env.TEST_ETH_ADDRESS } })
  })
})

describe('create session', async () => {
  const client = testClient(sessions)

  beforeEach(async () => {
    await db.execute('BEGIN;')
  })

  afterEach(async () => {
    await db.execute('ROLLBACK;')
    await redis.flushdb()
  })

  it('should return 400 if address is not provided', async () => {
    const response = await client.index.$post({
      query: {
        signature: 'placeholder',
      },
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Address and signature are required' })
  })

  it('should return 400 if signature is not provided', async () => {
    const response = await client.index.$post({
      query: {
        address: Bun.env.TEST_ETH_ADDRESS,
      },
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Address and signature are required' })
  })

  it('should return 400 if address is not a valid address', async () => {
    const response = await client.index.$post({
      query: {
        address: 'invalid-address',
        signature: 'placeholder',
      },
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid address, or wrong checksum format' })
  })

  it('should return 401 if session message is not found', async () => {
    const message = generateSessionMessage(Bun.env.TEST_ETH_ADDRESS)
    const signature = await signMessage({
      message,
      privateKey: Bun.env.TEST_ETH_PRIVATE_KEY,
    })

    const response = await client.index.$post({
      query: {
        address: Bun.env.TEST_ETH_ADDRESS,
        signature,
      },
    })
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Session message not found' })
  })

  it('should return 400 if signature is not a valid signature', async () => {
    const message = generateSessionMessage(Bun.env.TEST_ETH_ADDRESS)
    const redisKey = getSessionMessageKey(Bun.env.TEST_ETH_ADDRESS)
    await redis.set(redisKey, message)

    const response = await client.index.$post({
      query: {
        address: Bun.env.TEST_ETH_ADDRESS,
        signature: 'invalid-signature',
      },
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid session message signature' })
  })

  it('should return user if address and signature are valid', async () => {
    const [expectedUser] = await db.insert(users).values({ address: Bun.env.TEST_ETH_ADDRESS, displayName: Bun.env.TEST_ETH_ADDRESS }).returning()

    const message = generateSessionMessage(Bun.env.TEST_ETH_ADDRESS)
    const redisKey = getSessionMessageKey(Bun.env.TEST_ETH_ADDRESS)
    await redis.set(redisKey, message)

    const signature = await signMessage({
      message,
      privateKey: Bun.env.TEST_ETH_PRIVATE_KEY,
    })

    const response = await client.index.$post({
      query: {
        address: Bun.env.TEST_ETH_ADDRESS,
        signature,
      },
    })
    expect(response.status).toBe(200)
    expect(await response.text()).toEqual(JSON.stringify({ data: expectedUser }))
  })

  it('should create and return user if it does not exist', async () => {
    const message = generateSessionMessage(Bun.env.TEST_ETH_ADDRESS)
    await redis.set(getSessionMessageKey(Bun.env.TEST_ETH_ADDRESS), message)

    const signature = await signMessage({
      message,
      privateKey: Bun.env.TEST_ETH_PRIVATE_KEY,
    })

    const response = await client.index.$post({
      query: {
        address: Bun.env.TEST_ETH_ADDRESS,
        signature,
      },
    })
    expect(response.status).toBe(200)

    const body = await response.json()
    expect('error' in body).toBeFalse()
    expect('data' in body).toBeTrue()

    if (!('data' in body)) {
      return
    }

    expect(body.data.address).toEqual(Bun.env.TEST_ETH_ADDRESS)
    expect(body.data.displayName).toEqual(Bun.env.TEST_ETH_ADDRESS)
    expect(await db.select().from(users).where(eq(users.address, Bun.env.TEST_ETH_ADDRESS))).toEqual([{
      address: Bun.env.TEST_ETH_ADDRESS,
      displayName: Bun.env.TEST_ETH_ADDRESS,
      internalId: body.data.internalId,
      createdAt: new Date(body.data.createdAt),
      updatedAt: new Date(body.data.updatedAt),
    }])
    expect(response.headers.get('Set-Cookie')).toContain('session=')
  })
})
