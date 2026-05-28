import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '../../src/pages/Dashboard'

// Mock the heavy 3D SolarSystem – not needed for sidebar tests
vi.mock('../../src/components/solar-system/dashboard-system/SolarSystem', () => ({
  SolarSystem: () => <div data-testid="solar-system-mock" />
}))

// Mock JoinGame to avoid unrelated network/context dependencies
vi.mock('../../src/components/navbar/JoinGame', () => ({
  default: () => <div data-testid="join-game-mock" />
}))

describe('Dashboard – planet sidebar', () => {
  it('renders all 8 planets from planets.json as buttons in the sidebar', () => {
    render(<Dashboard />)

    const expectedPlanets = [
      'Mercury', 'Venus', 'Earth', 'Mars',
      'Jupiter', 'Saturn', 'Uranus', 'Neptune'
    ]

    for (const planet of expectedPlanets) {
      expect(
        screen.getByRole('button', { name: new RegExp(planet, 'i') })
      ).toBeInTheDocument()
    }
  })

  it('renders the mocked SolarSystem and JoinGame placeholders', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('solar-system-mock')).toBeInTheDocument()
    expect(screen.getByTestId('join-game-mock')).toBeInTheDocument()
  })
})
