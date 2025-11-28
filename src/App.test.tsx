import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Mock the Canvas component to avoid WebGL/Rapier issues in JSDOM
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas-mock">{children}</div>,
}))

// Mock Scene to avoid physics/three dependencies
vi.mock('./components/Scene', () => ({
  Scene: () => <div data-testid="scene-mock" />,
}))

describe('App Component', () => {
  it('renders the UI overlay correctly', () => {
    render(<App />)
    
    // Check for buttons
    expect(screen.getByText('Dispense')).toBeDefined()
    expect(screen.getByText('Reset')).toBeDefined()
    expect(screen.getByText('Settings')).toBeDefined()
    
    // Check for stats
    expect(screen.getByText(/Items:/)).toBeDefined()
    expect(screen.getByText(/FPS:/)).toBeDefined()
  })

  it('opens settings modal when clicking Settings', async () => {
    render(<App />)
    
    const settingsBtn = screen.getByText('Settings')
    fireEvent.click(settingsBtn)
    
    expect(await screen.findByText(/Low Power Mode/)).toBeDefined()
    expect(screen.getByText('Close')).toBeDefined()
  })
})
