import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useGameState } from '../../src/hooks/useGameState'
import { GameStateContext } from '../../src/context/GameStateContext'
import type { ReactNode } from 'react'

const mockCtxValue = {
  state: 'idle' as const,
  setState: () => {},
  startTraining: () => {},
  startGame: () => {},
  pauseGame: () => {},
  endGame: () => {},
  quitTraining: () => {}
}

describe('useGameState', () => {
  it('returns the game state context when used inside a provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GameStateContext.Provider value={mockCtxValue}>
        {children}
      </GameStateContext.Provider>
    )

    const { result } = renderHook(() => useGameState(), { wrapper })

    expect(result.current.state).toBe('idle')
    expect(typeof result.current.startTraining).toBe('function')
    expect(typeof result.current.quitTraining).toBe('function')
  })

  it('throws an error when used outside GameStateContext', () => {
    expect(() => renderHook(() => useGameState())).toThrow(
      'useGame must be used within a GameProvider'
    )
  })
})
