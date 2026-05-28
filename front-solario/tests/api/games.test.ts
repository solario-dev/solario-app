import { describe, it, expect, vi } from 'vitest'
import { getGames } from '../../src/api/games'
import api from '../../src/api/client'

vi.mock('../../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}))

describe('games API', () => {
  it('getGames sends GET to /simulations/state and returns data', async () => {
    const mockGames = [{ id: 'g1', name: 'Game 1' }]
    vi.mocked(api.get).mockResolvedValueOnce({
      data: mockGames,
      status: 200,
      headers: {}
    })

    const result = await getGames()

    expect(api.get).toHaveBeenCalledWith('/simulations/state')
    expect(result).toEqual(mockGames)
  })

  it('getGames propagates errors from the API', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'))

    await expect(getGames()).rejects.toThrow('Network Error')
  })
})
