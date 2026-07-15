import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'nergy_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || ''
  if (!secret) {
    throw Object.assign(new Error('SESSION_SECRET이 설정되지 않았습니다.'), { status: 500 })
  }
  return secret
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromB64url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return Buffer.from(padded + pad, 'base64')
}

function sign(payloadB64: string, secret: string): string {
  return b64url(createHmac('sha256', secret).update(payloadB64).digest())
}

export function createSessionToken(now = Date.now()): string {
  const secret = getSessionSecret()
  const payloadB64 = b64url(JSON.stringify({ exp: now + SESSION_TTL_MS }))
  return `${payloadB64}.${sign(payloadB64, secret)}`
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token || !token.includes('.')) return false
  try {
    const secret = getSessionSecret()
    const [payloadB64, signature] = token.split('.')
    if (!payloadB64 || !signature) return false
    const expected = sign(payloadB64, secret)
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const payload = JSON.parse(fromB64url(payloadB64).toString('utf8')) as { exp?: number }
    return typeof payload.exp === 'number' && payload.exp > now
  } catch {
    return false
  }
}

export function timingSafePasswordEqual(input: string, expected: string): boolean {
  const a = Buffer.from(input)
  const b = Buffer.from(expected)
  if (a.length !== b.length) {
    // still run a compare to reduce trivial timing differences on length
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32))
    return false
  }
  return timingSafeEqual(a, b)
}

export function parseCookieHeader(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=')
    if (rawKey === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function sessionCookieHeader(token: string, maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000)): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    ...(secure ? ['Secure'] : []),
  ].join('; ')
}

export function clearSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  return [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(secure ? ['Secure'] : []),
  ].join('; ')
}

export function getTeamPassword(): string {
  const password = process.env.TEAM_PASSWORD || ''
  if (!password) {
    throw Object.assign(new Error('TEAM_PASSWORD가 설정되지 않았습니다.'), { status: 500 })
  }
  return password
}
