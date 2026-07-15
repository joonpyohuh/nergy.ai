import { describe, expect, it } from 'vitest'
import type { LogicEdge, Project } from '../data'
import { buildFallbackEdges, buildProjectFromAnalysis, migrateProject, sanitizeEdges, sanitizeNode } from './projectMigration'

function legacyProject(): Project {
  // v1 저장 형식: edges·inputs·outputs·evidence·roleExplanations 없음
  return {
    id: 'proj-legacy',
    name: 'Legacy Product',
    url: 'https://legacy.example.com',
    description: '구버전 저장 데이터',
    status: 'ready',
    analyzedAt: '2026-07-01T00:00:00.000Z',
    sourceCount: 1,
    nodes: [
      { id: 'a', step: '01', title: '입력 받기', plain: '입력', detail: '', example: '', color: '#3182F6' },
      { id: 'b', step: '02', title: '처리하기', plain: '처리', detail: '', example: '', color: '#8B5CF6' },
      { id: 'c', step: '03', title: '응답하기', plain: '응답', detail: '', example: '', color: '#F59E0B' },
    ] as never,
    edges: undefined as never,
    docs: [
      {
        id: 'doc-1',
        title: '기존 문서',
        kind: 'Concept guide',
        audience: '모두',
        reason: '이유',
        outline: ['서론'],
        evidence: 'DOCS',
        nodeId: 'a',
        status: 'drafting',
        notes: '작성 중 메모',
        assignee: '나',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
    ],
    sources: [{ title: 'Home', url: 'https://legacy.example.com', date: '확인: 2026.07.01', note: '' }],
  }
}

describe('migrateProject', () => {
  it('edges가 없는 기존 프로젝트를 노드 순서 기반 기본 edge로 마이그레이션한다', () => {
    const migrated = migrateProject(legacyProject())

    expect(migrated.edges).toHaveLength(2)
    expect(migrated.edges[0].source).toBe('a')
    expect(migrated.edges[0].target).toBe('b')
    // 단순 "Step 1 → Step 2"가 아니라 노드 제목 기반 label
    expect(migrated.edges[0].label).toContain('입력 받기')
    expect(migrated.edges[0].label).toContain('처리하기')
    expect(migrated.edges[0].evidence).toBe('CONFIRM')
  })

  it('기존 노드에 새 필드(inputs·outputs·evidence·roleExplanations)의 안전한 기본값을 채운다', () => {
    const migrated = migrateProject(legacyProject())
    const node = migrated.nodes[0]

    expect(node.inputs.length).toBeGreaterThan(0)
    expect(node.outputs.length).toBeGreaterThan(0)
    expect(node.evidence).toBe('CONFIRM')
    expect(node.roleExplanations.marketer.summary).toBeTruthy()
    expect(node.roleExplanations.developer.keyQuestions.length).toBeGreaterThan(0)
    expect(typeof node.icon).not.toBe('undefined')
  })

  it('기존 문서 상태·노트·담당자를 보존한다', () => {
    const migrated = migrateProject(legacyProject())
    expect(migrated.docs[0].status).toBe('drafting')
    expect(migrated.docs[0].notes).toBe('작성 중 메모')
    expect(migrated.docs[0].assignee).toBe('나')
  })

  it('유효하지 않은 source/target을 가진 edge를 제거한다', () => {
    const project = legacyProject()
    project.edges = [
      { id: 'ok', source: 'a', target: 'b', label: 'ok' },
      { id: 'bad-target', source: 'a', target: 'missing' },
      { id: 'bad-source', source: 'ghost', target: 'b' },
      { id: 'self', source: 'a', target: 'a' },
    ] as never
    const migrated = migrateProject(project)

    expect(migrated.edges).toHaveLength(1)
    expect(migrated.edges[0].id).toBe('ok')
    expect(migrated.edges[0].summary).toBeTruthy()
    expect(migrated.edges[0].transferredData.length).toBeGreaterThan(0)
  })
})

describe('sanitize helpers', () => {
  it('buildFallbackEdges는 노드 1개면 빈 배열을 반환한다', () => {
    const node = sanitizeNode({ id: 'only', title: '단일' }, 0)
    expect(buildFallbackEdges([node])).toHaveLength(0)
  })

  it('sanitizeEdges는 중복 edge를 제거한다', () => {
    const nodes = [sanitizeNode({ id: 'a', title: 'A' }, 0), sanitizeNode({ id: 'b', title: 'B' }, 1)]
    const raw: Array<Partial<LogicEdge>> = [
      { source: 'a', target: 'b', label: '같은 연결' },
      { source: 'a', target: 'b', label: '같은 연결' },
    ]
    expect(sanitizeEdges(raw, nodes)).toHaveLength(1)
  })
})

describe('buildProjectFromAnalysis', () => {
  it('새 필드가 전혀 없는 구버전 분석 결과에도 크래시 없이 프로젝트를 만든다', () => {
    const project = buildProjectFromAnalysis('https://acme.dev', {
      name: 'acme.dev',
      nodes: [
        { id: 'one', title: '단계 1', plain: '설명' },
        { id: 'two', title: '단계 2', plain: '설명' },
      ],
      docs: [{ id: 'd1', title: '가이드', nodeId: 'one' }],
    })

    expect(project.nodes).toHaveLength(2)
    expect(project.nodes[0].roleExplanations.operator.summary).toBeTruthy()
    expect(project.edges).toHaveLength(1)
    expect(project.edges[0].label).toContain('단계 1')
    expect(project.docs[0].status).toBe('backlog')
  })

  it('분석 결과의 edge에서 유효한 것만 사용한다', () => {
    const project = buildProjectFromAnalysis('https://acme.dev', {
      nodes: [
        { id: 'one', title: 'A' },
        { id: 'two', title: 'B' },
      ],
      edges: [
        { source: 'one', target: 'two', label: '데이터 전달', type: 'data', evidence: 'DOCS' },
        { source: 'one', target: 'nope', label: '깨진 연결' },
      ],
    })

    expect(project.edges).toHaveLength(1)
    expect(project.edges[0].label).toBe('데이터 전달')
    expect(project.edges[0].evidence).toBe('DOCS')
  })

  it('분석 결과가 완전히 비어 있어도 기본 노드·문서를 생성한다', () => {
    const project = buildProjectFromAnalysis('acme.dev', {})
    expect(project.nodes.length).toBeGreaterThan(0)
    expect(project.docs.length).toBeGreaterThan(0)
    expect(project.url).toBe('https://acme.dev')
  })
})
