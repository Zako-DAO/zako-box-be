import { describe, expect, it } from 'bun:test'

import { testClient } from 'hono/testing'
import { sessions } from './index'
import { redis } from 'bun'
import { getSessionMessageKey } from '../../utils/redis'
import { sign } from 'viem/accounts'

describe('get message to sign', async () => {
  const client = testClient(sessions)

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

  it('should return 401 if session message is not found', async () => {
    const signedMessage = sign({})

    const response = await client.index.$post({
      query: {
        address: '0x5b31d41b0a3de9225d571f3df47499e3f5b3d09c',
      },
    })
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Session message not found' })
  })
})
