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
