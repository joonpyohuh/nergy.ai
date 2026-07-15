import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createSessionToken,
  getTeamPassword,
  sessionCookieHeader,
  timingSafePasswordEqual,
} from '../_lib/session.js'
import { errorMessage, statusFromError } from '../_lib/http.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST만 지원합니다.' })
  }

  try {
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as { password?: string }
    const password = String(body.password || '')
    const expected = getTeamPassword()
    if (!timingSafePasswordEqual(password, expected)) {
      return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' })
    }
    const token = createSessionToken()
    res.setHeader('Set-Cookie', sessionCookieHeader(token))
    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(statusFromError(error)).json({ error: errorMessage(error, '로그인에 실패했습니다.') })
  }
}
