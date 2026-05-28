import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useSimulationState } from '../../src/hooks/useSimulationState'

describe('useSimulationState', () => {
  it('throws when used outside SimulationStateProvider', () => {
    // React logs an error for every thrown render – suppress it for cleaner output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useSimulationState())).toThrow(
      'useSimulationState must be used inside SimulationStateProvider'
    )

    consoleError.mockRestore()
  })
})
