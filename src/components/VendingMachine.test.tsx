import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import React from 'react'
import { VendingMachine } from './VendingMachine'
import type { VendingMachineHandle } from './VendingMachine'

// Mock SoundManager
vi.mock('../utils/SoundManager', () => ({
  soundManager: {
    playSpawnSound: vi.fn(),
    playBumpSound: vi.fn(),
  },
}))

// Mock R3F/Drei/Rapier components
vi.mock('@react-three/drei', () => ({
  MeshTransmissionMaterial: () => <meshBasicMaterial />,
  Text: ({ children }: { children: React.ReactNode }) => <group>{children}</group>,
  Edges: () => null,
  Sparkles: () => null,
  CameraShake: () => null,
}))

vi.mock('@react-three/rapier', () => ({
  RigidBody: ({ children }: { children: React.ReactNode }) => <group>{children}</group>,
}))

// Mock FloatingItem to avoid complexity
vi.mock('./FloatingItem', () => ({
  FloatingItem: () => <mesh name="floating-item" />,
}))

describe('VendingMachine Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('exposes spawnItem, reset, and getCount via ref', () => {
    const ref = React.createRef<VendingMachineHandle>()
    render(<VendingMachine ref={ref} />)

    expect(ref.current).toBeDefined()
    expect(ref.current?.spawnItem).toBeInstanceOf(Function)
    expect(ref.current?.reset).toBeInstanceOf(Function)
    expect(ref.current?.getCount).toBeInstanceOf(Function)
    expect(ref.current?.getCount()).toBe(0)
  })

  it('spawns items and updates count', () => {
    const ref = React.createRef<VendingMachineHandle>()
    render(<VendingMachine ref={ref} />)

    act(() => {
      ref.current?.spawnItem()
    })

    expect(ref.current?.getCount()).toBe(1)

    act(() => {
      ref.current?.spawnItem()
      ref.current?.spawnItem()
    })

    expect(ref.current?.getCount()).toBe(3)
  })

  it('resets items to zero', () => {
    const ref = React.createRef<VendingMachineHandle>()
    render(<VendingMachine ref={ref} />)

    act(() => {
      ref.current?.spawnItem()
      ref.current?.spawnItem()
    })
    expect(ref.current?.getCount()).toBe(2)

    act(() => {
      ref.current?.reset()
    })
    expect(ref.current?.getCount()).toBe(0)
  })

  it('caps items at maxItems (default 50)', () => {
    const ref = React.createRef<VendingMachineHandle>()
    render(<VendingMachine ref={ref} />)

    act(() => {
      for (let i = 0; i < 60; i++) {
        ref.current?.spawnItem()
      }
    })

    expect(ref.current?.getCount()).toBe(50)
  })

  it('respects custom maxItems prop', () => {
    const ref = React.createRef<VendingMachineHandle>()
    render(<VendingMachine ref={ref} maxItems={5} />)

    act(() => {
      for (let i = 0; i < 10; i++) {
        ref.current?.spawnItem()
      }
    })

    expect(ref.current?.getCount()).toBe(5)
  })
})
