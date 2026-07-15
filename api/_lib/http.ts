import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  SESSION_COOKIE,
  parseCookieHeader,
  verifySessionToken,
} from './session.js'

export function readSessionToken(req: VercelRequest): string | null {
  const fromCookies = req.cookies?.[SESSION_COOKIE]
  if (fromCookies) return fromCookies
  return parseCookieHeader(req.headers.cookie, SESSION_COOKIE)
}

export function requireSession(req: VercelRequest, res: VercelResponse): boolean {
  const token = readSessionToken(req)
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: '로그인이 필요합니다.' })
    return false
  }
  return true
}

export function statusFromError(error: unknown): number {
  if (typeof error === 'object' && error && 'status' in error) {
    const status = Number((error as { status: number }).status)
    if (Number.isFinite(status)) return status
  }
  return 500
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
