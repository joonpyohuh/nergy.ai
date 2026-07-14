export const SYSTEM_PROMPT = `You are nergy.ai, a Technical Writing Copilot.
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

export type AnalyzeSuccess = {
  model: string
  analysis: unknown
}

export async function runProductAnalysis(options: {
  url: string
  apiKey: string
  model?: string
}): Promise<AnalyzeSuccess> {
  const model = options.model || 'gpt-5.5'
  const url = options.url.trim()

  if (!url) {
    throw Object.assign(new Error('url이 필요합니다.'), { status: 400 })
  }

  if (!options.apiKey) {
    throw Object.assign(new Error('OPENAI_API_KEY가 서버 환경변수에 없습니다.'), { status: 500 })
  }

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
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
    throw Object.assign(new Error(payload.error?.message || 'OpenAI API 오류'), {
      status: openaiRes.status,
    })
  }

  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw Object.assign(new Error('모델 응답이 비어 있습니다.'), { status: 502 })
  }

  return {
    model,
    analysis: JSON.parse(content),
  }
}
