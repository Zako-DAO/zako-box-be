import { Hono } from 'hono'
import { isAddress } from 'viem'
import { redis } from '../../db'
import { getSessionMessageKey } from '../../utils/redis'
import { generateSessionMessage } from '../../utils/session-message'

export const sessionMessages = new Hono()
  .post('/', async (c) => {
    const address = c.req.query('address')
    if (!address) {
      return c.json({ error: 'Address is required' }, 400)
    }

    if (!isAddress(address)) {
      return c.json({ error: 'Invalid address, or wrong checksum format' }, 400)
    }

    const message = generateSessionMessage(address)

    await redis.setex(getSessionMessageKey(address), 60, message)

    return c.json({ data: message })
  })
