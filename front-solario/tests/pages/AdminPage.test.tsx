import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from '../../src/pages/AdminPage'
import { UserContext } from '../../src/context/UserContext'
import type { User } from '../../src/api/types/User'

vi.mock('../../src/api/quiz', () => ({
  getQuestionsByPlanet: vi.fn(),
  createQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn()
}))

import { getQuestionsByPlanet, createQuestion, deleteQuestion, updateQuestion } from '../../src/api/quiz'

const adminUser: User = {
  id: 'admin-1',
  username: 'AdminUser',
  email: 'admin@solario.com',
  role: 'Admin',
  level: 10,
  credits: 9999,
  quizzesCompleted: 0,
  wins: 0,
  conqueredPlanets: [],
  inventory: [],
  equippedSkin: 'default'
}

const regularUser: User = { ...adminUser, role: 'User' }

const mockQuestion = {
  id: 'q1',
  text: 'What is the mass of Mars?',
  correctAnswerId: 'a1',
  answers: [
    { id: 'a1', text: '0.64 × 10^24 kg' },
    { id: 'a2', text: '1.0 × 10^24 kg' }
  ]
}

function renderAdmin(user: User = adminUser) {
  const { container } = render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          user,
          token: 'admin-token',
          login: vi.fn(),
          logout: vi.fn(),
          isAuthenticated: true
        }}
      >
        <AdminPage />
      </UserContext.Provider>
    </MemoryRouter>
  )
  return container
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([mockQuestion])
  })

  it('redirects non-admin users (no admin UI visible)', () => {
    renderAdmin(regularUser)
    expect(screen.queryByText(/ADD NEW QUESTION/i)).not.toBeInTheDocument()
  })

  it('shows ADD NEW QUESTION form for admin users', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText(/ADD NEW QUESTION/i)).toBeInTheDocument()
    })
  })

  it('shows planet selector dropdown', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('shows existing questions after loading', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('What is the mass of Mars?')).toBeInTheDocument()
    })
  })

  it('shows answers for each question', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('0.64 × 10^24 kg')).toBeInTheDocument()
      expect(screen.getByText('1.0 × 10^24 kg')).toBeInTheDocument()
    })
  })

  it('shows EDIT and DEL buttons for each question', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /EDIT/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /DEL/i })).toBeInTheDocument()
    })
  })

  it('shows "No data found" when there are no questions', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText(/No data found/i)).toBeInTheDocument()
    })
  })

  it('creates a new question on form submission', async () => {
    vi.mocked(createQuestion).mockResolvedValue({ id: 'new-q' })
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    const container = renderAdmin()

    await waitFor(() => screen.getByText(/ADD NEW QUESTION/i))

    // Use container.querySelector to find the textarea directly (no htmlFor on labels)
    const textarea = container.querySelector('textarea')!
    fireEvent.change(textarea, { target: { value: 'New question text?' } })

    const answerInputs = container.querySelectorAll('input[type="text"]')
    answerInputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: `Answer ${i + 1}` } })
    })

    fireEvent.click(screen.getByRole('button', { name: /^ADD$/i }))

    await waitFor(() => {
      expect(createQuestion).toHaveBeenCalled()
    })
  })

  it('enters edit mode when clicking EDIT on a question', async () => {
    renderAdmin()
    await waitFor(() => screen.getByRole('button', { name: /EDIT/i }))

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }))

    expect(screen.getByText(/EDIT QUESTION/i)).toBeInTheDocument()
    expect(screen.getByText(/Editing mode active/i)).toBeInTheDocument()
  })

  it('cancels edit mode when clicking CANCEL', async () => {
    renderAdmin()
    await waitFor(() => screen.getByRole('button', { name: /EDIT/i }))

    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /CANCEL/i }))

    await waitFor(() => {
      expect(screen.getByText(/ADD NEW QUESTION/i)).toBeInTheDocument()
    })
  })

  it('deletes a question when clicking DEL and confirming', async () => {
    vi.mocked(deleteQuestion).mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderAdmin()

    await waitFor(() => screen.getByRole('button', { name: /DEL/i }))
    fireEvent.click(screen.getByRole('button', { name: /DEL/i }))

    await waitFor(() => {
      expect(deleteQuestion).toHaveBeenCalledWith('q1')
    })
  })

  it('does not delete when user cancels confirm dialog', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderAdmin()

    await waitFor(() => screen.getByRole('button', { name: /DEL/i }))
    fireEvent.click(screen.getByRole('button', { name: /DEL/i }))

    expect(deleteQuestion).not.toHaveBeenCalled()
  })

  it('updates question when submitting in edit mode', async () => {
    vi.mocked(updateQuestion).mockResolvedValue({ id: 'q1' })
    const container = renderAdmin()

    await waitFor(() => screen.getByRole('button', { name: /EDIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /EDIT/i }))

    await waitFor(() => screen.getByText(/EDIT QUESTION/i))

    // Submit the form directly (bypasses HTML5 required-field validation in jsdom)
    const form = container.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(updateQuestion).toHaveBeenCalledWith('q1', expect.any(Object))
    })
  })

  it('shows question count after loading', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('1 ENTRIES')).toBeInTheDocument()
    })
  })

  it('shows "Error saving question." when createQuestion fails', async () => {
    vi.mocked(createQuestion).mockRejectedValue(new Error('Server Error'))
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    const container = renderAdmin()

    await waitFor(() => screen.getByText(/ADD NEW QUESTION/i))

    // Fill in answers so the form is valid
    const textarea = container.querySelector('textarea')!
    fireEvent.change(textarea, { target: { value: 'Question?' } })
    container.querySelectorAll('input[type="text"]').forEach((input) => {
      fireEvent.change(input, { target: { value: 'Answer' } })
    })

    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByText('Error saving question.')).toBeInTheDocument()
    })
  })

  it('shows "Error deleting question." when deleteQuestion fails', async () => {
    vi.mocked(deleteQuestion).mockRejectedValue(new Error('Server Error'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderAdmin()

    await waitFor(() => screen.getByRole('button', { name: /DEL/i }))
    fireEvent.click(screen.getByRole('button', { name: /DEL/i }))

    await waitFor(() => {
      expect(screen.getByText('Error deleting question.')).toBeInTheDocument()
    })
  })

  it('shows "Scanning databanks..." loading message while loading', async () => {
    // Keep the promise pending so loading state is visible
    vi.mocked(getQuestionsByPlanet).mockReturnValue(new Promise(() => {}))
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText(/Scanning databanks/i)).toBeInTheDocument()
    })
  })
})
