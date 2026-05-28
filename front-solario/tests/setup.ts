import '@testing-library/jest-dom'

// ResizeObserver is used by recharts but not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}