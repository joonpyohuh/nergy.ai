import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runProductAnalysis } from '../server/analyzeCore'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST만 지원합니다.' })
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'gpt-5.5'
    const url = typeof req.body?.url === 'string' ? req.body.url : ''

    const result = await runProductAnalysis({ url, apiKey: apiKey || '', model })
    return res.status(200).json(result)
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 500
    const message = error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.'
    return res.status(Number.isFinite(status) ? status : 500).json({ error: message })
  }
}
