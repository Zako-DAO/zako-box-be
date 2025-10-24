import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../../db'
import { githubAccounts } from '../../db/schema'
import { jwtMiddleware } from '../../middlewares/jwt'
import { authorize } from './authorize'

export const githubConnections = new Hono()
  .route('/authorize', authorize)
  .use(jwtMiddleware)
  .get('/', async (c) => {
    const jwtPayload = c.get('jwtPayload')! as { user: { internalId: string } }
    const githubAccount = await db.select().from(githubAccounts).where(eq(githubAccounts.userId, jwtPayload.user.internalId)).limit(1)
    if (githubAccount.length === 0) {
      return c.json({ error: 'GitHub account not found' }, 404)
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubAccount[0].accessToken}`,
        },
      })
      const data = await response.json()
      console.log('response', response)
      if (response.status === 401) {
        await db.delete(githubAccounts).where(eq(githubAccounts.userId, jwtPayload.user.internalId))
        return c.json({ error: 'Unauthorized' }, 401)
      }

      return c.json({ data })
    }
    catch (error) {
      console.log('Error fetching GitHub user:', error)
      return c.json({ error: 'Error fetching GitHub user' }, 500)
    }
  })
  .get('/repos', async (c) => {
    const jwtPayload = c.get('jwtPayload')! as { user: { internalId: string } }
    const githubAccount = await db.select().from(githubAccounts).where(eq(githubAccounts.userId, jwtPayload.user.internalId)).limit(1)

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${githubAccount[0].accessToken}`,
        },
      })
      const data = await response.json()

      return c.json({ data })
    }
    catch (error) {
      console.log('Error fetching GitHub repos:', error)
      return c.json({ error: 'Error fetching GitHub repos' }, 500)
    }
  })
  .delete('/', async (c) => {
    const jwtPayload = c.get('jwtPayload')! as { user: { internalId: string } }
    await db.delete(githubAccounts).where(eq(githubAccounts.userId, jwtPayload.user.internalId))

    return c.json({ message: 'GitHub connection deleted' }, 200)
  })
