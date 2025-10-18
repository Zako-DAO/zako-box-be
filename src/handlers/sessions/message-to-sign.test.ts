import { describe, expect, it } from 'bun:test'

import { testClient } from 'hono/testing'
import { messageToSign } from './message-to-sign'
import { redisClient } from '../../db/redis'

describe('get message to sign', async () => {
  const client = testClient(messageToSign)

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

    const expectedMessage = `Welcome to ZakoBox/ZakoPako!

Sign in with your wallet to continue. This request will not trigger a blockchain transaction or cost any gas fees.

Your address is 0x5b31d41b0a3de9225d571f3df47499e3f5b3d09c and this message is valid for 1 minute.`

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: expectedMessage })

    const message = await redisClient.getdel(`session:message:${Bun.env.TEST_ETH_ADDRESS}`)
    expect(message).toEqual(expectedMessage)
  })
})
