import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GameStateProvider, GameStateContext } from '../../src/context/GameStateContext'

function StateConsumer() {
  const ctx = (window as any).__gameCtx
  return (
    <div>
      <span data-testid="state">{ctx?.state}</span>
    </div>
  )
}

function TestHarness() {
  return (
    <GameStateProvider>
      <GameStateContext.Consumer>
        {(ctx) => {
          if (!ctx) return null
          return (
            <div>
              <span data-testid="state">{ctx.state}</span>
              <button onClick={ctx.startTraining}>startTraining</button>
              <button onClick={ctx.startGame}>startGame</button>
              <button onClick={ctx.pauseGame}>pauseGame</button>
              <button onClick={ctx.endGame}>endGame</button>
              <button onClick={ctx.quitTraining}>quitTraining</button>
              <button onClick={() => ctx.setState('loading')}>setLoading</button>
            </div>
          )
        }}
      </GameStateContext.Consumer>
    </GameStateProvider>
  )
}

describe('GameStateContext / GameStateProvider', () => {
  it('starts with idle state', () => {
    render(<TestHarness />)
    expect(screen.getByTestId('state').textContent).toBe('idle')
  })

  it('startTraining() sets state to "training"', () => {
    render(<TestHarness />)
    fireEvent.click(screen.getByText('startTraining'))
    expect(screen.getByTestId('state').textContent).toBe('training')
  })

  it('startGame() sets state to "game"', () => {
    render(<TestHarness />)
    fireEvent.click(screen.getByText('startGame'))
    expect(screen.getByTestId('state').textContent).toBe('game')
  })

  it('pauseGame() sets state to "paused"', () => {
    render(<TestHarness />)
    fireEvent.click(screen.getByText('startGame'))
    fireEvent.click(screen.getByText('pauseGame'))
    expect(screen.getByTestId('state').textContent).toBe('paused')
  })

  it('endGame() sets state to "results"', () => {
    render(<TestHarness />)
    fireEvent.click(screen.getByText('startGame'))
    fireEvent.click(screen.getByText('endGame'))
    expect(screen.getByTestId('state').textContent).toBe('results')
  })

  it('quitTraining() sets state back to "idle"', () => {
    render(<TestHarness />)
    fireEvent.click(screen.getByText('startTraining'))
    expect(screen.getByTestId('state').textContent).toBe('training')
    fireEvent.click(screen.getByText('quitTraining'))
    expect(screen.getByTestId('state').textContent).toBe('idle')
  })

  it('setState() can set arbitrary valid state', () => {
    render(<TestHarness />)
    fireEvent.click(screen.getByText('setLoading'))
    expect(screen.getByTestId('state').textContent).toBe('loading')
  })

  it('GameStateContext.Provider can be used directly with a mock value', () => {
    const mockCtx = {
      state: 'game' as const,
      setState: vi.fn(),
      startTraining: vi.fn(),
      startGame: vi.fn(),
      pauseGame: vi.fn(),
      endGame: vi.fn(),
      quitTraining: vi.fn()
    }

    render(
      <GameStateContext.Provider value={mockCtx}>
        <GameStateContext.Consumer>
          {(ctx) => <span data-testid="state">{ctx?.state}</span>}
        </GameStateContext.Consumer>
      </GameStateContext.Provider>
    )

    expect(screen.getByTestId('state').textContent).toBe('game')
  })
})
