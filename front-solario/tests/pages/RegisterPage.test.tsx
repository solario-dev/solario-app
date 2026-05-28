import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '../../src/pages/RegisterPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../src/api/users', () => ({
  registerUser: vi.fn()
}))

import { registerUser } from '../../src/api/users'

function renderRegisterPage() {
  const { container } = render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )
  return container
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the NEW RECRUIT heading', () => {
    renderRegisterPage()
    expect(screen.getByText('NEW RECRUIT')).toBeInTheDocument()
  })

  it('renders username, email and password inputs', () => {
    const container = renderRegisterPage()
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderRegisterPage()
    expect(screen.getByRole('button', { name: /CONFIRM REGISTRATION/i })).toBeInTheDocument()
  })

  it('renders a link back to the login page', () => {
    renderRegisterPage()
    const loginLink = screen.getByRole('link', { name: /LOGIN HERE/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('allows filling in all form fields', () => {
    const container = renderRegisterPage()

    const usernameInput = container.querySelector('input[type="text"]')!
    const emailInput = container.querySelector('input[type="email"]')!
    const passwordInput = container.querySelector('input[type="password"]')!

    fireEvent.change(usernameInput, { target: { value: 'NewPilot' } })
    fireEvent.change(emailInput, { target: { value: 'new@solario.com' } })
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })

    expect(usernameInput).toHaveValue('NewPilot')
    expect(emailInput).toHaveValue('new@solario.com')
    expect(passwordInput).toHaveValue('secret123')
  })

  it('navigates to /login after successful registration', async () => {
    vi.mocked(registerUser).mockResolvedValueOnce({} as any)

    const container = renderRegisterPage()

    fireEvent.change(container.querySelector('input[type="text"]')!, { target: { value: 'NewPilot' } })
    fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'new@solario.com' } })
    fireEvent.change(container.querySelector('input[type="password"]')!, { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /CONFIRM REGISTRATION/i }))

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: 'NewPilot',
        email: 'new@solario.com',
        passwordHash: 'secret123'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error message on registration failure', async () => {
    vi.mocked(registerUser).mockRejectedValueOnce(new Error('Email taken'))

    const container = renderRegisterPage()

    fireEvent.change(container.querySelector('input[type="text"]')!, { target: { value: 'ExistingUser' } })
    fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'taken@solario.com' } })
    fireEvent.change(container.querySelector('input[type="password"]')!, { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /CONFIRM REGISTRATION/i }))

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Email might be taken.')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not show error message initially', () => {
    renderRegisterPage()
    expect(screen.queryByText(/Registration failed/)).not.toBeInTheDocument()
  })
})
