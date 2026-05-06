import '@testing-library/jest-dom'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
