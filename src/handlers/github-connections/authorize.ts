import { redis } from 'bun'
import { githubAuth } from '@hono/oauth-providers/github'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'
import { db } from '../../db'
import { githubAccounts } from '../../db/schema'
import { getGitHubOAuthStateKey } from '../../utils/redis'

export const authorize = new Hono()
  .get('/', async (c, next) => {
    const queryParams = new URLSearchParams()
    if (!getCookie(c, 'state_uuid')) {
      const session = getCookie(c, 'session')
      if (!session) {
        console.log('Session is not set but try to connect to GitHub OAuth')
        return c.redirect('/')
      }

      let user: { internalId: string }

      try {
        user = (await verify(session, Bun.env.JWT_SECRET) as { user: { internalId: string } }).user
      }
      catch (error) {
        console.log('Error verifying session:', error)
        return c.redirect('/')
      }

      if (!user.internalId) {
        console.log('User internal ID is not set')
        return c.redirect('/')
      }

      const stateUuid = crypto.randomUUID()
      c.set('stateUuid', stateUuid)
      setCookie(c, 'state_uuid', stateUuid)
      queryParams.set('state_uuid', stateUuid)

      try {
        await redis.setex(getGitHubOAuthStateKey(stateUuid), 3600, user.internalId)
      }
      catch (error) {
        console.log('Error setting GitHub OAuth state:', error)
        throw new HTTPException(500)
      }
    }

    const auth = githubAuth({
      client_id: Bun.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: Bun.env.GITHUB_OAUTH_CLIENT_SECRET,
      redirect_uri: `${Bun.env.BASE_URL}/api/v1/github-connections/authorize?${queryParams.toString()}`,
      scope: ['read:user', 'public_repo', 'user:email'],
      oauthApp: true,
    })

    return auth(c, next)
  }, async (c) => {
    const stateUuid = getCookie(c, 'state_uuid')
    if (!stateUuid) {
      console.log('State UUID is invalid')
      throw new HTTPException(401)
    }

    const githubUser = c.get('user-github')!
    const accessToken = c.get('token')!

    let userInternalId: string | null = null
    try {
      userInternalId = await redis.get(getGitHubOAuthStateKey(stateUuid))
      await redis.del(getGitHubOAuthStateKey(stateUuid))
      deleteCookie(c, 'state_uuid')
    }
    catch (error) {
      console.log('Error getting GitHub OAuth state:', error)
      throw new HTTPException(500)
    }

    if (!userInternalId) {
      console.log('User internal ID is not set')
      throw new HTTPException(401)
    }

    await db.insert(githubAccounts).values({
      userId: userInternalId,
      githubId: String(githubUser.id),
      accessToken: accessToken.token,
    }).onConflictDoUpdate({
      target: [githubAccounts.userId],
      set: {
        accessToken: accessToken.token,
      },
    })

    return c.redirect('/')
  })

declare module 'hono' {
  interface ContextVariableMap {
    stateUuid: string
  }
}
