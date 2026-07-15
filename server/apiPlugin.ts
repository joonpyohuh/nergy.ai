import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { runProductAnalysis } from './analyzeCore'
import {
  SESSION_COOKIE,
  clearSessionCookieHeader,
  createSessionToken,
  getTeamPassword,
  parseCookieHeader,
  sessionCookieHeader,
  timingSafePasswordEqual,
  verifySessionToken,
} from '../api/_lib/session'
import { ensureSeedProject, upsertProject, deleteProject, setActiveProjectId } from '../api/_lib/projectStore'
import { DELIGHT_SEED } from '../api/_lib/delightSeed'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown, headers?: Record<string, string>) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (headers) {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  }
  res.end(JSON.stringify(body))
}

function requireLocalSession(req: IncomingMessage, res: ServerResponse): boolean {
  try {
    const token = parseCookieHeader(req.headers.cookie, SESSION_COOKIE)
    if (!verifySessionToken(token)) {
      sendJson(res, 401, { error: '로그인이 필요합니다.' })
      return false
    }
    return true
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : '세션 확인 실패' })
    return false
  }
}

function applyEnv(env: Record<string, string>) {
  for (const key of [
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'TEAM_PASSWORD',
    'SESSION_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }
}

/**
 * 로컬 Vite에서 Vercel /api/* 와 동일한 엔드포인트를 제공한다.
 */
export function sharedApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    name: 'nergy-shared-api',
    configureServer(server) {
      applyEnv(env)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next()
          return
        }

        const url = new URL(req.url, 'http://localhost')
        const path = url.pathname

        try {
          if (path === '/api/auth/login' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)) || '{}') as { password?: string }
            if (!timingSafePasswordEqual(String(body.password || ''), getTeamPassword())) {
              sendJson(res, 401, { error: '비밀번호가 올바르지 않습니다.' })
              return
            }
            sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessionCookieHeader(createSessionToken()) })
            return
          }

          if (path === '/api/auth/logout' && req.method === 'POST') {
            sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookieHeader() })
            return
          }

          if (path === '/api/auth/me' && req.method === 'GET') {
            const ok = verifySessionToken(parseCookieHeader(req.headers.cookie, SESSION_COOKIE))
            sendJson(res, ok ? 200 : 401, { authenticated: ok })
            return
          }

          if (path === '/api/projects' && req.method === 'GET') {
            if (!requireLocalSession(req, res)) return
            sendJson(res, 200, await ensureSeedProject(DELIGHT_SEED))
            return
          }

          if (path === '/api/projects' && req.method === 'POST') {
            if (!requireLocalSession(req, res)) return
            const body = JSON.parse((await readBody(req)) || '{}') as { project?: unknown }
            if (!body.project) {
              sendJson(res, 400, { error: 'project가 필요합니다.' })
              return
            }
            sendJson(res, 200, { project: await upsertProject(body.project) })
            return
          }

          const projectMatch = path.match(/^\/api\/projects\/([^/]+)$/)
          if (projectMatch) {
            if (!requireLocalSession(req, res)) return
            const id = decodeURIComponent(projectMatch[1])
            if (req.method === 'PUT') {
              const body = JSON.parse((await readBody(req)) || '{}') as { project?: unknown }
              if (!body.project) {
                sendJson(res, 400, { error: 'project가 필요합니다.' })
                return
              }
              sendJson(res, 200, { project: await upsertProject({ ...(body.project as object), id }) })
              return
            }
            if (req.method === 'DELETE') {
              await deleteProject(id)
              sendJson(res, 200, { ok: true })
              return
            }
          }

          if (path === '/api/workspace' && req.method === 'PUT') {
            if (!requireLocalSession(req, res)) return
            const body = JSON.parse((await readBody(req)) || '{}') as { activeProjectId?: string | null }
            await setActiveProjectId(body.activeProjectId ?? null)
            sendJson(res, 200, { ok: true, activeProjectId: body.activeProjectId ?? null })
            return
          }

          if (path === '/api/analyze' && req.method === 'POST') {
            if (!requireLocalSession(req, res)) return
            const apiKey = process.env.OPENAI_API_KEY || ''
            const model = process.env.OPENAI_MODEL || 'gpt-5.5'
            const body = JSON.parse((await readBody(req)) || '{}') as { url?: string }
            const result = await runProductAnalysis({ url: body.url || '', apiKey, model })
            sendJson(res, 200, result)
            return
          }

          next()
        } catch (error) {
          const status =
            typeof error === 'object' && error && 'status' in error
              ? Number((error as { status: number }).status)
              : 500
          sendJson(res, Number.isFinite(status) ? status : 500, {
            error: error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.',
          })
        }
      })
    },
  }
}
