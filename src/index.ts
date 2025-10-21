import { Hono } from 'hono'
import { githubOAuth, sessions } from './handlers'
import { sessionMessages } from './handlers/session-message'
import './db'

if (!Bun.env.JWT_SECRET || !Bun.env.JWT_ISSUER) {
  throw new Error('JWT_SECRET and JWT_ISSUER are required')
}

const app = new Hono()
  .basePath('/api/v1')
  .route('/sessions', sessions)
  .route('/session-messages', sessionMessages)
  .route('/github-oauth', githubOAuth)

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
}
