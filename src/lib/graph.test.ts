import { describe, expect, it } from 'vitest'
import { logicEdges } from '../data'
import { computeGraphLayout, computeHighlight, getNodeConnections } from './graph'

describe('computeHighlight', () => {
  it('노드 선택 시 선택 노드·직접 연결 노드·관련 edge ID를 계산한다', () => {
    const highlight = computeHighlight({ kind: 'node', id: 'trust' }, logicEdges)

    expect(highlight.active).toBe(true)
    // trust와 직접 연결된 edge: orchestrate→trust, trust→channel, trust→handoff, handoff→trust
    expect(highlight.edgeIds).toEqual(new Set(['orchestrate-trust', 'trust-channel', 'trust-handoff', 'handoff-trust']))
    expect(highlight.nodeIds.has('trust')).toBe(true)
    expect(highlight.nodeIds.has('orchestrate')).toBe(true)
    expect(highlight.nodeIds.has('channel')).toBe(true)
    expect(highlight.nodeIds.has('handoff')).toBe(true)
    // 연결되지 않은 노드는 포함하지 않는다
    expect(highlight.nodeIds.has('memory')).toBe(false)
  })

  it('edge 선택 시 양 끝 노드와 해당 edge만 강조한다', () => {
    const highlight = computeHighlight({ kind: 'edge', id: 'signal-memory' }, logicEdges)

    expect(highlight.edgeIds).toEqual(new Set(['signal-memory']))
    expect(highlight.nodeIds).toEqual(new Set(['signal', 'memory']))
  })

  it('선택이 없으면 강조가 비활성화된다', () => {
    const highlight = computeHighlight(null, logicEdges)
    expect(highlight.active).toBe(false)
    expect(highlight.nodeIds.size).toBe(0)
  })
})

describe('getNodeConnections', () => {
  it('들어오는 연결과 나가는 연결을 구분한다', () => {
    const { incoming, outgoing } = getNodeConnections('channel', logicEdges)
    expect(incoming.map((e) => e.id).sort()).toEqual(['orchestrate-channel', 'trust-channel'])
    expect(outgoing.map((e) => e.id)).toEqual(['channel-signal'])
  })
})

describe('computeGraphLayout', () => {
  it('모든 노드에 위치를 부여하고 겹치지 않게 배치한다', () => {
    const nodeIds = ['signal', 'memory', 'rules', 'orchestrate', 'channel', 'trust', 'handoff']
    const layout = computeGraphLayout(nodeIds, logicEdges)

    expect(Object.keys(layout)).toHaveLength(7)
    const coords = new Set(Object.values(layout).map((p) => `${Math.round(p.x)},${Math.round(p.y)}`))
    expect(coords.size).toBe(7)
  })

  it('edge가 없어도 모든 노드에 위치를 부여한다', () => {
    const layout = computeGraphLayout(['a', 'b', 'c'], [])
    expect(Object.keys(layout)).toHaveLength(3)
  })
})
