import '@testing-library/jest-dom'
import { vi } from 'vitest'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

Object.defineProperty(window, 'Notification', {
  value: { permission: 'default', requestPermission: vi.fn() },
  writable: true,
})
