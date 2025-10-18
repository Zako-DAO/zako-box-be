import { Hono } from 'hono'

export const githubOAuth = new Hono()
  .get('/', (c) => {
  return c.text('Not implemented yet')
})
