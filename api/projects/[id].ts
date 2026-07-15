import type { VercelRequest, VercelResponse } from '@vercel/node'
import { errorMessage, requireSession, statusFromError } from '../_lib/http.js'
import { deleteProject, upsertProject } from '../_lib/projectStore.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (!requireSession(req, res)) return

  const id = typeof req.query.id === 'string' ? req.query.id : Array.isArray(req.query.id) ? req.query.id[0] : ''
  if (!id) return res.status(400).json({ error: 'id가 필요합니다.' })

  try {
    if (req.method === 'PUT') {
      const body = (typeof req.body === 'object' && req.body ? req.body : {}) as { project?: unknown }
      if (!body.project) return res.status(400).json({ error: 'project가 필요합니다.' })
      const incoming = body.project as { id?: string }
      if (incoming.id && incoming.id !== id) {
        return res.status(400).json({ error: '경로 id와 본문 id가 일치하지 않습니다.' })
      }
      const project = await upsertProject({ ...(body.project as object), id })
      return res.status(200).json({ project })
    }

    if (req.method === 'DELETE') {
      await deleteProject(id)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'PUT, DELETE')
    return res.status(405).json({ error: '허용되지 않은 메서드입니다.' })
  } catch (error) {
    return res.status(statusFromError(error)).json({ error: errorMessage(error, '프로젝트 처리에 실패했습니다.') })
  }
}
