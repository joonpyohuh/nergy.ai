export type ProjectStatus = 'ready' | 'analyzing' | 'archived'

export interface StoredProject {
  id: string
  name: string
  url: string
  description: string
  status: ProjectStatus
  analyzedAt: string
  sourceCount: number
  model?: string
  nodes: unknown[]
  edges: unknown[]
  docs: unknown[]
  sources: unknown[]
}

export interface ProjectRow {
  id: string
  name: string
  url: string
  description: string
  status: string
  analyzed_at: string | null
  source_count: number
  model: string | null
  nodes: unknown
  edges: unknown
  docs: unknown
  sources: unknown
  created_at?: string
  updated_at?: string
}

function stripIcons(nodes: unknown[]): unknown[] {
  return nodes.map((node) => {
    if (!node || typeof node !== 'object') return node
    const { icon: _icon, ...rest } = node as Record<string, unknown>
    void _icon
    return rest
  })
}

export function projectToRow(project: StoredProject): ProjectRow {
  return {
    id: project.id,
    name: project.name,
    url: project.url,
    description: project.description,
    status: project.status,
    analyzed_at: project.analyzedAt,
    source_count: project.sourceCount,
    model: project.model ?? null,
    nodes: stripIcons(Array.isArray(project.nodes) ? project.nodes : []),
    edges: project.edges ?? [],
    docs: project.docs ?? [],
    sources: project.sources ?? [],
    updated_at: new Date().toISOString(),
  }
}

export function rowToStoredProject(row: ProjectRow): StoredProject {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    status: (row.status as ProjectStatus) || 'ready',
    analyzedAt: row.analyzed_at || new Date().toISOString(),
    sourceCount: row.source_count ?? 0,
    model: row.model ?? undefined,
    nodes: Array.isArray(row.nodes) ? row.nodes : [],
    edges: Array.isArray(row.edges) ? row.edges : [],
    docs: Array.isArray(row.docs) ? row.docs : [],
    sources: Array.isArray(row.sources) ? row.sources : [],
  }
}

export function asStoredProject(input: unknown): StoredProject {
  const p = (input ?? {}) as Record<string, unknown>
  return {
    id: String(p.id || ''),
    name: String(p.name || 'Untitled'),
    url: String(p.url || ''),
    description: String(p.description || ''),
    status: (p.status as ProjectStatus) || 'ready',
    analyzedAt: String(p.analyzedAt || new Date().toISOString()),
    sourceCount: Number(p.sourceCount ?? 0),
    model: p.model ? String(p.model) : undefined,
    nodes: Array.isArray(p.nodes) ? stripIcons(p.nodes) : [],
    edges: Array.isArray(p.edges) ? p.edges : [],
    docs: Array.isArray(p.docs) ? p.docs : [],
    sources: Array.isArray(p.sources) ? p.sources : [],
  }
}
