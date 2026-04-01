import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import JoinGame from '../../../src/components/navbar/JoinGame'
import { GameStateContext } from '../../../src/context/GameStateContext'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('JoinGame', () => {
  it('calls startTraining and navigates to /training', () => {
    const startTrainingMock = vi.fn()

    render(
      <MemoryRouter>
        <GameStateContext.Provider value={{
          state: 'idle',
          setState: vi.fn(),
          startTraining: startTrainingMock,
          startGame: vi.fn(),
          pauseGame: vi.fn(),
          endGame: vi.fn(),
          quitTraining: vi.fn()
        }}>
          <JoinGame />
        </GameStateContext.Provider>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Start Training'))

    expect(startTrainingMock).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/training')
  })

  it('calls startGame and navigates to /training on form submit', () => {
    const startGameMock = vi.fn()

    render(
      <MemoryRouter>
        <GameStateContext.Provider value={{
          state: 'idle',
          setState: vi.fn(),
          startTraining: vi.fn(),
          startGame: startGameMock,
          pauseGame: vi.fn(),
          endGame: vi.fn(),
          quitTraining: vi.fn()
        }}>
          <JoinGame />
        </GameStateContext.Provider>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Join Game'))

    expect(startGameMock).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/training')
  })
})