import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { runProductAnalysis } from './analyzeCore'

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

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
          const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''
          const model = env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-5.5'
          const raw = await readBody(req)
          const body = JSON.parse(raw || '{}') as { url?: string }
          const result = await runProductAnalysis({
            url: body.url || '',
            apiKey,
            model,
          })

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(result))
        } catch (error) {
          const status =
            typeof error === 'object' && error && 'status' in error
              ? Number((error as { status: number }).status)
              : 500
          res.statusCode = Number.isFinite(status) ? status : 500
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
