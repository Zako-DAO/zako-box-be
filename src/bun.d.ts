declare module 'bun' {
  interface Env {
    PORT: number
    JWT_SECRET: string

    REDIS_HOST: string
    REDIS_PORT: number
    REDIS_PASSWORD: string
    REDIS_DB: number

    TEST_ETH_ADDRESS: string
    TEST_ETH_PRIVATE_KEY: string
  }
}
