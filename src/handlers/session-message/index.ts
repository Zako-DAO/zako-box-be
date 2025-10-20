import { redis } from 'bun'
import { Hono } from 'hono'
import { isAddress } from 'viem'
import { getSessionMessageKey } from '../../utils/redis'

export const sessionMessages = new Hono()
  .post('/', async (c) => {
    const address = c.req.query('address')
    if (!address) {
      return c.json({ error: 'Address is required' }, 400)
    }

    if (!isAddress(address)) {
      return c.json({ error: 'Invalid address, or wrong checksum format' }, 400)
    }

    const message = `Welcome to ZakoBox/ZakoPako!

Sign in with your wallet to continue. This request will not trigger a blockchain transaction or cost any gas fees.

Your address is ${address} and this message is valid for 1 minute.`

    await redis.setex(getSessionMessageKey(address), 60, message)

    return c.json({ data: message })
  })
