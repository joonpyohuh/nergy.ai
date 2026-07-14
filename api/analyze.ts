export const config = {
  runtime: 'edge',
  maxDuration: 60,
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

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json(405, { error: 'POST만 지원합니다.' })
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'gpt-5.5'

    if (!apiKey) {
      return json(500, {
        error:
          'OPENAI_API_KEY가 Vercel 환경변수에 없습니다. Project Settings → Environment Variables에서 Production에 추가한 뒤 Redeploy 하세요. (VITE_ 접두사 없이)',
      })
    }

    let body: { url?: string } = {}
    try {
      body = (await request.json()) as { url?: string }
    } catch {
      return json(400, { error: '요청 body가 올바른 JSON이 아닙니다.' })
    }

    const url = (body.url || '').trim()
    if (!url) {
      return json(400, { error: 'url이 필요합니다.' })
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
      return json(openaiRes.status, {
        error: payload.error?.message || `OpenAI API 오류 (HTTP ${openaiRes.status})`,
      })
    }

    const content = payload.choices?.[0]?.message?.content
    if (!content) {
      return json(502, { error: '모델 응답이 비어 있습니다.' })
    }

    let analysis: unknown
    try {
      analysis = JSON.parse(content)
    } catch {
      return json(502, { error: '모델이 유효한 JSON을 반환하지 않았습니다.' })
    }

    return json(200, { model, analysis })
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
    })
  }
}
