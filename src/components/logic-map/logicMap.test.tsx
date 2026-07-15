import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDelightProject, logicEdges, logicNodes } from '../../data'
import { useGraphSelection } from '../../hooks/useGraphSelection'
import { EdgeDetailPanel } from './EdgeDetailPanel'
import { NodeDetailPanel } from './NodeDetailPanel'
import { RolePerspectiveTabs } from './RolePerspectiveTabs'
import { WritingRoadmap } from './WritingRoadmap'

afterEach(() => {
  cleanup()
})

describe('useGraphSelection', () => {
  it('edge를 선택하면 선택 상태가 edge 모드가 되고 양 끝 노드가 강조된다', () => {
    const { result } = renderHook(() => useGraphSelection(logicEdges))

    act(() => result.current.selectEdge('signal-memory'))
    expect(result.current.selection).toEqual({ kind: 'edge', id: 'signal-memory' })
    expect(result.current.highlight.nodeIds).toEqual(new Set(['signal', 'memory']))

    act(() => result.current.clear())
    expect(result.current.selection).toBeNull()
  })
})

describe('EdgeDetailPanel', () => {
  it('연결 이유·트리거·전달 정보·성공 조건·리스크를 표시한다', () => {
    const project = createDelightProject()
    const edge = logicEdges.find((e) => e.id === 'signal-memory')!

    render(
      <EdgeDetailPanel edge={edge} nodes={project.nodes} docs={project.docs} onSelectNode={vi.fn()} onOpenDoc={vi.fn()} />,
    )

    expect(screen.getByText('고객 메시지 전달')).toBeInTheDocument()
    expect(screen.getByText('왜 연결되나요?')).toBeInTheDocument()
    expect(screen.getByText(/이전 기록을 조회합니다/)).toBeInTheDocument()
    expect(screen.getByText('고객 ID')).toBeInTheDocument()
    expect(screen.getByText(/고객 식별이 완료되고/)).toBeInTheDocument()
    expect(screen.getByText(/신규 고객으로 오인/)).toBeInTheDocument()
    expect(screen.getByLabelText(/출발 노드 보기/)).toHaveTextContent('고객 신호 받기')
    expect(screen.getByLabelText(/도착 노드 보기/)).toHaveTextContent('기억과 맥락 불러오기')
  })

  it('관련 문서 열기 버튼이 에디터 이동 콜백을 호출한다', () => {
    const project = createDelightProject()
    const edge = logicEdges.find((e) => e.id === 'signal-memory')!
    const onOpenDoc = vi.fn()

    render(<EdgeDetailPanel edge={edge} nodes={project.nodes} docs={project.docs} onSelectNode={vi.fn()} onOpenDoc={onOpenDoc} />)

    fireEvent.click(screen.getAllByRole('button', { name: '문서 열기' })[0])
    expect(onOpenDoc).toHaveBeenCalledWith('event-contract')
  })
})

describe('RolePerspectiveTabs', () => {
  it('역할 탭을 바꾸면 역할별 설명이 표시된다', () => {
    const node = logicNodes.find((n) => n.id === 'signal')!
    render(<RolePerspectiveTabs explanations={node.roleExplanations} />)

    // 기본은 마케터
    expect(screen.getByText(/한 지점으로 모이는 입구/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '개발자' }))
    expect(screen.getByText(/하나의 신호 스키마로 정규화/)).toBeInTheDocument()
    expect(screen.getByText(/이벤트 스키마와 필수 필드/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '운영팀' }))
    expect(screen.getByText(/유실 없이 접수되는 첫 관문/)).toBeInTheDocument()
  })
})

describe('NodeDetailPanel', () => {
  it('입력·출력과 연결 관계를 표시하고 연결 클릭 시 edge 선택 콜백을 호출한다', () => {
    const project = createDelightProject()
    const node = project.nodes.find((n) => n.id === 'memory')!
    const onSelectEdge = vi.fn()
    const nodeTitleById = Object.fromEntries(project.nodes.map((n) => [n.id, n.title]))

    render(
      <NodeDetailPanel
        node={node}
        edges={project.edges}
        docs={project.docs}
        role="overview"
        nodeTitleById={nodeTitleById}
        onSelectEdge={onSelectEdge}
        onOpenDoc={vi.fn()}
        onOpenDocsTab={vi.fn()}
      />,
    )

    expect(screen.getByText('입력과 출력')).toBeInTheDocument()
    expect(screen.getByText(/CRM 구조화 데이터/)).toBeInTheDocument()
    expect(screen.getByText('들어오는 연결')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('연결 상세 보기: 고객 메시지 전달'))
    expect(onSelectEdge).toHaveBeenCalledWith('signal-memory')
  })
})

describe('WritingRoadmap', () => {
  it('문서 상태에 맞는 단계에 문서가 배치된다', () => {
    const project = createDelightProject()
    render(<WritingRoadmap project={project} onOpenDoc={vi.fn()} />)

    // drafting 문서 → Draft 단계
    const draftStage = screen.getByLabelText(/Draft 단계/)
    expect(draftStage).toHaveTextContent('Actionbook 작성 가이드')
    // review 문서 → Review 단계
    const reviewStage = screen.getByLabelText(/Review 단계/)
    expect(reviewStage).toHaveTextContent('AI 평가·릴리스 플레이북')
    // backlog + CONFIRM → Confirm 단계
    const confirmStage = screen.getByLabelText(/Confirm 단계/)
    expect(confirmStage).toHaveTextContent('고객 메모리 데이터 모델')
  })

  it('문서 카드를 클릭하면 에디터 이동 콜백이 호출된다', () => {
    const project = createDelightProject()
    const onOpenDoc = vi.fn()
    render(<WritingRoadmap project={project} onOpenDoc={onOpenDoc} />)

    fireEvent.click(screen.getByLabelText('Actionbook 작성 가이드 에디터에서 열기'))
    expect(onOpenDoc).toHaveBeenCalledWith('actionbook-authoring')
  })

  it('진행률과 CONFIRM 개수를 표시한다', () => {
    const project = createDelightProject()
    render(<WritingRoadmap project={project} onOpenDoc={vi.fn()} />)

    expect(screen.getByText('전체 진행률')).toBeInTheDocument()
    // seedDocs: CONFIRM + backlog 문서 3개 (memory-model, tool-contract, channel-behavior)
    expect(screen.getByText('3건')).toBeInTheDocument()
  })
})
