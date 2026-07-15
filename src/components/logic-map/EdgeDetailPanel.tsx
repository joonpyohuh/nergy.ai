import { AlertTriangle, ArrowRight, CheckCircle2, Database, FileText, Zap } from 'lucide-react'
import type { DocSuggestion, LogicEdge, LogicNode } from '../../data'
import { EvidenceBadge, RelationshipTypeBadge, StatusBadge } from '../badges'

interface EdgeDetailPanelProps {
  edge: LogicEdge
  nodes: LogicNode[]
  docs: DocSuggestion[]
  onSelectNode: (id: string) => void
  onOpenDoc: (docId: string) => void
}

function NodeChip({ node, label, onSelectNode }: { node: LogicNode | undefined; label: string; onSelectNode: (id: string) => void }) {
  if (!node) return null
  const Icon = node.icon
  return (
    <button
      onClick={() => onSelectNode(node.id)}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-toss-line px-2.5 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
      aria-label={`${label} 노드 보기: ${node.title}`}
    >
      <span style={{ color: node.color, background: `${node.color}16` }} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg">
        <Icon size={13} />
      </span>
      <span className="min-w-0">
        <span className="block text-[9px] font-extrabold text-toss-muted">{label}</span>
        <span className="block truncate text-[12px] font-bold">{node.title}</span>
      </span>
    </button>
  )
}

export function EdgeDetailPanel({ edge, nodes, docs, onSelectNode, onOpenDoc }: EdgeDetailPanelProps) {
  const sourceNode = nodes.find((n) => n.id === edge.source)
  const targetNode = nodes.find((n) => n.id === edge.target)
  const relatedDocs = docs.filter((d) => d.nodeId === edge.source || d.nodeId === edge.target)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <RelationshipTypeBadge type={edge.type} />
          <EvidenceBadge value={edge.evidence} />
        </div>
        <h3 className="mt-2 text-[16px] font-extrabold leading-6">{edge.label}</h3>
        <div className="mt-3 flex items-center gap-1.5">
          <NodeChip node={sourceNode} label="출발" onSelectNode={onSelectNode} />
          <ArrowRight size={14} className="shrink-0 text-toss-muted" />
          <NodeChip node={targetNode} label="도착" onSelectNode={onSelectNode} />
        </div>
      </div>

      {/* 왜 연결되는가 */}
      <section aria-label="연결 이유">
        <h4 className="text-[12px] font-extrabold text-toss-dark">왜 연결되나요?</h4>
        <p className="mt-1.5 text-[12.5px] font-medium leading-5 text-toss-text">{edge.summary}</p>
      </section>

      {/* Trigger */}
      <section aria-label="연결 시작 조건">
        <h4 className="flex items-center gap-1 text-[12px] font-extrabold text-toss-dark">
          <Zap size={12} className="text-amber-500" /> 언제 시작되나요?
        </h4>
        <p className="mt-1.5 rounded-xl bg-amber-50/70 px-3 py-2 text-[12px] font-semibold leading-5 text-amber-900">{edge.trigger}</p>
      </section>

      {/* 전달 정보 */}
      <section aria-label="전달되는 정보">
        <h4 className="flex items-center gap-1 text-[12px] font-extrabold text-toss-dark">
          <Database size={12} className="text-toss-blue" /> 무엇이 전달되나요?
        </h4>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {edge.transferredData.map((item) => (
            <span key={item} className="rounded-lg border border-blue-100 bg-blue-50/70 px-2 py-1 text-[11px] font-bold text-blue-800">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* 성공 조건 */}
      <section aria-label="성공 조건">
        <h4 className="flex items-center gap-1 text-[12px] font-extrabold text-toss-dark">
          <CheckCircle2 size={12} className="text-emerald-500" /> 성공 조건
        </h4>
        <p className="mt-1.5 rounded-xl bg-emerald-50/70 px-3 py-2 text-[12px] font-semibold leading-5 text-emerald-900">
          {edge.successCondition}
        </p>
      </section>

      {/* 리스크 */}
      <section aria-label="실패 지점과 리스크">
        <h4 className="flex items-center gap-1 text-[12px] font-extrabold text-toss-dark">
          <AlertTriangle size={12} className="text-red-500" /> 실패할 수 있는 지점
        </h4>
        <ul className="mt-1.5 space-y-1.5">
          {edge.risks.map((risk) => (
            <li key={risk} className="rounded-lg border border-red-100 bg-red-50/50 px-2.5 py-1.5 text-[12px] font-medium leading-4 text-red-900">
              {risk}
            </li>
          ))}
        </ul>
      </section>

      {/* 필요한 문서 */}
      <section aria-label="이 연결 때문에 필요한 문서">
        <h4 className="flex items-center gap-1 text-[12px] font-extrabold text-toss-dark">
          <FileText size={12} className="text-toss-blue" /> 이 연결 때문에 필요한 문서
        </h4>
        {edge.documentationOpportunities.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {edge.documentationOpportunities.map((item) => (
              <span key={item} className="rounded-lg bg-toss-surface px-2 py-1 text-[11px] font-bold text-toss-text">
                {item}
              </span>
            ))}
          </div>
        )}
        {relatedDocs.length > 0 && (
          <div className="mt-2.5 space-y-2">
            {relatedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-2 rounded-xl border border-toss-line px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-extrabold">{doc.title}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <EvidenceBadge value={doc.evidence} />
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
                <button
                  onClick={() => onOpenDoc(doc.id)}
                  className="shrink-0 rounded-lg bg-toss-blue px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#1B64DA]"
                >
                  문서 열기
                </button>
              </div>
            ))}
          </div>
        )}
        {edge.documentationOpportunities.length === 0 && relatedDocs.length === 0 && (
          <p className="mt-1.5 text-[12px] font-medium text-toss-muted">아직 연결된 문서 후보가 없습니다.</p>
        )}
      </section>
    </div>
  )
}
