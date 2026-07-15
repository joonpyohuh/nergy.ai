import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { DocSuggestion, LogicNode } from '../../data'
import type { RoadmapStageId } from '../../lib/roadmap'
import { EvidenceBadge, StatusBadge } from '../badges'

interface RoadmapStageProps {
  stageId: RoadmapStageId
  label: string
  description: string
  index: number
  docs: DocSuggestion[]
  nodesById: Record<string, LogicNode>
  recommendedDocId: string | null
  completed: boolean
  onOpenDoc: (docId: string) => void
}

const stageAccent: Record<RoadmapStageId, string> = {
  understand: '#8B95A1',
  confirm: '#F59E0B',
  define: '#3182F6',
  draft: '#8B5CF6',
  review: '#F97316',
  publish: '#10B981',
}

export function RoadmapStage({ stageId, label, description, index, docs, nodesById, recommendedDocId, completed, onOpenDoc }: RoadmapStageProps) {
  const reducedMotion = useReducedMotion() ?? false
  const accent = stageAccent[stageId]

  return (
    <section aria-label={`${label} 단계 (${docs.length}개 문서)`} className="flex w-[248px] shrink-0 snap-start flex-col">
      <div className="flex items-center gap-2">
        <span
          className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-extrabold text-white"
          style={{ background: completed ? accent : docs.length ? accent : '#C3CBD4' }}
        >
          {index + 1}
        </span>
        <div>
          <h4 className="text-[13px] font-extrabold leading-4">{label}</h4>
          <p className="text-[10px] font-semibold text-toss-muted">{description}</p>
        </div>
        <span className="ml-auto rounded-md bg-toss-surface px-1.5 py-0.5 text-[10px] font-extrabold text-toss-muted">{docs.length}</span>
      </div>

      <div className="mt-3 flex-1 space-y-2 rounded-2xl border border-dashed border-toss-line bg-white/60 p-2">
        {docs.map((doc, docIndex) => {
          const node = nodesById[doc.nodeId]
          const recommended = doc.id === recommendedDocId
          return (
            <motion.button
              key={doc.id}
              layout={reducedMotion ? false : true}
              layoutId={reducedMotion ? undefined : `roadmap-${doc.id}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: index * 0.06 + docIndex * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
              onClick={() => onOpenDoc(doc.id)}
              className={`block w-full rounded-xl border bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-blue-200 ${
                recommended ? 'border-blue-300 ring-4 ring-blue-100' : 'border-toss-line'
              }`}
              aria-label={`${doc.title} 에디터에서 열기`}
            >
              {recommended && (
                <p className="mb-1.5 flex items-center gap-1 text-[10px] font-extrabold text-toss-blue">
                  <Sparkles size={10} /> 다음 추천 문서
                </p>
              )}
              <div className="flex items-center gap-1.5">
                <EvidenceBadge value={doc.evidence} />
                <StatusBadge status={doc.status} />
              </div>
              <p className="mt-2 text-[13px] font-extrabold leading-4">{doc.title}</p>
              <p className="mt-1 text-[10.5px] font-semibold text-toss-muted">
                {doc.kind} · {doc.audience}
              </p>
              {node && (
                <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-toss-surface px-2 py-1 text-[10.5px] font-bold text-toss-text">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: node.color }} />
                  제품 로직: {node.title}
                </p>
              )}
            </motion.button>
          )
        })}
        {docs.length === 0 && <p className="px-2 py-6 text-center text-[11px] font-semibold text-toss-muted">이 단계의 문서가 없어요</p>}
      </div>
    </section>
  )
}
