import type { VercelRequest, VercelResponse } from '@vercel/node'
import { errorMessage, requireSession, statusFromError } from './_lib/http'
import { ensureSeedProject, upsertProject } from './_lib/projectStore'
import { DELIGHT_SEED } from './_lib/delightSeed'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (!requireSession(req, res)) return

  try {
    if (req.method === 'GET') {
      const seeded = await ensureSeedProject(DELIGHT_SEED)
      return res.status(200).json(seeded)
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'object' && req.body ? req.body : {}) as { project?: unknown }
      if (!body.project) return res.status(400).json({ error: 'project가 필요합니다.' })
      const project = await upsertProject(body.project)
      return res.status(200).json({ project })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: '허용되지 않은 메서드입니다.' })
  } catch (error) {
    return res.status(statusFromError(error)).json({ error: errorMessage(error, '프로젝트 처리에 실패했습니다.') })
  }
}
