import { DOC_STATUS_LABEL, RELATIONSHIP_TYPE_LABEL, type DocStatus, type Evidence, type RelationshipType } from '../data'

const evidenceStyle: Record<Evidence, string> = {
  DOCS: 'bg-blue-50 text-blue-700 border-blue-100',
  SPEC: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CONFIRM: 'bg-amber-50 text-amber-700 border-amber-100',
}

const evidenceTitle: Record<Evidence, string> = {
  DOCS: '공개 문서로 확인됨',
  SPEC: '내부 스펙으로 확인됨',
  CONFIRM: '담당자 확인 필요',
}

export function EvidenceBadge({ value }: { value: Evidence }) {
  return (
    <span
      title={evidenceTitle[value]}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${evidenceStyle[value]}`}
    >
      {value}
    </span>
  )
}

export function StatusBadge({ status }: { status: DocStatus }) {
  const styles: Record<DocStatus, string> = {
    backlog: 'bg-toss-surface text-toss-muted',
    planned: 'bg-blue-50 text-blue-700',
    drafting: 'bg-violet-50 text-violet-700',
    review: 'bg-amber-50 text-amber-700',
    done: 'bg-emerald-50 text-emerald-700',
  }
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>{DOC_STATUS_LABEL[status]}</span>
}

const relationshipStyle: Record<RelationshipType, string> = {
  data: 'bg-blue-50 text-blue-700',
  event: 'bg-sky-50 text-sky-700',
  decision: 'bg-amber-50 text-amber-700',
  control: 'bg-slate-100 text-slate-700',
  handoff: 'bg-red-50 text-red-700',
  feedback: 'bg-emerald-50 text-emerald-700',
}

export function RelationshipTypeBadge({ type }: { type: RelationshipType }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${relationshipStyle[type]}`}>
      {RELATIONSHIP_TYPE_LABEL[type]}
    </span>
  )
}
