import { Hono } from 'hono'
import { messageToSign } from './message-to-sign'

export const sessions = new Hono()
  .route('/message-to-sign', messageToSign)
  .get('/', (c) => {
    return c.text('Hello World')
  })
