import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readSessionToken } from '../_lib/http'
import { verifySessionToken } from '../_lib/session'
import { errorMessage, statusFromError } from '../_lib/http'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'GET만 지원합니다.' })
  }
  try {
    const ok = verifySessionToken(readSessionToken(req))
    return res.status(ok ? 200 : 401).json({ authenticated: ok })
  } catch (error) {
    return res.status(statusFromError(error)).json({ authenticated: false, error: errorMessage(error, '세션 확인 실패') })
  }
}
