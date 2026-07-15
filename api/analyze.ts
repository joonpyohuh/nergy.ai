import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireSession } from './_lib/http.js'

// OpenAI 호출이 25~50초 걸리므로 Edge(25초 응답 제한)가 아닌 Node 런타임을 사용한다.
// maxDuration은 vercel.json의 functions 설정에서 60초로 지정.

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST만 지원합니다.' })
  }

  if (!requireSession(req, res)) return

  try {
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'gpt-5.5'

    if (!apiKey) {
      return res.status(500).json({
        error:
          'OPENAI_API_KEY가 Vercel 환경변수에 없습니다. Project Settings → Environment Variables에서 Production에 추가한 뒤 Redeploy 하세요. (VITE_ 접두사 없이)',
      })
    }

    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as { url?: string }
    const url = (body.url || '').trim()
    if (!url) {
      return res.status(400).json({ error: 'url이 필요합니다.' })
    }

    // 플랫폼 타임아웃(60초)보다 먼저 JSON 에러로 응답하기 위한 자체 제한.
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(55_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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
      return res.status(openaiRes.status).json({
        error: payload.error?.message || `OpenAI API 오류 (HTTP ${openaiRes.status})`,
      })
    }

    const content = payload.choices?.[0]?.message?.content
    if (!content) {
      return res.status(502).json({ error: '모델 응답이 비어 있습니다.' })
    }

    let analysis: unknown
    try {
      analysis = JSON.parse(content)
    } catch {
      return res.status(502).json({ error: '모델이 유효한 JSON을 반환하지 않았습니다.' })
    }

    return res.status(200).json({ model, analysis })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    return res.status(timedOut ? 504 : 500).json({
      error: timedOut
        ? '분석이 55초를 초과했습니다. 잠시 후 다시 시도해 주세요.'
        : error instanceof Error
          ? error.message
          : '분석 중 오류가 발생했습니다.',
    })
  }
}
