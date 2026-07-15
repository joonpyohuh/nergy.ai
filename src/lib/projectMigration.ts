import {
  NODE_COLORS,
  attachNodeIcons,
  createDelightProject,
  toSerializableNodes,
  type AnalysisPayload,
  type Audience,
  type DocSuggestion,
  type Evidence,
  type LogicEdge,
  type LogicNode,
  type NodeRoleExplanations,
  type Project,
  type RelationshipType,
  type RoleExplanation,
  type SerializableLogicNode,
  type Source,
} from '../data'

const AUDIENCES: Audience[] = ['모두', '개발자', '운영팀', '마케터·디자이너']
const EVIDENCES: Evidence[] = ['DOCS', 'SPEC', 'CONFIRM']
const RELATIONSHIP_TYPES: RelationshipType[] = ['data', 'event', 'decision', 'control', 'handoff', 'feedback']

export function asAudience(value: unknown): Audience {
  return AUDIENCES.includes(value as Audience) ? (value as Audience) : '모두'
}

export function asEvidence(value: unknown): Evidence {
  return EVIDENCES.includes(value as Evidence) ? (value as Evidence) : 'CONFIRM'
}

export function asRelationshipType(value: unknown): RelationshipType {
  return RELATIONSHIP_TYPES.includes(value as RelationshipType) ? (value as RelationshipType) : 'data'
}

export function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback
  const items = value.map((item) => String(item ?? '').trim()).filter(Boolean)
  return items.length ? items : fallback
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

function sanitizeRoleExplanation(raw: unknown, fallback: RoleExplanation): RoleExplanation {
  if (!raw || typeof raw !== 'object') return fallback
  const record = raw as Record<string, unknown>
  const expectedOutputs = asStringArray(record.expectedOutputs)
  return {
    summary: asString(record.summary, fallback.summary),
    whyItMatters: asString(record.whyItMatters, fallback.whyItMatters),
    keyQuestions: asStringArray(record.keyQuestions, fallback.keyQuestions),
    ...(expectedOutputs.length ? { expectedOutputs } : {}),
  }
}

export function defaultRoleExplanations(title: string, plain: string): NodeRoleExplanations {
  const base = plain || `'${title}' 단계의 동작`
  return {
    marketer: {
      summary: `${base} 이 단계가 고객 경험과 지표에 주는 영향을 확인하세요.`,
      whyItMatters: '이 단계의 품질이 전환·유지 같은 비즈니스 지표에 연결될 수 있어요.',
      keyQuestions: [`'${title}' 단계는 어떤 고객 지표와 연결되나요?`, '이 단계에서 마케팅이 참고할 데이터가 있나요?'],
    },
    designer: {
      summary: `${base} 사용자가 이 단계를 어떻게 경험하는지 확인하세요.`,
      whyItMatters: '이 단계에서 필요한 로딩·오류·대기 상태를 화면으로 정의해야 해요.',
      keyQuestions: [`'${title}' 진행 중 사용자에게 어떤 상태를 보여주나요?`, '실패하거나 지연될 때의 UX는 어떻게 되나요?'],
    },
    developer: {
      summary: `${base} 이 단계에 필요한 데이터·API·상태를 확인하세요.`,
      whyItMatters: '입력·출력 계약과 실패 조건을 정의해야 안정적으로 구현할 수 있어요.',
      keyQuestions: [`'${title}' 단계의 입력과 출력 계약은 무엇인가요?`, 'timeout·재시도·오류 처리 기준이 있나요?'],
    },
    operator: {
      summary: `${base} 운영 정책과 모니터링 관점에서 확인하세요.`,
      whyItMatters: '이 단계의 실패나 예외 상황에 대한 대응 절차가 필요해요.',
      keyQuestions: [`'${title}' 단계는 누가 모니터링하나요?`, '장애나 예외 상황의 대응 절차가 정의돼 있나요?'],
    },
  }
}

function sanitizeRoleExplanations(raw: unknown, title: string, plain: string): NodeRoleExplanations {
  const defaults = defaultRoleExplanations(title, plain)
  if (!raw || typeof raw !== 'object') return defaults
  const record = raw as Record<string, unknown>
  return {
    marketer: sanitizeRoleExplanation(record.marketer, defaults.marketer),
    designer: sanitizeRoleExplanation(record.designer, defaults.designer),
    developer: sanitizeRoleExplanation(record.developer, defaults.developer),
    operator: sanitizeRoleExplanation(record.operator, defaults.operator),
  }
}

export function sanitizeNode(raw: Partial<SerializableLogicNode> | undefined, index: number): SerializableLogicNode {
  const record = (raw ?? {}) as Record<string, unknown>
  const title = asString(record.title, `단계 ${index + 1}`)
  const plain = asString(record.plain)
  return {
    id: asString(record.id, `node-${index + 1}`),
    step: asString(record.step, String(index + 1).padStart(2, '0')),
    title,
    plain,
    detail: asString(record.detail),
    example: asString(record.example),
    color: asString(record.color, NODE_COLORS[index % NODE_COLORS.length]),
    ...(record.stage != null ? { stage: asString(record.stage) } : {}),
    inputs: asStringArray(record.inputs, ['이전 단계의 결과']),
    outputs: asStringArray(record.outputs, ['다음 단계로 전달되는 결과']),
    evidence: asEvidence(record.evidence),
    roleExplanations: sanitizeRoleExplanations(record.roleExplanations, title, plain),
  }
}

export function sanitizeEdge(raw: Partial<LogicEdge> | undefined, index: number, nodesById: Map<string, SerializableLogicNode>): LogicEdge | null {
  const record = (raw ?? {}) as Record<string, unknown>
  const source = asString(record.source)
  const target = asString(record.target)
  const sourceNode = nodesById.get(source)
  const targetNode = nodesById.get(target)
  if (!sourceNode || !targetNode || source === target) return null

  const label = asString(record.label, `${sourceNode.title} → ${targetNode.title}`)
  return {
    id: asString(record.id, `edge-${index + 1}-${source}-${target}`),
    source,
    target,
    label,
    type: asRelationshipType(record.type),
    summary: asString(record.summary, `${sourceNode.title} 단계의 결과가 ${targetNode.title} 단계로 이어집니다.`),
    trigger: asString(record.trigger, `${sourceNode.title} 단계가 완료됐을 때`),
    transferredData: asStringArray(record.transferredData, sourceNode.outputs.slice(0, 3)),
    successCondition: asString(record.successCondition, `${targetNode.title} 단계가 필요한 정보를 받아 시작된다.`),
    risks: asStringArray(record.risks, ['전달 정보 누락 시 다음 단계가 불완전하게 동작할 수 있음']),
    evidence: asEvidence(record.evidence),
    documentationOpportunities: asStringArray(record.documentationOpportunities),
  }
}

export function buildFallbackEdges(nodes: SerializableLogicNode[]): LogicEdge[] {
  const edges: LogicEdge[] = []
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const source = nodes[i]
    const target = nodes[i + 1]
    edges.push({
      id: `edge-${source.id}-${target.id}`,
      source: source.id,
      target: target.id,
      label: `${source.title} → ${target.title}`,
      type: 'data',
      summary: `${source.title} 단계의 결과가 ${target.title} 단계의 입력으로 이어집니다. 정확한 연결 조건은 확인이 필요합니다.`,
      trigger: `${source.title} 단계가 완료됐을 때`,
      transferredData: source.outputs.slice(0, 3),
      successCondition: `${target.title} 단계가 필요한 정보를 받아 시작된다.`,
      risks: ['연결 세부 조건이 아직 확인되지 않음'],
      evidence: 'CONFIRM',
      documentationOpportunities: [],
    })
  }
  return edges
}

export function sanitizeEdges(rawEdges: Array<Partial<LogicEdge>> | undefined, nodes: SerializableLogicNode[]): LogicEdge[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const seen = new Set<string>()
  const edges = (rawEdges ?? [])
    .map((raw, index) => sanitizeEdge(raw, index, nodesById))
    .filter((edge): edge is LogicEdge => edge !== null)
    .filter((edge) => {
      const key = `${edge.source}→${edge.target}:${edge.label}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  return edges.length ? edges : buildFallbackEdges(nodes)
}

/**
 * localStorage에 저장된 프로젝트(구버전 포함)를 현재 데이터 모델로 복원한다.
 * 구버전 프로젝트에는 edges·inputs·outputs·evidence·roleExplanations가 없다.
 */
export function migrateProject(p: Project): Project {
  const template = createDelightProject()
  const rawNodes = (p.nodes?.length ? p.nodes : template.nodes) as Array<Partial<LogicNode>>
  const serializableNodes = rawNodes.map((node, index) => sanitizeNode(node as Partial<SerializableLogicNode>, index))
  const isTemplateNodes = !p.nodes?.length
  const edges = isTemplateNodes
    ? template.edges.map((edge) => ({ ...edge }))
    : sanitizeEdges(p.edges as Array<Partial<LogicEdge>> | undefined, serializableNodes)

  return {
    ...p,
    nodes: attachNodeIcons(serializableNodes),
    edges,
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

export function serializeProject(p: Project): Omit<Project, 'nodes'> & { nodes: SerializableLogicNode[] } {
  return { ...p, nodes: toSerializableNodes(p.nodes) }
}

export function buildProjectFromAnalysis(url: string, analysis: AnalysisPayload, model?: string): Project {
  const now = new Date().toISOString()
  let hostname = analysis.name?.trim() || 'New product'
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
  try {
    if (!analysis.name?.trim()) {
      hostname = new URL(normalizedUrl).hostname.replace(/^www\./, '')
    }
  } catch {
    /* keep hostname */
  }

  const rawNodes = Array.isArray(analysis.nodes) && analysis.nodes.length
    ? analysis.nodes.map((node, index) => sanitizeNode(node, index))
    : [
        sanitizeNode(
          {
            id: 'overview',
            step: '01',
            title: '제품 개요',
            plain: '제품의 핵심 흐름을 정리합니다.',
            detail: '분석 결과가 부족해 기본 노드를 생성했습니다.',
            example: '공개 자료를 더 확인한 뒤 노드를 보강하세요.',
          },
          0,
        ),
      ]

  const nodes = attachNodeIcons(rawNodes)
  const edges = sanitizeEdges(analysis.edges, rawNodes)
  const nodeIds = new Set(rawNodes.map((n) => n.id))

  const docs: DocSuggestion[] = (Array.isArray(analysis.docs) ? analysis.docs : []).map((doc, index) => ({
    id: asString(doc?.id, `doc-${index + 1}`),
    title: asString(doc?.title, `문서 후보 ${index + 1}`),
    kind: asString(doc?.kind, 'Concept guide'),
    audience: asAudience(doc?.audience),
    reason: asString(doc?.reason),
    outline: asStringArray(doc?.outline, ['개요', '세부 내용', '확인 질문']),
    evidence: asEvidence(doc?.evidence),
    nodeId: nodeIds.has(asString(doc?.nodeId)) ? asString(doc?.nodeId) : rawNodes[0].id,
    status: 'backlog',
    notes: '',
    assignee: '',
    updatedAt: now,
  }))

  const fallbackDocs: DocSuggestion[] =
    docs.length > 0
      ? docs
      : [
          {
            id: 'starter-doc',
            title: '제품 온보딩 가이드',
            kind: 'How-to guide',
            audience: '모두',
            reason: '분석 결과가 부족해 기본 문서 후보를 생성했습니다.',
            outline: ['제품 한 줄 요약', '핵심 사용자 여정', '확인이 필요한 가정'],
            evidence: 'CONFIRM',
            nodeId: rawNodes[0].id,
            status: 'backlog',
            notes: '',
            assignee: '',
            updatedAt: now,
          },
        ]

  const sources: Source[] = (
    Array.isArray(analysis.sources) && analysis.sources.length
      ? analysis.sources
      : [{ title: hostname, url: normalizedUrl, date: '확인: 2026.07.14', note: '분석 시작 URL' }]
  ).map((source, index) => ({
    title: asString(source?.title, `Source ${index + 1}`),
    url: asString(source?.url, normalizedUrl),
    date: asString(source?.date, '확인: 2026.07.14'),
    note: asString(source?.note),
  }))

  return {
    id: `proj-${Date.now()}`,
    name: hostname,
    url: normalizedUrl,
    description: asString(analysis.description, `${model || 'gpt-5.5'}로 생성한 제품 분석`),
    status: 'ready',
    analyzedAt: now,
    sourceCount: sources.length,
    nodes,
    edges,
    docs: fallbackDocs,
    sources,
    model,
  }
}
