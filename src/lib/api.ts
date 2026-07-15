import { migrateProject, serializeProject } from './projectMigration'
import type { Project } from '../data'

const LEGACY_STORAGE_KEY = 'nergy.ai.workspace.v1'
const MIGRATED_FLAG = 'nergy.ai.workspace.migrated.v1'

async function parseJson<T>(response: Response): Promise<T> {
  const raw = await response.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    const hint = raw.replace(/\s+/g, ' ').slice(0, 160)
    throw new Error(`서버가 JSON이 아닌 응답을 반환했습니다. (HTTP ${response.status}) ${hint}`)
  }
}

export async function fetchAuthMe(): Promise<boolean> {
  const response = await fetch('/api/auth/me', { credentials: 'include' })
  if (response.status === 401) return false
  const payload = await parseJson<{ authenticated?: boolean }>(response)
  return Boolean(payload.authenticated)
}

export async function loginWithPassword(password: string): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const payload = await parseJson<{ error?: string; ok?: boolean }>(response)
  if (!response.ok) throw new Error(payload.error || '로그인에 실패했습니다.')
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}

export async function fetchProjects(): Promise<{ projects: Project[]; activeProjectId: string | null }> {
  const response = await fetch('/api/projects', { credentials: 'include' })
  const payload = await parseJson<{ projects?: unknown[]; activeProjectId?: string | null; error?: string }>(response)
  if (!response.ok) throw new Error(payload.error || '프로젝트를 불러오지 못했습니다.')
  const projects = (payload.projects ?? []).map((p) => migrateProject(p as Project))
  const activeProjectId =
    payload.activeProjectId && projects.some((p) => p.id === payload.activeProjectId)
      ? payload.activeProjectId
      : projects[0]?.id ?? null
  return { projects, activeProjectId }
}

export async function saveProject(project: Project): Promise<void> {
  const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project: serializeProject(project) }),
  })
  if (response.status === 404) {
    // 일부 환경에서 dynamic route가 없을 때 POST upsert로 폴백
    const created = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: serializeProject(project) }),
    })
    const payload = await parseJson<{ error?: string }>(created)
    if (!created.ok) throw new Error(payload.error || '프로젝트 저장에 실패했습니다.')
    return
  }
  const payload = await parseJson<{ error?: string }>(response)
  if (!response.ok) throw new Error(payload.error || '프로젝트 저장에 실패했습니다.')
}

export async function createProject(project: Project): Promise<void> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project: serializeProject(project) }),
  })
  const payload = await parseJson<{ error?: string }>(response)
  if (!response.ok) throw new Error(payload.error || '프로젝트 생성에 실패했습니다.')
}

export async function removeProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const payload = await parseJson<{ error?: string }>(response)
  if (!response.ok) throw new Error(payload.error || '프로젝트 삭제에 실패했습니다.')
}

export async function saveActiveProjectId(activeProjectId: string | null): Promise<void> {
  const response = await fetch('/api/workspace', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activeProjectId }),
  })
  const payload = await parseJson<{ error?: string }>(response)
  if (!response.ok) throw new Error(payload.error || '활성 프로젝트 저장에 실패했습니다.')
}

/** 로컬에만 남아 있는 예전 프로젝트를 서버로 1회 업로드한다. */
export async function migrateLegacyLocalProjects(): Promise<boolean> {
  if (localStorage.getItem(MIGRATED_FLAG)) return false
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(MIGRATED_FLAG, '1')
    return false
  }
  try {
    const parsed = JSON.parse(raw) as { projects?: Project[]; activeProjectId?: string | null }
    const projects = (parsed.projects ?? []).map(migrateProject)
    for (const project of projects) {
      await createProject(project)
    }
    if (parsed.activeProjectId) {
      await saveActiveProjectId(parsed.activeProjectId)
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    localStorage.setItem(MIGRATED_FLAG, '1')
    return projects.length > 0
  } catch {
    localStorage.setItem(MIGRATED_FLAG, '1')
    return false
  }
}

export { LEGACY_STORAGE_KEY }
