import '@testing-library/jest-dom/vitest'

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: () => undefined,
  writable: true,
})

// --- React Flow(@xyflow/react)가 jsdom에서 동작하기 위한 mock ---

class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
  }
  unobserve() {}
  disconnect() {}
}

class DOMMatrixReadOnlyMock {
  m22: number
  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([1-9.]+)\)/)?.[1]
    this.m22 = scale !== undefined ? +scale : 1
  }
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
;(globalThis as Record<string, unknown>).DOMMatrixReadOnly = DOMMatrixReadOnlyMock

Object.defineProperties(window.HTMLElement.prototype, {
  offsetHeight: {
    get() {
      return parseFloat((this as HTMLElement).style.height) || 1
    },
  },
  offsetWidth: {
    get() {
      return parseFloat((this as HTMLElement).style.width) || 1
    },
  },
})
;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
  ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect

// framer-motion useReducedMotion 등에서 사용하는 matchMedia mock
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList
}
