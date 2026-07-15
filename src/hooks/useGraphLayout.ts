import { useCallback, useMemo } from 'react'
import type { LogicEdge } from '../data'
import { computeGraphLayout, type NodePosition } from '../lib/graph'

export interface GraphLayoutApi {
  /** dagre 자동 배치 결과 (프로젝트의 노드·엣지 기준) */
  layout: Record<string, NodePosition>
  /** 레이아웃 초기화 시 새 배치를 다시 계산 */
  recompute: () => Record<string, NodePosition>
}

export function useGraphLayout(nodeIds: string[], edges: LogicEdge[]): GraphLayoutApi {
  const layout = useMemo(() => computeGraphLayout(nodeIds, edges), [nodeIds, edges])
  const recompute = useCallback(() => computeGraphLayout(nodeIds, edges), [nodeIds, edges])
  return { layout, recompute }
}
