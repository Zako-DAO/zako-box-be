declare module 'bun' {
  interface Env {
    PORT: number
    JWT_SECRET: string
    JWT_ISSUER: string

    DATABASE_URL: string
    REDIS_URL: string

    TEST_ETH_ADDRESS: `0x${string}`
    TEST_ETH_PRIVATE_KEY: `0x${string}`

    BUN_ENV: 'development' | 'production' | 'staging' | 'testing'

    GITHUB_OAUTH_CLIENT_ID: string
    GITHUB_OAUTH_CLIENT_SECRET: string
  }
}
