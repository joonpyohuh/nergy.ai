import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, FileText, Quote } from 'lucide-react'
import type { DocSuggestion, LogicEdge, LogicNode, StakeholderRole } from '../../data'
import { RELATIONSHIP_TYPE_LABEL } from '../../data'
import { getNodeConnections } from '../../lib/graph'
import { EvidenceBadge, StatusBadge } from '../badges'
import { RolePerspectiveTabs } from './RolePerspectiveTabs'

interface NodeDetailPanelProps {
  node: LogicNode
  edges: LogicEdge[]
  docs: DocSuggestion[]
  role: StakeholderRole
  nodeTitleById: Record<string, string>
  onSelectEdge: (id: string) => void
  onOpenDoc: (docId: string) => void
  onOpenDocsTab: () => void
}

function ConnectionButton({
  edge,
  direction,
  nodeTitleById,
  onSelectEdge,
}: {
  edge: LogicEdge
  direction: 'in' | 'out'
  nodeTitleById: Record<string, string>
  onSelectEdge: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelectEdge(edge.id)}
      className="flex w-full items-center gap-2 rounded-xl border border-toss-line px-2.5 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
      aria-label={`연결 상세 보기: ${edge.label}`}
    >
      {direction === 'in' ? (
        <ArrowDownToLine size={13} className="shrink-0 text-toss-muted" />
      ) : (
        <ArrowUpFromLine size={13} className="shrink-0 text-toss-blue" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-bold">{edge.label}</span>
        <span className="block truncate text-[10px] font-semibold text-toss-muted">
          {direction === 'in' ? `${nodeTitleById[edge.source] ?? edge.source} 에서` : `${nodeTitleById[edge.target] ?? edge.target} (으)로`} ·{' '}
          {RELATIONSHIP_TYPE_LABEL[edge.type]}
        </span>
      </span>
      <EvidenceBadge value={edge.evidence} />
    </button>
  )
}

export function NodeDetailPanel({ node, edges, docs, role, nodeTitleById, onSelectEdge, onOpenDoc, onOpenDocsTab }: NodeDetailPanelProps) {
  const Icon = node.icon
  const relatedDocs = docs.filter((d) => d.nodeId === node.id)
  const { incoming, outgoing } = getNodeConnections(node.id, edges)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-start gap-3">
          <span style={{ background: node.color }} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white">
            <Icon size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-wide text-toss-muted">STEP {node.step}</p>
            <h3 className="text-[16px] font-extrabold leading-6">{node.title}</h3>
          </div>
        </div>
        <p className="mt-2 text-[13px] font-semibold leading-5 text-toss-text">{node.plain}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <EvidenceBadge value={node.evidence} />
          <span className="flex items-center gap-1 text-[11px] font-bold text-toss-blue">
            <FileText size={11} /> 관련 문서 {relatedDocs.length}개
          </span>
        </div>
      </div>

      {/* 한눈에 이해하기 */}
      <section aria-label="한눈에 이해하기">
        <h4 className="text-[12px] font-extrabold text-toss-dark">한눈에 이해하기</h4>
        <p className="mt-1.5 text-[12.5px] font-medium leading-5 text-toss-text">{node.detail}</p>
      </section>

      {/* 입력과 출력 */}
      <section aria-label="입력과 출력">
        <h4 className="text-[12px] font-extrabold text-toss-dark">입력과 출력</h4>
        <div className="mt-2 grid gap-2">
          <div className="rounded-xl border border-toss-line bg-toss-surface/60 p-2.5">
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-toss-muted">
              <ArrowDownToLine size={11} /> 받는 정보
            </p>
            <ul className="mt-1 space-y-0.5">
              {node.inputs.map((input) => (
                <li key={input} className="text-[12px] font-medium leading-5 text-toss-text">
                  · {input}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-blue-700">
              <ArrowUpFromLine size={11} /> 만들어내는 정보
            </p>
            <ul className="mt-1 space-y-0.5">
              {node.outputs.map((output) => (
                <li key={output} className="text-[12px] font-medium leading-5 text-toss-text">
                  · {output}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 실제 예시 */}
      {node.example && (
        <section aria-label="실제 예시">
          <h4 className="text-[12px] font-extrabold text-toss-dark">실제 예시</h4>
          <div className="mt-1.5 flex gap-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
            <Quote size={13} className="mt-0.5 shrink-0 text-violet-400" />
            <p className="text-[12px] font-semibold leading-5 text-toss-text">{node.example}</p>
          </div>
        </section>
      )}

      {/* 직군별 관점 */}
      <section aria-label="직군별 관점">
        <h4 className="text-[12px] font-extrabold text-toss-dark">직군별 관점</h4>
        <div className="mt-2">
          <RolePerspectiveTabs explanations={node.roleExplanations} initialRole={role} />
        </div>
      </section>

      {/* 연결 관계 */}
      <section aria-label="연결 관계">
        <h4 className="text-[12px] font-extrabold text-toss-dark">연결 관계</h4>
        <div className="mt-2 space-y-1.5">
          {incoming.length > 0 && <p className="text-[10px] font-extrabold text-toss-muted">들어오는 연결</p>}
          {incoming.map((edge) => (
            <ConnectionButton key={edge.id} edge={edge} direction="in" nodeTitleById={nodeTitleById} onSelectEdge={onSelectEdge} />
          ))}
          {outgoing.length > 0 && <p className="pt-1 text-[10px] font-extrabold text-toss-muted">나가는 연결</p>}
          {outgoing.map((edge) => (
            <ConnectionButton key={edge.id} edge={edge} direction="out" nodeTitleById={nodeTitleById} onSelectEdge={onSelectEdge} />
          ))}
          {incoming.length === 0 && outgoing.length === 0 && (
            <p className="text-[12px] font-medium text-toss-muted">이 노드에 연결된 관계가 없습니다.</p>
          )}
        </div>
      </section>

      {/* Documentation Opportunities */}
      <section aria-label="Documentation Opportunities">
        <h4 className="text-[12px] font-extrabold text-toss-dark">Documentation Opportunities</h4>
        <div className="mt-2 space-y-2">
          {relatedDocs.map((doc) => (
            <article key={doc.id} className="rounded-xl border border-toss-line p-3">
              <div className="flex items-center justify-between gap-2">
                <EvidenceBadge value={doc.evidence} />
                <StatusBadge status={doc.status} />
              </div>
              <p className="mt-2 text-[13px] font-extrabold leading-4">{doc.title}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-toss-muted">
                {doc.kind} · {doc.audience}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[11.5px] font-medium leading-4 text-toss-text">{doc.reason}</p>
              <button
                onClick={() => onOpenDoc(doc.id)}
                className="mt-2.5 w-full rounded-lg bg-toss-blue py-2 text-[12px] font-bold text-white transition hover:bg-[#1B64DA]"
              >
                에디터에서 열기
              </button>
            </article>
          ))}
          {relatedDocs.length === 0 && <p className="text-[12px] font-medium text-toss-muted">아직 이 노드에 연결된 문서 후보가 없습니다.</p>}
        </div>
        <button
          onClick={onOpenDocsTab}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-toss-surface py-2.5 text-[12px] font-bold transition hover:bg-blue-50 hover:text-toss-blue"
        >
          전체 문서 큐 보기 <ArrowRight size={14} />
        </button>
      </section>
    </div>
  )
}
