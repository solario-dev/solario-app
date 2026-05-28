import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../src/App'

vi.mock('../src/api/games', () => ({
  getGames: vi.fn().mockResolvedValue([])
}))

vi.mock('../src/pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-stub" />
}))

vi.mock('../src/pages/Training', () => ({
  default: () => <div data-testid="training-stub" />
}))

describe('App', () => {
  it('mounts without crashing and renders the navigation bar', () => {
    render(<App />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders the landing page at the root route by default', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /LandingPage/i })).toBeInTheDocument()
  })

  it('renders the SOLARIO brand link inside the navigation', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /SOLARIO/i })).toBeInTheDocument()
  })
})
