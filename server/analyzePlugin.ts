import type { Plugin } from 'vite'
import { loadEnv } from 'vite'

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const SYSTEM_PROMPT = `You are nergy.ai, a Technical Writing Copilot.
Analyze the given product URL using publicly known information about that product.
Return ONLY valid JSON with this shape:
{
  "name": "Product name",
  "description": "One-line product summary in Korean",
  "nodes": [
    {
      "id": "slug",
      "step": "01",
      "title": "short Korean title",
      "plain": "plain-language Korean summary",
      "detail": "2-3 sentence Korean explanation",
      "example": "concrete Korean example",
      "color": "#3182F6"
    }
  ],
  "docs": [
    {
      "id": "slug",
      "title": "document title in Korean",
      "kind": "API reference | How-to guide | Concept guide | Operations guide | UX behavior spec | Workflow reference",
      "audience": "모두 | 개발자 | 운영팀 | 마케터·디자이너",
      "reason": "why this doc matters, Korean",
      "outline": ["section 1", "section 2"],
      "evidence": "DOCS | SPEC | CONFIRM",
      "nodeId": "matching node id"
    }
  ],
  "sources": [
    {
      "title": "source title",
      "url": "https://...",
      "date": "확인: YYYY.MM.DD",
      "note": "what this source supports, Korean"
    }
  ]
}
Rules:
- Create 5-8 logic nodes that explain the product flow for writers.
- Create 5-8 high-value documentation suggestions linked to nodes.
- Prefer DOCS when publicly documented; use CONFIRM when internals must be verified.
- Write Korean for human-facing fields (title, plain, detail, example, reason, description, note).
- If the product is unknown, still produce a best-effort analysis and mark uncertain docs as CONFIRM.
- sources should include the analyzed URL and any plausible public pages.`

export function analyzeApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    name: 'nergy-analyze-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/analyze') || req.method !== 'POST') {
          next()
          return
        }

        try {
          const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY
          const model = env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-5.5'

          if (!apiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'OPENAI_API_KEY가 .env에 없습니다.' }))
            return
          }

          const raw = await readBody(req)
          const body = JSON.parse(raw || '{}') as { url?: string }
          const url = (body.url || '').trim()

          if (!url) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'url이 필요합니다.' }))
            return
          }

          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                  role: 'user',
                  content: `Analyze this product URL and build a technical-writing workspace:\n${url}\nToday is 2026-07-14.`,
                },
              ],
            }),
          })

          const payload = (await openaiRes.json()) as {
            error?: { message?: string }
            choices?: Array<{ message?: { content?: string } }>
          }

          if (!openaiRes.ok) {
            res.statusCode = openaiRes.status
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: payload.error?.message || 'OpenAI API 오류' }))
            return
          }

          const content = payload.choices?.[0]?.message?.content
          if (!content) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: '모델 응답이 비어 있습니다.' }))
            return
          }

          const analysis = JSON.parse(content)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ model, analysis }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
            }),
          )
        }
      })
    },
  }
}
