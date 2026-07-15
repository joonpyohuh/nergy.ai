import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createDelightProject, toSerializableNodes } from './data'

function delightPayload() {
  const project = createDelightProject()
  return {
    ...project,
    nodes: toSerializableNodes(project.nodes),
  }
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }
}

function stubAuthenticatedWorkspace(extraHandlers?: (url: string, init?: RequestInit) => unknown | null) {
  const delight = delightPayload()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const custom = extraHandlers?.(url, init)
      if (custom) return custom

      if (url.includes('/api/auth/me')) return jsonResponse({ authenticated: true })
      if (url.includes('/api/auth/logout')) return jsonResponse({ ok: true })
      if (url.includes('/api/workspace')) return jsonResponse({ ok: true })
      if (url.match(/\/api\/projects\/[^/]+$/) && init?.method === 'PUT') return jsonResponse({ project: delight })
      if (url.match(/\/api\/projects\/[^/]+$/) && init?.method === 'DELETE') return jsonResponse({ ok: true })
      if (url.includes('/api/projects') && init?.method === 'POST') return jsonResponse({ project: delight })
      if (url.includes('/api/projects')) {
        return jsonResponse({ projects: [delight], activeProjectId: delight.id })
      }
      return jsonResponse({ error: `unhandled ${url}` }, 500)
    }),
  )
}

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

  it('shows the shared-password login gate when unauthenticated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ authenticated: false }, 401)),
    )

    render(<App />)

    expect(await screen.findByText('팀 공용 워크스페이스')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('팀 공용 비밀번호')).toBeInTheDocument()
  })

  it('opens the seeded project workspace with map and docs after auth', async () => {
    stubAuthenticatedWorkspace()
    render(<App />)

    expect(await screen.findByText('제품 로직 맵')).toBeInTheDocument()
    expect(screen.getAllByText('Delight.ai').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /^문서 큐$/i }))
    expect(screen.getByText('채널별 이벤트 계약서')).toBeInTheDocument()
  })

  it('shows Product Flow / Writing Roadmap mode switch on the map tab', async () => {
    stubAuthenticatedWorkspace()
    render(<App />)

    expect(await screen.findByRole('tab', { name: /Product Flow/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /Writing Roadmap/i }))
    await act(async () => {
      vi.advanceTimersByTime(2000)
      await Promise.resolve()
    })
    expect(screen.getByText('전체 진행률')).toBeInTheDocument()
    expect(screen.getByLabelText(/Draft 단계/)).toHaveTextContent('Actionbook 작성 가이드')
  })

  it('opens a document in the editor and updates status', async () => {
    stubAuthenticatedWorkspace()
    render(<App />)

    expect(await screen.findByText('제품 로직 맵')).toBeInTheDocument()
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

    stubAuthenticatedWorkspace((url, init) => {
      if (url.includes('/api/analyze')) {
        return jsonResponse(analyzePayload)
      }
      if (url.includes('/api/projects') && init?.method === 'POST') {
        return jsonResponse({
          project: {
            id: 'proj-acme',
            name: 'acme.dev',
            url: 'https://acme.dev',
            description: '테스트 제품',
            status: 'ready',
            analyzedAt: new Date().toISOString(),
            sourceCount: 1,
            nodes: analyzePayload.analysis.nodes,
            edges: [],
            docs: analyzePayload.analysis.docs,
            sources: analyzePayload.analysis.sources,
          },
        })
      }
      return null
    })

    render(<App />)
    expect(await screen.findByText('제품 로직 맵')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /새 제품 분석/i })[0])
    expect(screen.getByText('제품 URL로 분석 시작')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('https://product.example.com')
    fireEvent.change(input, { target: { value: 'https://acme.dev' } })
    fireEvent.click(screen.getByRole('button', { name: /gpt-5.5로 분석 실행/i }))

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByRole('status')).toHaveTextContent('gpt-5.5')
    expect(within(screen.getByRole('navigation')).getByText('acme.dev')).toBeInTheDocument()
  })
})
