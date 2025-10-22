import { toHex } from 'viem'

export function generateSessionMessage(address: string) {
  return toHex(`Welcome to ZakoBox/ZakoPako!

Sign in with your wallet to continue. This request will not trigger a blockchain transaction or cost any gas fees.

Your address is ${address} and this message is valid for 1 minute. Now is ${new Date().toISOString()}.`)
}
