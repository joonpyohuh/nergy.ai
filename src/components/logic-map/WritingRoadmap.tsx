import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CircleAlert, PenLine, TrendingUp } from 'lucide-react'
import {
  DOC_STATUS_LABEL,
  DOC_STATUS_ORDER,
  type Audience,
  type DocStatus,
  type LogicNode,
  type Project,
} from '../../data'
import { ROADMAP_STAGES, computeRoadmapStats, groupDocsByStage } from '../../lib/roadmap'
import { RoadmapStage } from './RoadmapStage'

interface WritingRoadmapProps {
  project: Project
  onOpenDoc: (docId: string) => void
}

const AUDIENCE_OPTIONS: Array<Audience | '모두'> = ['모두', '개발자', '운영팀', '마케터·디자이너']

export function WritingRoadmap({ project, onOpenDoc }: WritingRoadmapProps) {
  const reducedMotion = useReducedMotion() ?? false
  const [nodeFilter, setNodeFilter] = useState<string>('all')
  const [audienceFilter, setAudienceFilter] = useState<Audience | '모두'>('모두')
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all')

  const filteredDocs = useMemo(
    () =>
      project.docs.filter((doc) => {
        const nodeOk = nodeFilter === 'all' || doc.nodeId === nodeFilter
        const audienceOk = audienceFilter === '모두' || doc.audience === audienceFilter || doc.audience === '모두'
        const statusOk = statusFilter === 'all' || doc.status === statusFilter
        return nodeOk && audienceOk && statusOk
      }),
    [project.docs, nodeFilter, audienceFilter, statusFilter],
  )

  const stats = useMemo(() => computeRoadmapStats(project.docs), [project.docs])
  const grouped = useMemo(() => groupDocsByStage(filteredDocs), [filteredDocs])
  const nodesById = useMemo(() => Object.fromEntries(project.nodes.map((n) => [n.id, n])) as Record<string, LogicNode>, [project.nodes])

  // 진행선: 마지막으로 문서가 존재하는 단계까지 채운다.
  const lastActiveStageIndex = useMemo(() => {
    let last = -1
    ROADMAP_STAGES.forEach((stage, i) => {
      if (grouped[stage.id].length > 0) last = i
    })
    return last
  }, [grouped])

  const selectClass = 'rounded-xl border border-toss-line bg-white px-2.5 py-2 text-[12px] font-bold text-toss-text outline-none focus:border-blue-300'

  return (
    <div>
      {/* 진행률 요약 */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-toss-line bg-white p-3.5 shadow-card">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-toss-muted">
            <TrendingUp size={12} /> 전체 진행률
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[22px] font-extrabold tracking-tight text-toss-blue">{stats.progressPercent}%</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-toss-surface" role="progressbar" aria-valuenow={stats.progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <motion.div
                className="h-full rounded-full bg-toss-blue"
                initial={reducedMotion ? false : { width: 0 }}
                animate={{ width: `${stats.progressPercent}%` }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-toss-muted">
            {stats.done}/{stats.total} 문서 완료
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-card">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
            <CircleAlert size={12} /> 확인 필요 (CONFIRM)
          </p>
          <p className="mt-2 text-[22px] font-extrabold tracking-tight text-amber-700">{stats.confirmCount}건</p>
          <p className="mt-1.5 text-[11px] font-semibold text-amber-800/80">담당자 확인 후 Define으로 이동하세요</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-3.5 shadow-card">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-violet-800">
            <PenLine size={12} /> 작성 중
          </p>
          <p className="mt-2 text-[22px] font-extrabold tracking-tight text-violet-700">{stats.draftingCount}건</p>
          <p className="mt-1.5 text-[11px] font-semibold text-violet-800/80">현재 초안이 진행되고 있어요</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-toss-muted">
          로직 노드
          <select value={nodeFilter} onChange={(e) => setNodeFilter(e.target.value)} className={selectClass} aria-label="제품 로직 노드 필터">
            <option value="all">전체 노드</option>
            {project.nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.step} {node.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-toss-muted">
          대상
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value as Audience | '모두')}
            className={selectClass}
            aria-label="대상 독자 필터"
          >
            {AUDIENCE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-toss-muted">
          상태
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DocStatus | 'all')}
            className={selectClass}
            aria-label="문서 상태 필터"
          >
            <option value="all">전체 상태</option>
            {DOC_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {DOC_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 단계 타임라인 */}
      <div className="relative mt-5">
        <div aria-hidden className="absolute left-3 right-3 top-3 hidden h-0.5 rounded-full bg-toss-line lg:block">
          <motion.div
            className="h-full rounded-full bg-toss-blue"
            initial={reducedMotion ? false : { width: 0 }}
            animate={{ width: lastActiveStageIndex >= 0 ? `${((lastActiveStageIndex + 0.5) / ROADMAP_STAGES.length) * 100}%` : '0%' }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="relative flex snap-x gap-4 overflow-x-auto pb-3">
          {ROADMAP_STAGES.map((stage, index) => (
            <RoadmapStage
              key={stage.id}
              stageId={stage.id}
              label={stage.label}
              description={stage.description}
              index={index}
              docs={grouped[stage.id]}
              nodesById={nodesById}
              recommendedDocId={stats.recommendedDocId}
              completed={index <= lastActiveStageIndex}
              onOpenDoc={onOpenDoc}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
