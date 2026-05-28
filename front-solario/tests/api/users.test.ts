import { describe, it, expect, vi } from 'vitest'
import { loginUser, registerUser, getUserById, equipSkin } from '../../src/api/users'
import api from '../../src/api/client'

vi.mock('../../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}))

const mockUser = {
  id: 'user-1',
  username: 'TestPilot',
  email: 'test@solario.com',
  role: 'User',
  level: 1,
  credits: 500,
  quizzesCompleted: 0,
  wins: 0,
  conqueredPlanets: [],
  inventory: [],
  equippedSkin: 'default'
}

describe('users API', () => {
  it('loginUser sends POST to /api/users/login and returns data', async () => {
    const mockResponse = { token: 'jwt-token', user: mockUser }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse })

    const result = await loginUser({ email: 'test@solario.com', password: 'pass' })

    expect(api.post).toHaveBeenCalledWith('/api/users/login', {
      email: 'test@solario.com',
      password: 'pass'
    })
    expect(result).toEqual(mockResponse)
  })

  it('registerUser sends POST to /api/users/register and returns user', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockUser })

    const payload = { username: 'TestPilot', email: 'test@solario.com', passwordHash: 'secret' }
    const result = await registerUser(payload)

    expect(api.post).toHaveBeenCalledWith('/api/users/register', payload)
    expect(result).toEqual(mockUser)
  })

  it('getUserById sends GET to /api/users/:id and returns user', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser })

    const result = await getUserById('user-1')

    expect(api.get).toHaveBeenCalledWith('/api/users/user-1')
    expect(result).toEqual(mockUser)
  })

  it('equipSkin sends POST to /api/users/equip/:userId/:itemId', async () => {
    const mockRes = { message: 'Skin equipped', equippedSkin: 'skin-1' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockRes })

    const result = await equipSkin('user-1', 'skin-1')

    expect(api.post).toHaveBeenCalledWith('/api/users/equip/user-1/skin-1')
    expect(result).toEqual(mockRes)
  })

  it('loginUser propagates errors from the API', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Unauthorized'))

    await expect(loginUser({ email: 'bad@email.com', password: 'wrong' }))
      .rejects.toThrow('Unauthorized')
  })
})
