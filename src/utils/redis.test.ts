import { expect, test } from 'bun:test'
import { getGitHubOAuthStateKey, getSessionMessageKey } from './redis'

test('getGitHubOAuthStateKey', () => {
  expect(getGitHubOAuthStateKey('123')).toBe('github:oauth:state:123')
  expect(getGitHubOAuthStateKey('456')).toBe('github:oauth:state:456')
})

test('getSessionMessageKey', () => {
  expect(getSessionMessageKey('0x123')).toBe('session:message:0x123')
  expect(getSessionMessageKey('0x456')).toBe('session:message:0x456')
})
