import { afterAll, beforeAll, describe, expect, it, jest } from 'bun:test'

import { testClient } from 'hono/testing'
import { redis } from '../../db'
import { getSessionMessageKey } from '../../utils/redis'
import { generateSessionMessage } from '../../utils/session-message'
import { sessionMessages } from './index'

describe('create session message', async () => {
  const client = testClient(sessionMessages)

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should return 400 if address is not provided', async () => {
    const response = await client.index.$post()
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Address is required' })
  })

  it('should return 400 if address is not a valid address', async () => {
    const response = await client.index.$post({
      query: {
        address: 'invalid-address',
      },
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid address, or wrong checksum format' })
  })

  it('should return message if address is a valid address', async () => {
    const response = await client.index.$post({
      query: {
        address: Bun.env.TEST_ETH_ADDRESS,
      },
    })

    const expectedMessage = generateSessionMessage(Bun.env.TEST_ETH_ADDRESS)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: expectedMessage })

    const message = await redis.getdel(getSessionMessageKey(Bun.env.TEST_ETH_ADDRESS))
    expect(message).toEqual(expectedMessage)
  })
})
