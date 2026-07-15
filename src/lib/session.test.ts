import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createSessionToken,
  timingSafePasswordEqual,
  verifySessionToken,
} from '../../api/_lib/session'

describe('session tokens', () => {
  afterEach(() => {
    delete process.env.SESSION_SECRET
    delete process.env.TEAM_PASSWORD
  })

  it('creates and verifies a signed session token', () => {
    process.env.SESSION_SECRET = 'test-secret-value-123456'
    const token = createSessionToken(1_000_000)
    expect(verifySessionToken(token, 1_000_000)).toBe(true)
    expect(verifySessionToken(token, 1_000_000 + 40 * 24 * 60 * 60 * 1000)).toBe(false)
  })

  it('rejects tampered tokens', () => {
    process.env.SESSION_SECRET = 'test-secret-value-123456'
    const token = createSessionToken()
    const [payload] = token.split('.')
    const badSig = createHmac('sha256', 'other').update(payload).digest('base64url')
    expect(verifySessionToken(`${payload}.${badSig}`)).toBe(false)
    expect(verifySessionToken('not-a-token')).toBe(false)
  })

  it('compares passwords in constant-ish fashion', () => {
    expect(timingSafePasswordEqual('abc', 'abc')).toBe(true)
    expect(timingSafePasswordEqual('abc', 'abd')).toBe(false)
    expect(timingSafePasswordEqual('abc', 'abcd')).toBe(false)
  })
})
