import dagre from '@dagrejs/dagre'
import type { LogicEdge } from '../data'

export const GRAPH_NODE_WIDTH = 248
export const GRAPH_NODE_HEIGHT = 148

export interface NodePosition {
  x: number
  y: number
}

/** dagre로 좌→우 방향 자동 배치를 계산한다. 노드 수 4~15개 이상에도 대응한다. */
export function computeGraphLayout(nodeIds: string[], edges: LogicEdge[]): Record<string, NodePosition> {
  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: 'LR', ranksep: 90, nodesep: 46, edgesep: 30 })
  graph.setDefaultEdgeLabel(() => ({}))

  nodeIds.forEach((id) => {
    graph.setNode(id, { width: GRAPH_NODE_WIDTH, height: GRAPH_NODE_HEIGHT })
  })
  edges.forEach((edge) => {
    if (edge.source !== edge.target) graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  const positions: Record<string, NodePosition> = {}
  nodeIds.forEach((id) => {
    const node = graph.node(id)
    positions[id] = node
      ? { x: node.x - GRAPH_NODE_WIDTH / 2, y: node.y - GRAPH_NODE_HEIGHT / 2 }
      : { x: 0, y: 0 }
  })
  return positions
}

export type GraphSelection = { kind: 'node'; id: string } | { kind: 'edge'; id: string } | null

export interface GraphHighlight {
  /** 강조되는 노드 ID (선택 노드 + 직접 연결 노드, 또는 선택 엣지 양 끝) */
  nodeIds: Set<string>
  /** 강조되는 엣지 ID */
  edgeIds: Set<string>
  /** 어떤 것이라도 선택돼 있어 나머지를 흐리게 처리해야 하는지 */
  active: boolean
}

/** 선택 상태에 따라 강조할 노드·엣지 집합을 계산한다. */
export function computeHighlight(selection: GraphSelection, edges: LogicEdge[]): GraphHighlight {
  if (!selection) {
    return { nodeIds: new Set(), edgeIds: new Set(), active: false }
  }

  const nodeIds = new Set<string>()
  const edgeIds = new Set<string>()

  if (selection.kind === 'node') {
    nodeIds.add(selection.id)
    edges.forEach((edge) => {
      if (edge.source === selection.id || edge.target === selection.id) {
        edgeIds.add(edge.id)
        nodeIds.add(edge.source)
        nodeIds.add(edge.target)
      }
    })
  } else {
    const edge = edges.find((e) => e.id === selection.id)
    if (edge) {
      edgeIds.add(edge.id)
      nodeIds.add(edge.source)
      nodeIds.add(edge.target)
    }
  }

  return { nodeIds, edgeIds, active: true }
}

export interface NodeConnections {
  incoming: LogicEdge[]
  outgoing: LogicEdge[]
}

export function getNodeConnections(nodeId: string, edges: LogicEdge[]): NodeConnections {
  return {
    incoming: edges.filter((edge) => edge.target === nodeId),
    outgoing: edges.filter((edge) => edge.source === nodeId),
  }
}
