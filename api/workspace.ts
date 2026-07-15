import type { VercelRequest, VercelResponse } from '@vercel/node'
import { errorMessage, requireSession, statusFromError } from './_lib/http.js'
import { setActiveProjectId } from './_lib/projectStore.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (!requireSession(req, res)) return

  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ error: 'PUT만 지원합니다.' })
  }

  try {
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as { activeProjectId?: string | null }
    await setActiveProjectId(body.activeProjectId ?? null)
    return res.status(200).json({ ok: true, activeProjectId: body.activeProjectId ?? null })
  } catch (error) {
    return res.status(statusFromError(error)).json({ error: errorMessage(error, '워크스페이스 저장에 실패했습니다.') })
  }
}
