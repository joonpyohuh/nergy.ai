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
      "plain": "plain-language Korean one-liner",
      "detail": "1-2 short Korean sentences",
      "example": "concrete Korean example, one sentence",
      "color": "#3182F6",
      "inputs": ["what this part receives, Korean"],
      "outputs": ["what this part produces, Korean"],
      "evidence": "DOCS | SPEC | CONFIRM",
      "roleExplanations": {
        "marketer": { "summary": "...", "whyItMatters": "...", "keyQuestions": ["...", "..."] },
        "designer": { "summary": "...", "whyItMatters": "...", "keyQuestions": ["...", "..."] },
        "developer": { "summary": "...", "whyItMatters": "...", "keyQuestions": ["...", "..."] },
        "operator": { "summary": "...", "whyItMatters": "...", "keyQuestions": ["...", "..."] }
      }
    }
  ],
  "edges": [
    {
      "id": "slug",
      "source": "source node id",
      "target": "target node id",
      "label": "short Korean connection label",
      "type": "data | event | decision | control | handoff | feedback",
      "summary": "why these two parts connect, Korean",
      "trigger": "which condition or event starts this connection, Korean",
      "transferredData": ["items that move through this connection"],
      "successCondition": "one Korean sentence",
      "risks": ["short Korean risk"],
      "evidence": "DOCS | SPEC | CONFIRM",
      "documentationOpportunities": ["needed doc title"]
    }
  ],
  "docs": [
    {
      "id": "slug",
      "title": "document title in Korean",
      "kind": "API reference | How-to guide | Concept guide | Operations guide | UX behavior spec | Workflow reference",
      "audience": "모두 | 개발자 | 운영팀 | 마케터·디자이너",
      "reason": "why this doc matters, Korean, one sentence",
      "outline": ["section 1", "section 2"],
      "evidence": "DOCS | SPEC | CONFIRM",
      "nodeId": "matching node id"
    }
  ],
  "sources": [
    { "title": "source title", "url": "https://...", "date": "확인: YYYY.MM.DD", "note": "what this source supports, Korean" }
  ]
}
Rules:
- Create 4-6 logic nodes and 5-9 meaningful edges between them.
- Do NOT simply chain all nodes in a line. Only create edges that public materials can explain.
- If feedback loops, validation, or human handoff exist, express them as separate edges.
- Mark any edge that guesses internal implementation as CONFIRM. Never state guesses as facts.
- Role explanations must differ by role, not be translations of each other:
  marketer = business and customer-experience meaning; designer = user-facing states and interactions;
  developer = data, APIs, states, failure conditions; operator = policies, approvals, monitoring, exceptions.
- Write natural Korean for all human-facing fields. Prefer short, concrete sentences.
- Keep every string under 90 characters. Keep arrays small: inputs/outputs 2-3, keyQuestions 2, transferredData 3-4, risks 1-2.
- Create 4-6 documentation suggestions linked to nodes.
- Prefer DOCS when publicly documented; use CONFIRM when internals must be verified.
- If the product is unknown, still produce a best-effort analysis and mark uncertain items as CONFIRM.
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
    signal: AbortSignal.timeout(50_000),
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      reasoning_effort: 'low',
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
