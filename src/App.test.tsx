import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('nergy.ai workspace', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('runs the product analysis and reveals the interactive workspace', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /제품 분석하기/i }))
    expect(screen.getByText('제품의 연결 관계를 찾고 있어요')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.getByText('Delight.ai 분석')).toBeInTheDocument()
    expect(screen.getByText('제품 로직 맵')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('분석 완료했어요!')
  })

  it('adds a suggested document and generates its outline', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /제품 분석하기/i }))
    await act(async () => {
      vi.advanceTimersByTime(2500)
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Writing plan에 추가' })[0])
    fireEvent.click(screen.getByRole('button', { name: /Writing plan 1/i }))
    expect(screen.getAllByText('채널별 이벤트 계약서')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /문서 초안 구조 만들기/i }))
    await act(async () => {
      vi.advanceTimersByTime(700)
    })
    expect(screen.getByText('지원 채널과 이벤트')).toBeInTheDocument()
  })
})
