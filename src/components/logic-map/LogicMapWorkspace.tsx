import { useEffect, useMemo, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CircleHelp, GitBranch, Milestone, MousePointerClick, X } from 'lucide-react'
import { ROLE_LABEL, STAKEHOLDER_ROLES, type Project, type StakeholderRole } from '../../data'
import { useGraphSelection } from '../../hooks/useGraphSelection'
import { EdgeDetailPanel } from './EdgeDetailPanel'
import { GraphLegend } from './GraphLegend'
import { LogicMapCanvas } from './LogicMapCanvas'
import { NodeDetailPanel } from './NodeDetailPanel'
import { WritingRoadmap } from './WritingRoadmap'

type MapViewMode = 'flow' | 'roadmap'

interface LogicMapWorkspaceProps {
  project: Project
  onOpenDoc: (docId: string) => void
  onOpenDocsTab: () => void
}

export function LogicMapWorkspace({ project, onOpenDoc, onOpenDocsTab }: LogicMapWorkspaceProps) {
  const reducedMotion = useReducedMotion() ?? false
  const [viewMode, setViewMode] = useState<MapViewMode>('flow')
  const [role, setRole] = useState<StakeholderRole>('overview')
  const [showEdges, setShowEdges] = useState(true)
  const { selection, highlight, selectNode, selectEdge, clear } = useGraphSelection(project.edges)

  // Escape로 선택/패널 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clear])

  const docCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    project.docs.forEach((doc) => {
      counts[doc.nodeId] = (counts[doc.nodeId] ?? 0) + 1
    })
    return counts
  }, [project.docs])

  const nodeTitleById = useMemo(
    () => Object.fromEntries(project.nodes.map((n) => [n.id, n.title])) as Record<string, string>,
    [project.nodes],
  )

  const selectedNode = selection?.kind === 'node' ? project.nodes.find((n) => n.id === selection.id) ?? null : null
  const selectedEdge = selection?.kind === 'edge' ? project.edges.find((e) => e.id === selection.id) ?? null : null

  const detailContent = selectedNode ? (
    <NodeDetailPanel
      node={selectedNode}
      edges={project.edges}
      docs={project.docs}
      role={role}
      nodeTitleById={nodeTitleById}
      onSelectEdge={selectEdge}
      onOpenDoc={onOpenDoc}
      onOpenDocsTab={onOpenDocsTab}
    />
  ) : selectedEdge ? (
    <EdgeDetailPanel edge={selectedEdge} nodes={project.nodes} docs={project.docs} onSelectNode={selectNode} onOpenDoc={onOpenDoc} />
  ) : null

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* 헤더: 모드 전환 + 직군 관점 + 범례 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="로직 맵 보기 모드" className="flex rounded-xl bg-toss-surface p-1">
          {(
            [
              ['flow', 'Product Flow', GitBranch],
              ['roadmap', 'Writing Roadmap', Milestone],
            ] as const
          ).map(([mode, label, Icon]) => (
            <button
              key={mode}
              role="tab"
              aria-selected={viewMode === mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition ${
                viewMode === mode ? 'bg-white text-toss-blue shadow-sm' : 'text-toss-muted hover:text-toss-text'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {viewMode === 'flow' && (
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-toss-muted">
            직군 관점
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StakeholderRole)}
              className="rounded-xl border border-toss-line bg-white px-2.5 py-2 text-[12px] font-bold text-toss-text outline-none focus:border-blue-300"
              aria-label="직군 관점 선택"
            >
              {STAKEHOLDER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="ml-auto">
          <GraphLegend />
        </div>
      </div>

      {viewMode === 'flow' ? (
          <motion.div
            key="flow"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: 'easeOut' }}
            className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]"
          >
            {/* 그래프 캔버스 */}
            <div className="ambient-canvas relative h-[62vh] min-h-[440px] overflow-hidden rounded-2xl border border-toss-line bg-white shadow-card lg:h-[calc(100vh-330px)] lg:min-h-[540px]">
              <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-toss-line bg-white/85 px-4 py-2.5 backdrop-blur">
                <div>
                  <h2 className="text-[14px] font-extrabold">제품 로직 맵</h2>
                  <p className="text-[11px] font-medium text-toss-muted">노드와 연결선을 클릭해 제품 구조를 탐색하세요</p>
                </div>
                <p className="hidden items-center gap-1 text-[10.5px] font-semibold text-toss-muted sm:flex">
                  <MousePointerClick size={12} /> 더블클릭: 주변 구조로 확대
                </p>
              </div>
              <div className="h-full pt-[54px]">
                <ReactFlowProvider>
                  <LogicMapCanvas
                    logicNodes={project.nodes}
                    logicEdges={project.edges}
                    docCounts={docCounts}
                    role={role}
                    selection={selection}
                    highlight={highlight}
                    showEdges={showEdges}
                    onToggleEdges={() => setShowEdges((v) => !v)}
                    onSelectNode={selectNode}
                    onSelectEdge={selectEdge}
                    onClearSelection={clear}
                  />
                </ReactFlowProvider>
              </div>
            </div>

            {/* 데스크톱 상세 패널 */}
            <aside className="hidden h-[calc(100vh-330px)] min-h-[540px] overflow-y-auto overscroll-contain rounded-2xl border border-toss-line bg-white p-4 shadow-card lg:block" aria-label="상세 설명 패널">
              <AnimatePresence mode="wait" initial={false}>
                {detailContent ? (
                  <motion.div
                    key={`${selection?.kind}-${selection?.id}`}
                    initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
                    transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
                  >
                    {detailContent}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full flex-col items-center justify-center gap-2 text-center"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-toss-surface text-toss-muted">
                      <MousePointerClick size={20} />
                    </span>
                    <p className="text-[14px] font-extrabold">노드나 연결선을 선택하세요</p>
                    <p className="max-w-[220px] text-[12px] font-medium leading-5 text-toss-muted">
                      노드는 제품의 파트를, 연결선은 파트 사이에 이동하는 정보와 조건을 설명합니다.
                    </p>
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-left text-[11px] font-medium leading-4 text-amber-900">
                      <CircleHelp size={13} className="mt-0.5 shrink-0 text-amber-600" />
                      이 맵은 공개 자료 기반 이해 모델입니다. 내부 구현은 CONFIRM으로 표시됩니다.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </aside>

            {/* 모바일·태블릿 bottom sheet */}
            <AnimatePresence>
              {detailContent && (
                <motion.div
                  key="sheet"
                  initial={reducedMotion ? false : { y: '100%' }}
                  animate={{ y: 0 }}
                  exit={reducedMotion ? undefined : { y: '100%' }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 34 }}
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[72vh] overflow-hidden rounded-t-3xl border-t border-toss-line bg-white shadow-2xl lg:hidden"
                  role="dialog"
                  aria-label="상세 설명"
                >
                  <div className="sticky top-0 z-10 border-b border-toss-line bg-white px-4 pb-2 pt-2.5">
                    <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-toss-line" />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[12px] font-extrabold text-toss-muted">{selectedNode ? '노드 상세' : '연결 관계 상세'}</p>
                      <button onClick={clear} className="rounded-lg p-1.5 text-toss-muted hover:bg-toss-surface" aria-label="상세 패널 닫기">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[calc(72vh-64px)] overflow-y-auto overscroll-contain p-4">{detailContent}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="roadmap"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: 'easeOut' }}
          >
            <WritingRoadmap project={project} onOpenDoc={onOpenDoc} />
          </motion.div>
        )}
    </div>
  )
}
