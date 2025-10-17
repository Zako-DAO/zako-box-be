import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
}
