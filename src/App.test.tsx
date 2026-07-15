import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('nergy.ai workspace app', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('opens the seeded project workspace with map and docs', () => {
    render(<App />)

    expect(screen.getAllByText('Delight.ai').length).toBeGreaterThan(0)
    expect(screen.getByText('제품 로직 맵')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^문서 큐$/i }))
    expect(screen.getByText('채널별 이벤트 계약서')).toBeInTheDocument()
  })

  it('shows Product Flow / Writing Roadmap mode switch on the map tab', async () => {
    render(<App />)

    expect(screen.getByRole('tab', { name: /Product Flow/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /Writing Roadmap/i }))
    // AnimatePresence 전환(exit 애니메이션)이 끝날 때까지 타이머를 진행
    await act(async () => {
      vi.advanceTimersByTime(2000)
      await Promise.resolve()
    })
    expect(screen.getByText('전체 진행률')).toBeInTheDocument()
    expect(screen.getByLabelText(/Draft 단계/)).toHaveTextContent('Actionbook 작성 가이드')
  })

  it('restores a legacy localStorage project (without edges) without crashing', () => {
    localStorage.setItem(
      'nergy.ai.workspace.v1',
      JSON.stringify({
        projects: [
          {
            id: 'proj-old',
            name: 'OldSaved.app',
            url: 'https://old.example.com',
            description: '구버전 저장 프로젝트',
            status: 'ready',
            analyzedAt: '2026-07-01T00:00:00.000Z',
            sourceCount: 1,
            nodes: [
              { id: 'x', step: '01', title: '수집', plain: '데이터 수집', detail: '', example: '', color: '#3182F6' },
              { id: 'y', step: '02', title: '가공', plain: '데이터 가공', detail: '', example: '', color: '#8B5CF6' },
            ],
            docs: [
              {
                id: 'old-doc',
                title: '남아있는 문서',
                kind: 'Concept guide',
                audience: '모두',
                reason: '',
                outline: [],
                evidence: 'DOCS',
                nodeId: 'x',
                status: 'review',
                notes: '',
                assignee: '',
                updatedAt: '2026-07-01T00:00:00.000Z',
              },
            ],
            sources: [{ title: 'Home', url: 'https://old.example.com', date: '확인: 2026.07.01', note: '' }],
          },
        ],
        activeProjectId: 'proj-old',
      }),
    )

    render(<App />)

    expect(screen.getAllByText('OldSaved.app').length).toBeGreaterThan(0)
    expect(screen.getByText('제품 로직 맵')).toBeInTheDocument()
    // 마이그레이션으로 생성된 기본 edge의 label이 그래프에 나타난다
    expect(screen.getByText('수집 → 가공')).toBeInTheDocument()
  })

  it('opens a document in the editor and updates status', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /^문서 큐$/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /에디터에서 열기/i })[0])

    expect(screen.getByLabelText('문서 제목')).toBeInTheDocument()
    expect(screen.getByText('Outline')).toBeInTheDocument()

    const statusSelect = screen.getAllByLabelText(/상태/)[0] as HTMLSelectElement
    fireEvent.change(statusSelect, { target: { value: 'review' } })
    expect(screen.getByRole('status')).toHaveTextContent('리뷰')
  })

  it('runs a new product analysis with gpt-5.5 and adds a project', async () => {
    const analyzePayload = {
      model: 'gpt-5.5',
      analysis: {
        name: 'acme.dev',
        description: '테스트 제품',
        nodes: [
          {
            id: 'intake',
            step: '01',
            title: '입력',
            plain: '입력을 받습니다.',
            detail: '상세',
            example: '예시',
            color: '#3182F6',
          },
        ],
        docs: [
          {
            id: 'guide',
            title: '시작 가이드',
            kind: 'How-to guide',
            audience: '모두',
            reason: '온보딩용',
            outline: ['소개', '다음 단계'],
            evidence: 'CONFIRM',
            nodeId: 'intake',
          },
        ],
        sources: [{ title: 'Home', url: 'https://acme.dev', date: '확인: 2026.07.14', note: '홈페이지' }],
      },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(analyzePayload),
      }),
    )

    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /새 제품 분석/i })[0])
    expect(screen.getByText('제품 URL로 분석 시작')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('https://product.example.com')
    fireEvent.change(input, { target: { value: 'https://acme.dev' } })
    fireEvent.click(screen.getByRole('button', { name: /gpt-5.5로 분석 실행/i }))

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByRole('status')).toHaveTextContent('gpt-5.5')
    expect(within(screen.getByRole('navigation')).getByText('acme.dev')).toBeInTheDocument()
  })
})
