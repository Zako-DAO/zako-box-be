import type { MiddlewareHandler } from 'hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sessions } from './handlers'
import { githubConnections } from './handlers/github-connections'
import { sessionMessages } from './handlers/session-message'
import './db'

const requiredEnvVars = ['JWT_SECRET', 'JWT_ISSUER', 'DATABASE_URL', 'REDIS_URL', 'GITHUB_OAUTH_CLIENT_ID', 'GITHUB_OAUTH_CLIENT_SECRET']
for (const envVar of requiredEnvVars) {
  if (!Bun.env[envVar]) {
    throw new Error(`${envVar} is required`)
  }
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
  .route('/github-connections', githubConnections)

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
}
