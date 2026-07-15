import { getSupabaseAdmin } from './supabase.js'
import {
  asStoredProject,
  projectToRow,
  rowToStoredProject,
  type ProjectRow,
  type StoredProject,
} from './projectTypes.js'

export type { StoredProject }

export async function listProjects(): Promise<{ projects: StoredProject[]; activeProjectId: string | null }> {
  const supabase = getSupabaseAdmin()
  const [{ data: rows, error: projectsError }, { data: meta, error: metaError }] = await Promise.all([
    supabase.from('projects').select('*').order('analyzed_at', { ascending: false }),
    supabase.from('workspace_meta').select('active_project_id').eq('id', 'default').maybeSingle(),
  ])

  if (projectsError) throw Object.assign(new Error(projectsError.message), { status: 500 })
  if (metaError) throw Object.assign(new Error(metaError.message), { status: 500 })

  const projects = (rows as ProjectRow[] | null)?.map(rowToStoredProject) ?? []
  const activeFromMeta =
    meta && typeof meta === 'object' && 'active_project_id' in meta
      ? (meta as { active_project_id: string | null }).active_project_id
      : null
  const activeProjectId =
    activeFromMeta && projects.some((p) => p.id === activeFromMeta) ? activeFromMeta : projects[0]?.id ?? null

  return { projects, activeProjectId }
}

export async function upsertProject(input: unknown): Promise<StoredProject> {
  const supabase = getSupabaseAdmin()
  const stored = asStoredProject(input)
  if (!stored.id) throw Object.assign(new Error('프로젝트 id가 필요합니다.'), { status: 400 })
  const row = projectToRow(stored)
  const { data, error } = await supabase.from('projects').upsert(row).select('*').single()
  if (error) throw Object.assign(new Error(error.message), { status: 500 })
  return rowToStoredProject(data as ProjectRow)
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw Object.assign(new Error(error.message), { status: 500 })
}

export async function setActiveProjectId(activeProjectId: string | null): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('workspace_meta').upsert({
    id: 'default',
    active_project_id: activeProjectId,
    updated_at: new Date().toISOString(),
  })
  if (error) throw Object.assign(new Error(error.message), { status: 500 })
}

export async function ensureSeedProject(seed: unknown): Promise<{ projects: StoredProject[]; activeProjectId: string | null }> {
  const current = await listProjects()
  if (current.projects.length > 0) return current
  await upsertProject(seed)
  const stored = asStoredProject(seed)
  await setActiveProjectId(stored.id)
  return listProjects()
}
