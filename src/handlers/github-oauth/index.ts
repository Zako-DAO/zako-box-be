import { Hono } from 'hono'
import { jwtMiddleware } from '../../middlewares/jwt'

export const githubOAuth = new Hono()
  .use(jwtMiddleware)
  .get('/', (c) => {
    return c.text('Not implemented yet')
  })
