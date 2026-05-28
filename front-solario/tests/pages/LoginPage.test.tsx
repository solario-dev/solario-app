import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../../src/pages/LoginPage'
import { UserContext } from '../../src/context/UserContext'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../src/api/users', () => ({
  loginUser: vi.fn()
}))

import { loginUser } from '../../src/api/users'

const mockUserCtx = {
  user: null,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false
}

function renderLoginPage() {
  const { container } = render(
    <MemoryRouter>
      <UserContext.Provider value={mockUserCtx}>
        <LoginPage />
      </UserContext.Provider>
    </MemoryRouter>
  )
  return container
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the ACCESS TERMINAL heading', () => {
    renderLoginPage()
    expect(screen.getByText('ACCESS TERMINAL')).toBeInTheDocument()
  })

  it('renders email input field', () => {
    const container = renderLoginPage()
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
  })

  it('renders password input field', () => {
    const container = renderLoginPage()
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /INITIALIZE LINK/i })).toBeInTheDocument()
  })

  it('renders a link to the register page', () => {
    renderLoginPage()
    const registerLink = screen.getByRole('link', { name: /REGISTER NEW ACCOUNT/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('allows typing email and password', () => {
    const container = renderLoginPage()

    const emailInput = container.querySelector('input[type="email"]')!
    const passwordInput = container.querySelector('input[type="password"]')!

    fireEvent.change(emailInput, { target: { value: 'pilot@solario.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('pilot@solario.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('navigates to /dashboard on successful login', async () => {
    const mockUser = {
      id: '1', username: 'Pilot', role: 'User', credits: 100, level: 1, wins: 0,
      quizzesCompleted: 0, conqueredPlanets: [], inventory: [], equippedSkin: 'default',
      email: 'pilot@solario.com'
    }
    vi.mocked(loginUser).mockResolvedValueOnce({ user: mockUser, token: 'test-token' })

    const container = renderLoginPage()

    fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'pilot@solario.com' } })
    fireEvent.change(container.querySelector('input[type="password"]')!, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /INITIALIZE LINK/i }))

    await waitFor(() => {
      expect(mockUserCtx.login).toHaveBeenCalledWith(mockUser, 'test-token')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message on failed login', async () => {
    vi.mocked(loginUser).mockRejectedValueOnce(new Error('Unauthorized'))

    const container = renderLoginPage()

    fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'bad@email.com' } })
    fireEvent.change(container.querySelector('input[type="password"]')!, { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /INITIALIZE LINK/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not show error message initially', () => {
    renderLoginPage()
    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument()
  })
})
