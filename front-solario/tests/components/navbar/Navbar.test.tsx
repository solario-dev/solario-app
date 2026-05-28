import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../../../src/components/navbar/Navbar'
import { GameStateContext } from '../../../src/context/GameStateContext'
import { UserContext } from '../../../src/context/UserContext'
import type { GameState } from '../../../src/context/GameStateContext'
import type { User } from '../../../src/api/types/User'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const mockUser: User = {
  id: 'user-1',
  username: 'Pilot',
  email: 'pilot@test.com',
  role: 'User',
  level: 1,
  credits: 500,
  quizzesCompleted: 0,
  wins: 0,
  conqueredPlanets: [],
  inventory: [],
  equippedSkin: 'default'
}

const adminUser: User = { ...mockUser, role: 'Admin' }

function makeGameCtx(state: GameState, quitTrainingFn = vi.fn()) {
  return {
    state,
    setState: vi.fn(),
    startTraining: vi.fn(),
    startGame: vi.fn(),
    pauseGame: vi.fn(),
    endGame: vi.fn(),
    quitTraining: quitTrainingFn
  }
}

function makeUserCtx(user: User | null, logoutFn = vi.fn()) {
  return {
    user,
    token: user ? 'some-token' : null,
    login: vi.fn(),
    logout: logoutFn,
    isAuthenticated: !!user
  }
}

function renderNavbar(state: GameState = 'idle', user: User | null = null, extraOpts?: {
  quitTraining?: ReturnType<typeof vi.fn>
  logout?: ReturnType<typeof vi.fn>
}) {
  const quitTraining = extraOpts?.quitTraining ?? vi.fn()
  const logout = extraOpts?.logout ?? vi.fn()

  return {
    quitTraining,
    logout,
    ...render(
      <MemoryRouter>
        <GameStateContext.Provider value={makeGameCtx(state, quitTraining)}>
          <UserContext.Provider value={makeUserCtx(user, logout)}>
            <Navbar />
          </UserContext.Provider>
        </GameStateContext.Provider>
      </MemoryRouter>
    )
  }
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the SOLARIO brand link', () => {
    renderNavbar()
    expect(screen.getByText('SOLARIO')).toBeInTheDocument()
  })

  it('shows LOGIN link when user is not authenticated (idle state)', () => {
    renderNavbar('idle', null)
    expect(screen.getByRole('link', { name: /LOGIN/i })).toBeInTheDocument()
  })

  it('shows SHOP and PROFILE links when authenticated (idle state)', () => {
    renderNavbar('idle', mockUser)
    expect(screen.getByRole('link', { name: /SHOP/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /PROFILE/i })).toBeInTheDocument()
  })

  it('shows LOGOUT button when authenticated', () => {
    renderNavbar('idle', mockUser)
    expect(screen.getByRole('button', { name: /LOGOUT/i })).toBeInTheDocument()
  })

  it('hides ADMIN PANEL link for regular users', () => {
    renderNavbar('idle', mockUser)
    expect(screen.queryByText(/ADMIN PANEL/i)).not.toBeInTheDocument()
  })

  it('shows ADMIN PANEL link for admin users', () => {
    renderNavbar('idle', adminUser)
    expect(screen.getByRole('link', { name: /ADMIN PANEL/i })).toBeInTheDocument()
  })

  it('shows QUIT button in training state', () => {
    renderNavbar('training', mockUser)
    expect(screen.getByRole('button', { name: /QUIT/i })).toBeInTheDocument()
  })

  it('hides SHOP/PROFILE/LOGOUT in training state', () => {
    renderNavbar('training', mockUser)
    expect(screen.queryByRole('link', { name: /SHOP/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /PROFILE/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /LOGOUT/i })).not.toBeInTheDocument()
  })

  it('hides SHOP/PROFILE/LOGOUT in game state', () => {
    renderNavbar('game', mockUser)
    expect(screen.queryByRole('link', { name: /SHOP/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /QUIT/i })).not.toBeInTheDocument()
  })

  it('QUIT button calls quitTraining and navigates to /dashboard', () => {
    const quitTraining = vi.fn()
    renderNavbar('training', mockUser, { quitTraining })

    fireEvent.click(screen.getByRole('button', { name: /QUIT/i }))

    expect(quitTraining).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('LOGOUT button calls logout and navigates to /login', () => {
    const logout = vi.fn()
    renderNavbar('idle', mockUser, { logout })

    fireEvent.click(screen.getByRole('button', { name: /LOGOUT/i }))

    expect(logout).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows current game state label when not idle', () => {
    renderNavbar('training', mockUser)
    expect(screen.getByText('training')).toBeInTheDocument()
  })

  it('hides state label when state is idle', () => {
    renderNavbar('idle', mockUser)
    const stateLabel = screen.queryByText('idle')
    expect(stateLabel).not.toBeInTheDocument()
  })

  it('shows username in PROFILE link', () => {
    renderNavbar('idle', mockUser)
    expect(screen.getByText(/PROFILE \(Pilot\)/i)).toBeInTheDocument()
  })
})
