import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock ResizeObserver
// @ts-expect-error - global is not typed in dom env
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock WebGL Context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = (vi.fn(() => {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => ({
      data: new Array(w * h * 4),
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any

// Mock AudioContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.AudioContext = (class AudioContext {
  state = 'suspended'
  resume = vi.fn()
  createOscillator = () => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
    },
    type: 'sine'
  })
  createGain = () => ({
    connect: vi.fn(),
    gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
    }
  })
  destination = {}
  currentTime = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// @ts-expect-error - webkitAudioContext is non-standard
window.webkitAudioContext = window.AudioContext
