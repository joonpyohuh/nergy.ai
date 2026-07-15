import type { DocSuggestion } from '../data'

export type RoadmapStageId = 'understand' | 'confirm' | 'define' | 'draft' | 'review' | 'publish'

export const ROADMAP_STAGES: Array<{ id: RoadmapStageId; label: string; description: string }> = [
  { id: 'understand', label: 'Understand', description: '제품 구조를 이해하는 단계' },
  { id: 'confirm', label: 'Confirm', description: '내부 확인이 필요한 항목' },
  { id: 'define', label: 'Define', description: '범위와 outline을 정의' },
  { id: 'draft', label: 'Draft', description: '초안 작성 중' },
  { id: 'review', label: 'Review', description: '리뷰 진행 중' },
  { id: 'publish', label: 'Publish', description: '완료·배포됨' },
]

/** 문서의 상태와 근거에 따라 로드맵 단계를 계산한다. */
export function roadmapStageForDoc(doc: Pick<DocSuggestion, 'status' | 'evidence'>): RoadmapStageId {
  switch (doc.status) {
    case 'done':
      return 'publish'
    case 'review':
      return 'review'
    case 'drafting':
      return 'draft'
    case 'planned':
      return 'define'
    case 'backlog':
    default:
      return doc.evidence === 'CONFIRM' ? 'confirm' : 'understand'
  }
}

export interface RoadmapStats {
  total: number
  done: number
  progressPercent: number
  confirmCount: number
  draftingCount: number
  /** 다음으로 작성을 추천하는 문서 */
  recommendedDocId: string | null
}

export function computeRoadmapStats(docs: DocSuggestion[]): RoadmapStats {
  const total = docs.length
  const done = docs.filter((d) => d.status === 'done').length
  const confirmCount = docs.filter((d) => roadmapStageForDoc(d) === 'confirm').length
  const draftingCount = docs.filter((d) => d.status === 'drafting').length

  const recommended =
    docs.find((d) => d.status === 'planned') ??
    docs.find((d) => d.status === 'backlog' && d.evidence !== 'CONFIRM') ??
    docs.find((d) => d.status === 'backlog') ??
    null

  return {
    total,
    done,
    progressPercent: total ? Math.round((done / total) * 100) : 0,
    confirmCount,
    draftingCount,
    recommendedDocId: recommended?.id ?? null,
  }
}

export function groupDocsByStage(docs: DocSuggestion[]): Record<RoadmapStageId, DocSuggestion[]> {
  const groups: Record<RoadmapStageId, DocSuggestion[]> = {
    understand: [],
    confirm: [],
    define: [],
    draft: [],
    review: [],
    publish: [],
  }
  docs.forEach((doc) => {
    groups[roadmapStageForDoc(doc)].push(doc)
  })
  return groups
}
