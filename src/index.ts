import type { MiddlewareHandler } from 'hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { githubOAuth, sessions } from './handlers'
import { sessionMessages } from './handlers/session-message'
import './db'

if (!Bun.env.JWT_SECRET || !Bun.env.JWT_ISSUER) {
  throw new Error('JWT_SECRET and JWT_ISSUER are required')
}

function corsMiddleware() {
  if (Bun.env.BUN_ENV === 'development') {
    return cors()
  }

  return ((_, next) => next()) satisfies MiddlewareHandler
}

const app = new Hono()
  .basePath('/api/v1')
  .use(logger())
  .use(corsMiddleware())
  .route('/sessions', sessions)
  .route('/session-messages', sessionMessages)
  .route('/github-oauth', githubOAuth)

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
}
