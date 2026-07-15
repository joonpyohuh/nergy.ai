import { useCallback, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useReducedMotion } from 'framer-motion'
import type { LogicEdge, LogicNode, StakeholderRole } from '../../data'
import { computeGraphLayout, type GraphHighlight, type GraphSelection, type NodePosition } from '../../lib/graph'
import { GraphToolbar } from './GraphToolbar'
import { ProductLogicNode } from './ProductLogicNode'
import { RelationshipEdge } from './RelationshipEdge'
import { RELATIONSHIP_COLORS, type ProductFlowNode, type RelationshipFlowEdge } from './graphTypes'

const nodeTypes = { product: ProductLogicNode }
const edgeTypes = { relationship: RelationshipEdge }

interface LogicMapCanvasProps {
  logicNodes: LogicNode[]
  logicEdges: LogicEdge[]
  docCounts: Record<string, number>
  role: StakeholderRole
  selection: GraphSelection
  highlight: GraphHighlight
  showEdges: boolean
  onToggleEdges: () => void
  onSelectNode: (id: string) => void
  onSelectEdge: (id: string) => void
  onClearSelection: () => void
}

export function LogicMapCanvas({
  logicNodes,
  logicEdges,
  docCounts,
  role,
  selection,
  highlight,
  showEdges,
  onToggleEdges,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
}: LogicMapCanvasProps) {
  const reducedMotion = useReducedMotion() ?? false
  const { fitView } = useReactFlow()

  const nodeIds = useMemo(() => logicNodes.map((n) => n.id), [logicNodes])
  const [positions, setPositions] = useState<Record<string, NodePosition>>(() => computeGraphLayout(nodeIds, logicEdges))

  const nodes = useMemo<ProductFlowNode[]>(
    () =>
      logicNodes.map((logic, index) => ({
        id: logic.id,
        type: 'product' as const,
        position: positions[logic.id] ?? { x: index * 280, y: 0 },
        data: {
          logic,
          docCount: docCounts[logic.id] ?? 0,
          role,
          dimmed: highlight.active && !highlight.nodeIds.has(logic.id),
          index,
          reducedMotion,
          onActivate: onSelectNode,
        },
        selected: selection?.kind === 'node' && selection.id === logic.id,
      })),
    [logicNodes, positions, docCounts, role, highlight, selection, reducedMotion, onSelectNode],
  )

  const edges = useMemo<RelationshipFlowEdge[]>(
    () =>
      logicEdges.map((edge, index) => {
        const isSelected = selection?.kind === 'edge' && selection.id === edge.id
        const highlighted = highlight.edgeIds.has(edge.id)
        const active = highlighted || isSelected
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'relationship' as const,
          hidden: !showEdges,
          interactionWidth: 28,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: active ? RELATIONSHIP_COLORS[edge.type] : '#C3CBD4',
          },
          data: {
            edge,
            dimmed: highlight.active && !active,
            highlighted,
            isSelected,
            index,
            reducedMotion,
            onActivate: onSelectEdge,
          },
        }
      }),
    [logicEdges, selection, highlight, showEdges, reducedMotion, onSelectEdge],
  )

  const onNodesChange = useCallback((changes: NodeChange<ProductFlowNode>[]) => {
    // 드래그로 인한 위치 변경만 세션 상태로 유지한다 (선택 상태는 자체 관리).
    setPositions((prev) => {
      let next: Record<string, NodePosition> | null = null
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          next = next ?? { ...prev }
          next[change.id] = change.position
        }
      })
      return next ?? prev
    })
  }, [])

  const resetLayout = useCallback(() => {
    setPositions(computeGraphLayout(nodeIds, logicEdges))
    window.setTimeout(() => void fitView({ padding: 0.2, duration: reducedMotion ? 0 : 450 }), 40)
  }, [nodeIds, logicEdges, fitView, reducedMotion])

  const focusNeighborhood = useCallback(
    (nodeId: string) => {
      const neighborIds = new Set<string>([nodeId])
      logicEdges.forEach((e) => {
        if (e.source === nodeId) neighborIds.add(e.target)
        if (e.target === nodeId) neighborIds.add(e.source)
      })
      void fitView({
        nodes: [...neighborIds].map((id) => ({ id })),
        padding: 0.35,
        duration: reducedMotion ? 0 : 500,
      })
    },
    [logicEdges, fitView, reducedMotion],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={(_, node) => onSelectNode(node.id)}
      onNodeDoubleClick={(_, node) => {
        onSelectNode(node.id)
        focusNeighborhood(node.id)
      }}
      onEdgeClick={(_, edge) => onSelectEdge(edge.id)}
      onPaneClick={onClearSelection}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.25}
      maxZoom={1.8}
      nodesConnectable={false}
      nodesFocusable
      edgesFocusable
      deleteKeyCode={null}
      className="!bg-transparent"
      aria-label="제품 로직 그래프"
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.1} color="#DFE4EA" />
      <MiniMap
        pannable
        zoomable
        className="!hidden lg:!block !rounded-xl !border !border-toss-line !bg-white/90"
        nodeColor={(node) => (node as ProductFlowNode).data?.logic.color ?? '#C3CBD4'}
        nodeStrokeWidth={2}
      />
      <Panel position="top-left">
        <GraphToolbar showEdges={showEdges} onToggleEdges={onToggleEdges} onResetLayout={resetLayout} />
      </Panel>
    </ReactFlow>
  )
}
