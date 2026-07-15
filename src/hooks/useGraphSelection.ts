import { useCallback, useMemo, useState } from 'react'
import type { LogicEdge } from '../data'
import { computeHighlight, type GraphHighlight, type GraphSelection } from '../lib/graph'

export interface GraphSelectionApi {
  selection: GraphSelection
  highlight: GraphHighlight
  selectNode: (id: string) => void
  selectEdge: (id: string) => void
  clear: () => void
}

export function useGraphSelection(edges: LogicEdge[]): GraphSelectionApi {
  const [selection, setSelection] = useState<GraphSelection>(null)

  const highlight = useMemo(() => computeHighlight(selection, edges), [selection, edges])

  const selectNode = useCallback((id: string) => {
    setSelection((prev) => (prev?.kind === 'node' && prev.id === id ? prev : { kind: 'node', id }))
  }, [])

  const selectEdge = useCallback((id: string) => {
    setSelection((prev) => (prev?.kind === 'edge' && prev.id === id ? prev : { kind: 'edge', id }))
  }, [])

  const clear = useCallback(() => setSelection(null), [])

  return { selection, highlight, selectNode, selectEdge, clear }
}
