import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserProvider, UserContext, useUser } from '../../src/context/UserContext'
import type { User } from '../../src/api/types/User'

vi.mock('../../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    defaults: {
      headers: {
        common: {} as Record<string, string>
      }
    }
  }
}))

const mockUser: User = {
  id: 'user-1',
  username: 'TestPilot',
  email: 'test@solario.com',
  role: 'User',
  level: 5,
  credits: 1500,
  quizzesCompleted: 10,
  wins: 3,
  conqueredPlanets: ['Mars'],
  inventory: ['item-1'],
  equippedSkin: 'default'
}

function TestConsumer() {
  const ctx = useUser()
  return (
    <div>
      <span data-testid="username">{ctx.user?.username ?? 'no-user'}</span>
      <span data-testid="auth">{String(ctx.isAuthenticated)}</span>
      <span data-testid="token">{ctx.token ?? 'no-token'}</span>
      <button onClick={() => ctx.login(mockUser, 'tok-abc')}>login</button>
      <button onClick={() => ctx.logout()}>logout</button>
    </div>
  )
}

describe('UserContext / UserProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated with no user', () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    )

    expect(screen.getByTestId('auth').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('no-user')
    expect(screen.getByTestId('token').textContent).toBe('no-token')
  })

  it('login() sets user and isAuthenticated to true', async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    )

    await act(async () => {
      screen.getByText('login').click()
    })

    expect(screen.getByTestId('username').textContent).toBe('TestPilot')
    expect(screen.getByTestId('auth').textContent).toBe('true')
    expect(screen.getByTestId('token').textContent).toBe('tok-abc')
  })

  it('login() persists user and token to localStorage', async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    )

    await act(async () => {
      screen.getByText('login').click()
    })

    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    expect(localStorage.getItem('token')).toBe('tok-abc')
  })

  it('logout() clears user and isAuthenticated', async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    )

    await act(async () => {
      screen.getByText('login').click()
    })
    await act(async () => {
      screen.getByText('logout').click()
    })

    expect(screen.getByTestId('auth').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('no-user')
    expect(screen.getByTestId('token').textContent).toBe('no-token')
  })

  it('logout() clears localStorage', async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    )

    await act(async () => {
      screen.getByText('login').click()
    })
    await act(async () => {
      screen.getByText('logout').click()
    })

    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('restores user from localStorage on mount when token exists', async () => {
    localStorage.setItem('token', 'existing-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    )

    await act(async () => {})

    expect(screen.getByTestId('username').textContent).toBe('TestPilot')
  })

  it('useUser() throws an error when used outside UserProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestConsumer />)).toThrow(
      'useUser must be used within a UserProvider'
    )

    consoleError.mockRestore()
  })

  it('UserContext.Provider can be used directly with a custom value', () => {
    render(
      <UserContext.Provider
        value={{
          user: mockUser,
          token: 'direct-token',
          login: vi.fn(),
          logout: vi.fn(),
          isAuthenticated: true
        }}
      >
        <TestConsumer />
      </UserContext.Provider>
    )

    expect(screen.getByTestId('username').textContent).toBe('TestPilot')
    expect(screen.getByTestId('auth').textContent).toBe('true')
  })
})
