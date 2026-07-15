import { describe, expect, it } from 'vitest'
import type { DocSuggestion } from '../data'
import { computeRoadmapStats, groupDocsByStage, roadmapStageForDoc } from './roadmap'

function doc(partial: Partial<DocSuggestion>): DocSuggestion {
  return {
    id: partial.id ?? 'doc',
    title: '문서',
    kind: 'Concept guide',
    audience: '모두',
    reason: '',
    outline: [],
    evidence: 'DOCS',
    nodeId: 'a',
    status: 'backlog',
    notes: '',
    assignee: '',
    updatedAt: '2026-07-15T00:00:00.000Z',
    ...partial,
  }
}

describe('roadmapStageForDoc', () => {
  it('문서 상태와 근거에 따라 로드맵 단계를 계산한다', () => {
    expect(roadmapStageForDoc(doc({ status: 'done' }))).toBe('publish')
    expect(roadmapStageForDoc(doc({ status: 'review' }))).toBe('review')
    expect(roadmapStageForDoc(doc({ status: 'drafting' }))).toBe('draft')
    expect(roadmapStageForDoc(doc({ status: 'planned' }))).toBe('define')
    expect(roadmapStageForDoc(doc({ status: 'backlog', evidence: 'CONFIRM' }))).toBe('confirm')
    expect(roadmapStageForDoc(doc({ status: 'backlog', evidence: 'DOCS' }))).toBe('understand')
  })
})

describe('groupDocsByStage', () => {
  it('문서를 단계별로 그룹화한다', () => {
    const grouped = groupDocsByStage([
      doc({ id: 'a', status: 'drafting' }),
      doc({ id: 'b', status: 'backlog', evidence: 'CONFIRM' }),
      doc({ id: 'c', status: 'done' }),
    ])
    expect(grouped.draft.map((d) => d.id)).toEqual(['a'])
    expect(grouped.confirm.map((d) => d.id)).toEqual(['b'])
    expect(grouped.publish.map((d) => d.id)).toEqual(['c'])
    expect(grouped.understand).toHaveLength(0)
  })
})

describe('computeRoadmapStats', () => {
  it('진행률·CONFIRM 수·작성 중 수·추천 문서를 계산한다', () => {
    const docs = [
      doc({ id: 'p', status: 'planned' }),
      doc({ id: 'd', status: 'drafting' }),
      doc({ id: 'c', status: 'backlog', evidence: 'CONFIRM' }),
      doc({ id: 'done', status: 'done' }),
    ]
    const stats = computeRoadmapStats(docs)

    expect(stats.total).toBe(4)
    expect(stats.done).toBe(1)
    expect(stats.progressPercent).toBe(25)
    expect(stats.confirmCount).toBe(1)
    expect(stats.draftingCount).toBe(1)
    expect(stats.recommendedDocId).toBe('p')
  })

  it('문서가 없으면 0으로 안전하게 계산한다', () => {
    const stats = computeRoadmapStats([])
    expect(stats.progressPercent).toBe(0)
    expect(stats.recommendedDocId).toBeNull()
  })
})
