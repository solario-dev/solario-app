import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import GameHud from '../../src/components/GameHud'
import { SimulationStateContext } from '../../src/context/SimulationStateContext'
import type { SimulationState } from '../../src/types/simulationTypes'

const mockSimState: SimulationState = {
  type: 'state',
  self: {
    playerId: 'player-1',
    x: 10.5,
    y: -2.3,
    z: 5.0,
    rot: 1.57
  },
  others: [
    {
      playerId: 'player-2',
      x: 3.0,
      y: 1.0,
      z: -4.0,
      rot: 0
    }
  ],
  bodies: []
}

function renderGameHud(state: SimulationState | null) {
  return render(
    <SimulationStateContext.Provider
      value={{ state, setState: vi.fn() }}
    >
      <GameHud />
    </SimulationStateContext.Provider>
  )
}

describe('GameHud', () => {
  it('shows loading message when state is null', () => {
    renderGameHud(null)
    expect(screen.getByText(/Ładowanie/i)).toBeInTheDocument()
  })

  it('shows loading message when state.self is missing', () => {
    renderGameHud({ type: 'state', self: null as any, others: [], bodies: [] })
    expect(screen.getByText(/Ładowanie/i)).toBeInTheDocument()
  })

  it('shows the player ID when state is loaded', () => {
    renderGameHud(mockSimState)
    expect(screen.getByText(/player-1/)).toBeInTheDocument()
  })

  it('shows player coordinates', () => {
    renderGameHud(mockSimState)
    expect(screen.getByText(/10\.5/)).toBeInTheDocument()
  })

  it('shows Players heading', () => {
    renderGameHud(mockSimState)
    expect(screen.getByText('Players:')).toBeInTheDocument()
  })

  it('shows other players in the list', () => {
    renderGameHud(mockSimState)
    expect(screen.getByText(/player-2/)).toBeInTheDocument()
  })

  it('shows empty list when there are no other players', () => {
    const stateNoOthers: SimulationState = { ...mockSimState, others: [] }
    renderGameHud(stateNoOthers)
    const listItems = screen.queryAllByRole('listitem')
    expect(listItems).toHaveLength(0)
  })
})
