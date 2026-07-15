import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookieHeader } from '../_lib/session'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST만 지원합니다.' })
  }
  res.setHeader('Set-Cookie', clearSessionCookieHeader())
  return res.status(200).json({ ok: true })
}
