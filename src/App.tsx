import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe2,
  Layers3,
  Link2,
  LoaderCircle,
  Map,
  Menu,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import {
  DOC_STATUS_LABEL,
  DOC_STATUS_ORDER,
  attachNodeIcons,
  buildProjectFromAnalysis,
  createDelightProject,
  docsToMarkdown,
  toSerializableNodes,
  type AnalysisPayload,
  type Audience,
  type DocStatus,
  type DocSuggestion,
  type Evidence,
  type Project,
  type WorkspaceTab,
} from './data'

const STORAGE_KEY = 'nergy.ai.workspace.v1'

type View = 'projects' | 'workspace'

interface PersistedState {
  projects: Project[]
  activeProjectId: string | null
}

const evidenceStyle: Record<Evidence, string> = {
  DOCS: 'bg-blue-50 text-blue-700 border-blue-100',
  SPEC: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CONFIRM: 'bg-amber-50 text-amber-700 border-amber-100',
}

function EvidenceBadge({ value }: { value: Evidence }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${evidenceStyle[value]}`}>
      {value}
    </span>
  )
}

function StatusBadge({ status }: { status: DocStatus }) {
  const styles: Record<DocStatus, string> = {
    backlog: 'bg-toss-surface text-toss-muted',
    planned: 'bg-blue-50 text-blue-700',
    drafting: 'bg-violet-50 text-violet-700',
    review: 'bg-amber-50 text-amber-700',
    done: 'bg-emerald-50 text-emerald-700',
  }
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>{DOC_STATUS_LABEL[status]}</span>
}

function rehydrateProject(p: Project): Project {
  const template = createDelightProject()
  const serializableNodes = (p.nodes?.length ? p.nodes : template.nodes).map(({ icon: _icon, ...rest }) => rest)
  return {
    ...p,
    nodes: attachNodeIcons(serializableNodes),
    sources: p.sources?.length ? p.sources : template.sources,
    docs: (p.docs?.length ? p.docs : template.docs).map((doc) => ({
      ...doc,
      outline: doc.outline ?? [],
      notes: doc.notes ?? '',
      assignee: doc.assignee ?? '',
      status: doc.status ?? 'backlog',
    })),
  }
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState
      if (parsed.projects?.length) {
        const projects = parsed.projects.map(rehydrateProject)
        return {
          projects,
          activeProjectId: parsed.activeProjectId && projects.some((p) => p.id === parsed.activeProjectId)
            ? parsed.activeProjectId
            : projects[0].id,
        }
      }
    }
  } catch {
    /* ignore */
  }
  const seed = createDelightProject()
  return { projects: [seed], activeProjectId: seed.id }
}

function App() {
  const [boot] = useState(loadState)
  const [projects, setProjects] = useState<Project[]>(boot.projects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(boot.activeProjectId)
  const [view, setView] = useState<View>(boot.activeProjectId ? 'workspace' : 'projects')
  const [tab, setTab] = useState<WorkspaceTab>('map')
  const [activeNodeId, setActiveNodeId] = useState('signal')
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [audience, setAudience] = useState<Audience | '모두'>('모두')
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [analyzeUrl, setAnalyzeUrl] = useState('https://')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analyzeError, setAnalyzeError] = useState('')
  const [toast, setToast] = useState('')

  const project = projects.find((p) => p.id === activeProjectId) ?? null
  const activeDoc = project?.docs.find((d) => d.id === activeDocId) ?? null
  const activeNode = project?.nodes.find((n) => n.id === activeNodeId) ?? project?.nodes[0]

  useEffect(() => {
    const payload = {
      projects: projects.map((p) => ({
        ...p,
        nodes: toSerializableNodes(p.nodes),
      })),
      activeProjectId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [projects, activeProjectId])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(t)
  }, [toast])

  const filteredDocs = useMemo(() => {
    if (!project) return []
    return project.docs.filter((doc) => {
      const audienceOk = audience === '모두' || doc.audience === audience || doc.audience === '모두'
      const statusOk = statusFilter === 'all' || doc.status === statusFilter
      const q = query.trim().toLowerCase()
      const queryOk = !q || doc.title.toLowerCase().includes(q) || doc.kind.toLowerCase().includes(q) || doc.reason.toLowerCase().includes(q)
      return audienceOk && statusOk && queryOk
    })
  }, [project, audience, statusFilter, query])

  const stats = useMemo(() => {
    if (!project) return { total: 0, planned: 0, drafting: 0, review: 0, done: 0 }
    return {
      total: project.docs.length,
      planned: project.docs.filter((d) => d.status === 'planned').length,
      drafting: project.docs.filter((d) => d.status === 'drafting').length,
      review: project.docs.filter((d) => d.status === 'review').length,
      done: project.docs.filter((d) => d.status === 'done').length,
    }
  }, [project])

  const openProject = (id: string) => {
    setActiveProjectId(id)
    setView('workspace')
    setTab('map')
    setSidebarOpen(false)
    const p = projects.find((x) => x.id === id)
    if (p?.nodes[0]) setActiveNodeId(p.nodes[0].id)
    const firstWorking = p?.docs.find((d) => d.status === 'drafting' || d.status === 'planned')
    setActiveDocId(firstWorking?.id ?? p?.docs[0]?.id ?? null)
  }

  const updateProject = (id: string, updater: (p: Project) => Project) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? updater(p) : p)))
  }

  const updateDoc = (docId: string, patch: Partial<DocSuggestion>) => {
    if (!project) return
    updateProject(project.id, (p) => ({
      ...p,
      docs: p.docs.map((d) => (d.id === docId ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
    }))
  }

  const setDocStatus = (docId: string, status: DocStatus) => {
    updateDoc(docId, { status })
    setToast(`상태를 "${DOC_STATUS_LABEL[status]}"(으)로 변경했어요`)
  }

  const openDocInEditor = (docId: string) => {
    setActiveDocId(docId)
    setTab('editor')
  }

  const runAnalyze = async () => {
    const url = analyzeUrl.trim()
    if (!url || analyzing) return
    setAnalyzing(true)
    setAnalyzeError('')
    setProgress(18)

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev >= 92 ? prev : prev + Math.floor(Math.random() * 8) + 2))
    }, 700)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const payload = (await response.json()) as {
        error?: string
        model?: string
        analysis?: AnalysisPayload
      }

      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || '분석에 실패했습니다.')
      }

      setProgress(100)
      const newProject = buildProjectFromAnalysis(url, payload.analysis, payload.model || 'gpt-5.5')
      setProjects((prev) => [newProject, ...prev])
      setActiveProjectId(newProject.id)
      setActiveNodeId(newProject.nodes[0].id)
      setActiveDocId(newProject.docs[0]?.id ?? null)
      setShowAnalyze(false)
      setView('workspace')
      setTab('map')
      setToast(`${newProject.name} · ${payload.model || 'gpt-5.5'} 분석 완료`)
    } catch (error) {
      setAnalyzeError(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.')
    } finally {
      window.clearInterval(progressTimer)
      setAnalyzing(false)
      setProgress(0)
    }
  }

  const exportPlan = () => {
    if (!project) return
    const working = project.docs.filter((d) => d.status !== 'backlog')
    const md = docsToMarkdown(project.name, working.length ? working : project.docs)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `${project.name.replace(/\W+/g, '-').toLowerCase()}-writing-plan.md`
    a.click()
    URL.revokeObjectURL(href)
    setToast('Markdown으로 내보냈어요')
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id)
      if (activeProjectId === id) {
        setActiveProjectId(next[0]?.id ?? null)
        setView(next[0] ? 'workspace' : 'projects')
      }
      return next
    })
    setToast('프로젝트를 삭제했어요')
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F8] text-toss-dark">
      {/* Mobile overlay */}
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" aria-label="사이드바 닫기" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-toss-line bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-toss-line px-4">
          <button
            className="flex items-center gap-2"
            onClick={() => {
              setView('projects')
              setSidebarOpen(false)
            }}
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-toss-blue text-white">
              <Sparkles size={14} strokeWidth={2.5} />
            </span>
            <span className="text-[16px] font-extrabold tracking-[-0.03em]">
              nergy<span className="text-toss-blue">.ai</span>
            </span>
          </button>
          <button className="rounded-lg p-1.5 text-toss-muted lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-toss-line p-3">
          <button
            onClick={() => {
              setShowAnalyze(true)
              setSidebarOpen(false)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-toss-blue px-3 py-2.5 text-[13px] font-bold text-white hover:bg-[#1B64DA]"
          >
            <Plus size={16} /> 새 제품 분석
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wide text-toss-muted">Projects</p>
          <div className="space-y-1">
            {projects.map((p) => {
              const active = view === 'workspace' && p.id === activeProjectId
              return (
                <button
                  key={p.id}
                  onClick={() => openProject(p.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                    active ? 'bg-blue-50 text-toss-blue' : 'text-toss-text hover:bg-toss-surface'
                  }`}
                >
                  <FolderKanban size={16} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{p.name}</span>
                    <span className="block truncate text-[11px] font-medium opacity-70">{p.docs.length} docs</span>
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-toss-line p-3 text-[11px] font-medium text-toss-muted">
          AI는 시작점을 잡고, Writer가 판단합니다.
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-toss-line bg-white/95 px-4 backdrop-blur">
          <button className="rounded-lg p-2 text-toss-text lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="메뉴">
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            {view === 'projects' ? (
              <div>
                <h1 className="text-[15px] font-extrabold">프로젝트</h1>
                <p className="text-[12px] font-medium text-toss-muted">분석한 제품과 Writing plan을 관리하세요</p>
              </div>
            ) : project ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#141414] text-sm font-black text-white">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-[15px] font-extrabold">{project.name}</h1>
                    <span className="hidden rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 sm:inline">Ready</span>
                  </div>
                  <p className="truncate text-[12px] font-medium text-toss-muted">{project.url}</p>
                </div>
              </div>
            ) : null}
          </div>
          {view === 'workspace' && project && (
            <div className="flex items-center gap-2">
              <button onClick={exportPlan} className="hidden items-center gap-1.5 rounded-xl border border-toss-line px-3 py-2 text-[12px] font-bold hover:bg-toss-surface sm:flex">
                <Download size={14} /> Export
              </button>
              <button onClick={() => setShowAnalyze(true)} className="flex items-center gap-1.5 rounded-xl bg-toss-dark px-3 py-2 text-[12px] font-bold text-white hover:bg-black">
                <Plus size={14} /> 분석
              </button>
            </div>
          )}
        </header>

        {view === 'projects' && (
          <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-bold text-toss-blue">WORKSPACE</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">문서 작업을 시작할 제품</h2>
                </div>
                <button
                  onClick={() => setShowAnalyze(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-toss-blue px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#1B64DA]"
                >
                  <Plus size={16} /> 새 제품 분석
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((p) => {
                  const drafting = p.docs.filter((d) => d.status === 'drafting' || d.status === 'review').length
                  return (
                    <article key={p.id} className="group rounded-2xl border border-toss-line bg-white p-5 shadow-card transition hover:border-blue-200">
                      <div className="flex items-start justify-between gap-3">
                        <button onClick={() => openProject(p.id)} className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#141414] text-sm font-black text-white">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-[16px] font-extrabold group-hover:text-toss-blue">{p.name}</h3>
                              <p className="truncate text-[12px] font-medium text-toss-muted">{p.url}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-[13px] font-medium leading-5 text-toss-text">{p.description}</p>
                          <div className="mt-4 flex flex-wrap gap-3 text-[12px] font-bold text-toss-muted">
                            <span>{p.docs.length} docs</span>
                            <span>{p.sourceCount} sources</span>
                            <span>{drafting} in progress</span>
                          </div>
                        </button>
                        {projects.length > 1 && (
                          <button
                            onClick={() => deleteProject(p.id)}
                            className="rounded-lg p-2 text-toss-muted hover:bg-red-50 hover:text-red-600"
                            aria-label={`${p.name} 삭제`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => openProject(p.id)}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-toss-surface py-2.5 text-[13px] font-bold text-toss-text hover:bg-blue-50 hover:text-toss-blue"
                      >
                        워크스페이스 열기 <ChevronRight size={16} />
                      </button>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {view === 'workspace' && project && (
          <>
            {/* Tabs + stats */}
            <div className="border-b border-toss-line bg-white px-4 pt-2 sm:px-6">
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['전체', stats.total],
                  ['계획', stats.planned],
                  ['작성 중', stats.drafting],
                  ['리뷰', stats.review],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-xl bg-toss-surface px-3 py-2">
                    <p className="text-[11px] font-bold text-toss-muted">{label}</p>
                    <p className="text-[18px] font-extrabold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 overflow-x-auto">
                {(
                  [
                    ['map', '로직 맵', Map],
                    ['docs', '문서 큐', ClipboardList],
                    ['editor', '에디터', FileText],
                    ['sources', '근거', Link2],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-bold transition ${
                      tab === id ? 'border-toss-blue text-toss-blue' : 'border-transparent text-toss-muted hover:text-toss-dark'
                    }`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <section className="flex-1 overflow-y-auto p-4 sm:p-6">
              {tab === 'map' && activeNode && (
                <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-[1fr_320px]">
                  <div className="rounded-2xl border border-toss-line bg-white shadow-card">
                    <div className="border-b border-toss-line px-5 py-4">
                      <h2 className="text-[16px] font-extrabold">제품 로직 맵</h2>
                      <p className="mt-0.5 text-[12px] font-medium text-toss-muted">노드를 선택하면 관련 문서 후보가 오른쪽에 표시됩니다.</p>
                    </div>
                    <div className="mindmap-grid p-4 sm:p-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {project.nodes.map((node) => {
                          const Icon = node.icon
                          const active = node.id === activeNode.id
                          const related = project.docs.filter((d) => d.nodeId === node.id).length
                          return (
                            <button
                              key={node.id}
                              onClick={() => setActiveNodeId(node.id)}
                              className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${
                                active ? 'border-blue-300 bg-blue-50/40 shadow-card ring-4 ring-blue-50' : 'border-toss-line bg-white hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span style={{ color: node.color, background: `${node.color}14` }} className="grid h-8 w-8 place-items-center rounded-lg">
                                  <Icon size={16} />
                                </span>
                                <span className="text-[10px] font-extrabold text-toss-muted">{node.step}</span>
                              </div>
                              <h3 className="mt-2 text-[13px] font-extrabold">{node.title}</h3>
                              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-toss-muted">{node.plain}</p>
                              <p className="mt-2 text-[10px] font-bold text-toss-blue">{related} docs</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="border-t border-toss-line bg-[#FBFCFD] p-5">
                      <div className="flex gap-3">
                        <div style={{ background: activeNode.color }} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                          {(() => {
                            const NodeIcon = activeNode.icon
                            return <NodeIcon size={18} />
                          })()}
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-toss-muted">
                            {activeNode.step} · {activeNode.title}
                          </p>
                          <h3 className="mt-1 text-[15px] font-extrabold">{activeNode.plain}</h3>
                          <p className="mt-2 text-[13px] font-medium leading-5 text-toss-text">{activeNode.detail}</p>
                          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                            <p className="text-[10px] font-extrabold text-blue-700">예시</p>
                            <p className="mt-1 text-[12px] font-semibold leading-5 text-toss-text">{activeNode.example}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
                        <CircleHelp size={16} className="mt-0.5 shrink-0 text-amber-600" />
                        <p className="text-[12px] font-medium leading-5 text-amber-900">
                          이 맵은 공개 자료 기반 <strong>이해 모델</strong>입니다. 내부 스키마·호출 순서는 CONFIRM 문서로 남겨 두고 담당자 확인이 필요합니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <aside className="h-fit rounded-2xl border border-toss-line bg-white p-4 shadow-card lg:sticky lg:top-20">
                    <div className="mb-3 flex items-center gap-2">
                      <Layers3 size={16} className="text-toss-blue" />
                      <h3 className="text-[14px] font-extrabold">이 노드의 문서</h3>
                    </div>
                    <div className="space-y-2">
                      {project.docs
                        .filter((d) => d.nodeId === activeNode.id)
                        .map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => openDocInEditor(doc.id)}
                            className="w-full rounded-xl border border-toss-line p-3 text-left hover:border-blue-200 hover:bg-blue-50/40"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <EvidenceBadge value={doc.evidence} />
                              <StatusBadge status={doc.status} />
                            </div>
                            <p className="mt-2 text-[13px] font-extrabold">{doc.title}</p>
                            <p className="mt-1 text-[11px] font-medium text-toss-muted">{doc.kind}</p>
                          </button>
                        ))}
                    </div>
                    <button
                      onClick={() => {
                        setStatusFilter('all')
                        setAudience('모두')
                        setTab('docs')
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-toss-surface py-2.5 text-[12px] font-bold hover:bg-blue-50 hover:text-toss-blue"
                    >
                      전체 문서 큐 보기 <ArrowRight size={14} />
                    </button>
                  </aside>
                </div>
              )}

              {tab === 'docs' && (
                <div className="mx-auto max-w-5xl">
                  <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-toss-line bg-white p-4 shadow-card sm:flex-row sm:items-center">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-toss-surface px-3 py-2.5">
                      <Search size={16} className="text-toss-muted" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="문서 제목·유형 검색"
                        className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none"
                      />
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(['모두', '개발자', '운영팀', '마케터·디자이너'] as Audience[]).map((a) => (
                        <button
                          key={a}
                          onClick={() => setAudience(a)}
                          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${audience === a ? 'bg-toss-dark text-white' : 'bg-toss-surface text-toss-muted'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${statusFilter === 'all' ? 'bg-toss-blue text-white' : 'bg-white text-toss-muted border border-toss-line'}`}
                    >
                      전체 상태
                    </button>
                    {DOC_STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${statusFilter === s ? 'bg-toss-blue text-white' : 'bg-white text-toss-muted border border-toss-line'}`}
                      >
                        {DOC_STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {filteredDocs.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-toss-line bg-white py-16 text-center">
                        <Search size={24} className="mx-auto text-toss-muted" />
                        <p className="mt-2 text-[14px] font-extrabold">조건에 맞는 문서가 없어요</p>
                      </div>
                    )}
                    {filteredDocs.map((doc) => (
                      <article key={doc.id} className="rounded-2xl border border-toss-line bg-white p-4 shadow-card sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <EvidenceBadge value={doc.evidence} />
                              <StatusBadge status={doc.status} />
                              <span className="text-[11px] font-bold text-toss-muted">{doc.kind}</span>
                              <span className="text-[11px] font-bold text-toss-muted">· {doc.audience}</span>
                            </div>
                            <h3 className="mt-2 text-[15px] font-extrabold">{doc.title}</h3>
                            <p className="mt-1 text-[13px] font-medium leading-5 text-toss-text">{doc.reason}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <select
                              value={doc.status}
                              onChange={(e) => setDocStatus(doc.id, e.target.value as DocStatus)}
                              className="rounded-xl border border-toss-line bg-white px-3 py-2 text-[12px] font-bold outline-none"
                              aria-label={`${doc.title} 상태`}
                            >
                              {DOC_STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>
                                  {DOC_STATUS_LABEL[s]}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => openDocInEditor(doc.id)}
                              className="rounded-xl bg-toss-blue px-3 py-2 text-[12px] font-bold text-white hover:bg-[#1B64DA]"
                            >
                              에디터에서 열기
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'editor' && (
                <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[240px_1fr]">
                  <aside className="h-fit rounded-2xl border border-toss-line bg-white p-3 shadow-card lg:sticky lg:top-20">
                    <p className="mb-2 px-2 text-[11px] font-bold text-toss-muted">문서 목록</p>
                    <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                      {project.docs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setActiveDocId(doc.id)}
                          className={`w-full rounded-xl px-3 py-2.5 text-left ${
                            doc.id === activeDocId ? 'bg-blue-50 text-toss-blue' : 'hover:bg-toss-surface'
                          }`}
                        >
                          <span className="block truncate text-[12px] font-extrabold">{doc.title}</span>
                          <span className="mt-0.5 block text-[10px] font-bold opacity-70">{DOC_STATUS_LABEL[doc.status]}</span>
                        </button>
                      ))}
                    </div>
                  </aside>

                  {activeDoc ? (
                    <div className="rounded-2xl border border-toss-line bg-white shadow-card">
                      <div className="border-b border-toss-line p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <EvidenceBadge value={activeDoc.evidence} />
                          <StatusBadge status={activeDoc.status} />
                          <span className="text-[11px] font-bold text-toss-muted">{activeDoc.kind}</span>
                        </div>
                        <input
                          value={activeDoc.title}
                          onChange={(e) => updateDoc(activeDoc.id, { title: e.target.value })}
                          className="mt-3 w-full bg-transparent text-[22px] font-extrabold tracking-[-0.03em] outline-none"
                          aria-label="문서 제목"
                        />
                        <p className="mt-2 text-[13px] font-medium text-toss-muted">{activeDoc.reason}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <label className="flex items-center gap-2 text-[12px] font-bold text-toss-muted">
                            상태
                            <select
                              value={activeDoc.status}
                              onChange={(e) => setDocStatus(activeDoc.id, e.target.value as DocStatus)}
                              className="rounded-lg border border-toss-line px-2 py-1.5 text-[12px] font-bold text-toss-dark"
                            >
                              {DOC_STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>
                                  {DOC_STATUS_LABEL[s]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex items-center gap-2 text-[12px] font-bold text-toss-muted">
                            담당
                            <input
                              value={activeDoc.assignee}
                              onChange={(e) => updateDoc(activeDoc.id, { assignee: e.target.value })}
                              placeholder="이름"
                              className="w-28 rounded-lg border border-toss-line px-2 py-1.5 text-[12px] font-bold text-toss-dark outline-none"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-[14px] font-extrabold">Outline</h3>
                          <button
                            onClick={() => updateDoc(activeDoc.id, { outline: [...activeDoc.outline, '새 섹션'] })}
                            className="flex items-center gap-1 rounded-lg bg-toss-surface px-2.5 py-1.5 text-[11px] font-bold hover:bg-blue-50 hover:text-toss-blue"
                          >
                            <Plus size={12} /> 섹션 추가
                          </button>
                        </div>
                        <ol className="space-y-2">
                          {activeDoc.outline.map((line, index) => (
                            <li key={`${activeDoc.id}-${index}`} className="flex items-center gap-2">
                              <span className="w-6 text-[12px] font-bold text-toss-muted">{index + 1}.</span>
                              <input
                                value={line}
                                onChange={(e) => {
                                  const next = [...activeDoc.outline]
                                  next[index] = e.target.value
                                  updateDoc(activeDoc.id, { outline: next })
                                }}
                                className="min-w-0 flex-1 rounded-xl border border-toss-line px-3 py-2.5 text-[13px] font-medium outline-none focus:border-blue-300"
                              />
                              <button
                                onClick={() => updateDoc(activeDoc.id, { outline: activeDoc.outline.filter((_, i) => i !== index) })}
                                className="rounded-lg p-2 text-toss-muted hover:bg-red-50 hover:text-red-600"
                                aria-label="섹션 삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ol>

                        <h3 className="mb-2 mt-6 text-[14px] font-extrabold">작업 노트</h3>
                        <textarea
                          value={activeDoc.notes}
                          onChange={(e) => updateDoc(activeDoc.id, { notes: e.target.value })}
                          rows={5}
                          placeholder="확인할 질문, 이해관계자, 미결 사항을 적어 두세요"
                          className="w-full resize-y rounded-xl border border-toss-line px-3 py-3 text-[13px] font-medium leading-6 outline-none focus:border-blue-300"
                        />

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setDocStatus(activeDoc.id, 'review')
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-toss-blue px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#1B64DA]"
                          >
                            <Check size={15} /> 리뷰 요청으로 보내기
                          </button>
                          <button onClick={exportPlan} className="flex items-center gap-1.5 rounded-xl border border-toss-line px-4 py-2.5 text-[13px] font-bold hover:bg-toss-surface">
                            <Download size={15} /> Writing plan 내보내기
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-toss-line bg-white py-20 text-center">
                      <FileText size={28} className="mx-auto text-toss-muted" />
                      <p className="mt-2 font-extrabold">왼쪽에서 문서를 선택하세요</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'sources' && (
                <div className="mx-auto max-w-3xl">
                  <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-[13px] font-medium leading-5 text-blue-900">
                    최종 확인일 2026-07-14. 공개 자료만 사용했고, 내부 구현 상세는 <strong>CONFIRM</strong>으로 표시됩니다.
                  </div>
                  <div className="space-y-2">
                    {project.sources.map((source, i) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-3 rounded-2xl border border-toss-line bg-white p-4 shadow-card transition hover:border-blue-200 hover:bg-blue-50/30"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-toss-surface text-[11px] font-extrabold text-toss-muted">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[14px] font-extrabold">{source.title}</h3>
                            <ExternalLink size={14} className="mt-1 shrink-0 text-toss-muted" />
                          </div>
                          <p className="mt-1 text-[11px] font-bold text-toss-muted">{source.date}</p>
                          <p className="mt-2 text-[12px] font-medium leading-5 text-toss-text">{source.note}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Analyze modal */}
      {showAnalyze && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <button className="absolute inset-0" aria-label="닫기" onClick={() => !analyzing && setShowAnalyze(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl animate-fade-up sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold text-toss-blue">GPT-5.5 ANALYSIS</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">제품 URL로 분석 시작</h2>
                <p className="mt-1 text-[13px] font-medium text-toss-muted">OpenAI gpt-5.5가 로직 맵과 문서 큐를 생성합니다.</p>
              </div>
              {!analyzing && (
                <button onClick={() => setShowAnalyze(false)} className="rounded-lg p-2 text-toss-muted hover:bg-toss-surface" aria-label="닫기">
                  <X size={18} />
                </button>
              )}
            </div>

            {!analyzing ? (
              <>
                <label className="mt-5 flex items-center gap-3 rounded-xl border border-toss-line bg-toss-surface px-3 py-3">
                  <Globe2 size={18} className="text-toss-muted" />
                  <input
                    value={analyzeUrl}
                    onChange={(e) => setAnalyzeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void runAnalyze()}
                    placeholder="https://product.example.com"
                    className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none"
                    autoFocus
                  />
                </label>
                <button
                  onClick={() => void runAnalyze()}
                  disabled={!analyzeUrl.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-toss-blue py-3.5 text-[14px] font-bold text-white hover:bg-[#1B64DA] disabled:opacity-50"
                >
                  gpt-5.5로 분석 실행 <ArrowRight size={16} />
                </button>
                {analyzeError && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">
                    {analyzeError}
                  </p>
                )}
                <p className="mt-3 text-center text-[11px] font-medium text-toss-muted">API 키는 서버(.env)에만 보관되며 브라우저로 노출되지 않습니다.</p>
              </>
            ) : (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[14px] font-bold">
                    <LoaderCircle size={16} className="animate-spin text-toss-blue" /> gpt-5.5가 분석 중
                  </p>
                  <span className="text-[14px] font-extrabold text-toss-blue">{progress}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-toss-surface">
                  <div className="h-full rounded-full bg-toss-blue transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <ul className="mt-4 space-y-2 text-[12px] font-semibold text-toss-muted">
                  {['공식 페이지·문서 수집', '기능·데이터 흐름 연결', '확인 필요 항목 분리', '문서 큐 생성'].map((label, i) => (
                    <li key={label} className="flex items-center gap-2">
                      <span className={`grid h-5 w-5 place-items-center rounded-full ${progress > (i + 1) * 22 ? 'bg-blue-50 text-toss-blue' : 'bg-toss-surface'}`}>
                        {progress > (i + 1) * 22 ? <Check size={11} /> : i + 1}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-toss-dark px-4 py-3 text-[13px] font-bold text-white shadow-2xl animate-fade-up">
          <CheckCircle2 size={16} className="text-[#58D19B]" />
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
