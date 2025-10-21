import { afterAll, beforeAll, describe, expect, it, jest } from 'bun:test'

import { redis } from '../../db'
import { getSessionMessageKey } from '../../utils/redis'
import { generateSessionMessage } from '../../utils/session-message'
import { sessionMessages } from './index'

describe('create session message', async () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should return 400 if address is not provided', async () => {
    const response = await sessionMessages.request(new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({}),
    }))
    expect(await response.json()).toEqual({ error: 'Address is required' })
    expect(response.status).toBe(400)
  })

  it('should return 400 if address is not a valid address', async () => {
    const response = await sessionMessages.request(new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({
        address: 'invalid-address',
      }),
    }))
    expect(await response.json()).toEqual({ error: 'Invalid address, or wrong checksum format' })
    expect(response.status).toBe(400)
  })

  it('should return message if address is a valid address', async () => {
    const response = await sessionMessages.request(new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({
        address: Bun.env.TEST_ETH_ADDRESS,
      }),
    }))

    const expectedMessage = generateSessionMessage(Bun.env.TEST_ETH_ADDRESS)
    expect(await response.json()).toEqual({ data: expectedMessage })

    const message = await redis.getdel(getSessionMessageKey(Bun.env.TEST_ETH_ADDRESS))
    expect(message).toEqual(expectedMessage)

    expect(response.status).toBe(200)
  })
})
