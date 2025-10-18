import { Hono } from 'hono'
import { githubOAuth, sessions } from './handlers'
import './db'

const app = new Hono()
  .route('/sessions', sessions)
  .route('/github-oauth', githubOAuth)

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
}
