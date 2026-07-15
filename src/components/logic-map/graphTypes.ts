import type { Edge, Node } from '@xyflow/react'
import type { LogicEdge, LogicNode, StakeholderRole } from '../../data'

export type ProductNodeData = {
  logic: LogicNode
  docCount: number
  role: StakeholderRole
  dimmed: boolean
  index: number
  reducedMotion: boolean
  onActivate: (id: string) => void
}

export type ProductFlowNode = Node<ProductNodeData, 'product'>

export type RelationshipEdgeData = {
  edge: LogicEdge
  dimmed: boolean
  highlighted: boolean
  isSelected: boolean
  index: number
  reducedMotion: boolean
  onActivate: (id: string) => void
}

export type RelationshipFlowEdge = Edge<RelationshipEdgeData, 'relationship'>

export const RELATIONSHIP_COLORS: Record<LogicEdge['type'], string> = {
  data: '#3182F6',
  event: '#0EA5E9',
  decision: '#F59E0B',
  control: '#64748B',
  handoff: '#EF4444',
  feedback: '#10B981',
}
