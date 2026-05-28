import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import QuizWindow from '../../../src/components/quiz/QuizWindow'
import { UserContext } from '../../../src/context/UserContext'
import type { User } from '../../../src/api/types/User'

vi.mock('../../../src/api/quiz', () => ({
  getQuestionsByPlanet: vi.fn(),
  submitAnswer: vi.fn()
}))

import { getQuestionsByPlanet, submitAnswer } from '../../../src/api/quiz'

const mockUser: User = {
  id: 'player-1',
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

const mockQuestions = [
  {
    id: 'q1',
    text: 'What is the largest planet in the solar system?',
    correctAnswerId: 'a2',
    answers: [
      { id: 'a1', text: 'Earth' },
      { id: 'a2', text: 'Jupiter' },
      { id: 'a3', text: 'Mars' }
    ]
  },
  {
    id: 'q2',
    text: 'What is the closest planet to the Sun?',
    correctAnswerId: 'b1',
    answers: [
      { id: 'b1', text: 'Mercury' },
      { id: 'b2', text: 'Venus' }
    ]
  }
]

function renderQuiz(
  planetName = 'Mars',
  onClose = vi.fn(),
  onExitOrbit = vi.fn(),
  user: User | null = mockUser
) {
  return render(
    <UserContext.Provider
      value={{ user, token: 'tok', login: vi.fn(), logout: vi.fn(), isAuthenticated: !!user }}
    >
      <QuizWindow planetName={planetName} onClose={onClose} onExitOrbit={onExitOrbit} />
    </UserContext.Provider>
  )
}

describe('QuizWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while fetching questions', () => {
    vi.mocked(getQuestionsByPlanet).mockReturnValue(new Promise(() => {}))
    renderQuiz()
    expect(screen.getByText(/SCANNING DATABANKS/i)).toBeInTheDocument()
  })

  it('shows question text after questions load', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    renderQuiz()

    await waitFor(() => {
      expect(screen.getByText('What is the largest planet in the solar system?')).toBeInTheDocument()
    })
  })

  it('shows answer options for the current question', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    renderQuiz()

    await waitFor(() => screen.getByText('What is the largest planet in the solar system?'))

    expect(screen.getByText('Earth')).toBeInTheDocument()
    expect(screen.getByText('Jupiter')).toBeInTheDocument()
    expect(screen.getByText('Mars')).toBeInTheDocument()
  })

  it('shows question counter (QUESTION 1/2)', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    renderQuiz()

    await waitFor(() => {
      expect(screen.getByText('QUESTION 1/2')).toBeInTheDocument()
    })
  })

  it('shows score counter starting at 0', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    renderQuiz()

    await waitFor(() => {
      expect(screen.getByText('SCORE: 0')).toBeInTheDocument()
    })
  })

  it('shows EXIT button', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    renderQuiz()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /EXIT/i })).toBeInTheDocument()
    })
  })

  it('EXIT button calls onClose', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    const onClose = vi.fn()
    renderQuiz('Mars', onClose)

    await waitFor(() => screen.getByRole('button', { name: /EXIT/i }))

    fireEvent.click(screen.getByRole('button', { name: /EXIT/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls submitAnswer when clicking an answer', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    vi.mocked(submitAnswer).mockResolvedValue({ correct: true })
    renderQuiz()

    await waitFor(() => screen.getByText('Jupiter'))

    fireEvent.click(screen.getByText('Jupiter'))

    await waitFor(() => {
      expect(submitAnswer).toHaveBeenCalledWith('q1', 'player-1', expect.any(Number), 'a2')
    })
  })

  it('shows CORRECT! feedback when answer is right', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    vi.mocked(submitAnswer).mockResolvedValue({ correct: true })
    renderQuiz()

    await waitFor(() => screen.getByText('Jupiter'))
    fireEvent.click(screen.getByText('Jupiter'))

    await waitFor(() => {
      expect(screen.getByText('CORRECT!')).toBeInTheDocument()
    })
  })

  it('shows WRONG! feedback when answer is incorrect', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    vi.mocked(submitAnswer).mockResolvedValue({ correct: false })
    renderQuiz()

    await waitFor(() => screen.getByText('Earth'))
    fireEvent.click(screen.getByText('Earth'))

    await waitFor(() => {
      expect(screen.getByText('WRONG!')).toBeInTheDocument()
    })
  })

  it('shows SESSION COMPLETE screen when no questions returned', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    renderQuiz()

    await waitFor(() => {
      expect(screen.getByText(/SESSION COMPLETE/i)).toBeInTheDocument()
    })
  })

  it('shows "No questions found" message when questions array is empty', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    renderQuiz('Pluto')

    await waitFor(() => {
      expect(screen.getByText(/No questions found for Pluto/i)).toBeInTheDocument()
    })
  })

  it('STAY ON PLANET button calls onClose on finished screen', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    const onClose = vi.fn()
    renderQuiz('Mars', onClose)

    await waitFor(() => screen.getByText(/SESSION COMPLETE/i))

    fireEvent.click(screen.getByRole('button', { name: /STAY ON PLANET/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('RETURN TO SPACE button calls onExitOrbit on finished screen', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue([])
    const onExitOrbit = vi.fn()
    renderQuiz('Mars', vi.fn(), onExitOrbit)

    await waitFor(() => screen.getByText(/SESSION COMPLETE/i))

    fireEvent.click(screen.getByRole('button', { name: /RETURN TO SPACE/i }))
    expect(onExitOrbit).toHaveBeenCalledTimes(1)
  })

  it('shows "ERROR" result message and does not crash when submitAnswer throws (handleAnswer catch)', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    vi.mocked(submitAnswer).mockRejectedValue(new Error('Network Error'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderQuiz()

    await waitFor(() => screen.getByText('Jupiter'))
    fireEvent.click(screen.getByText('Jupiter'))

    await waitFor(() => {
      expect(screen.getByText('ERROR')).toBeInTheDocument()
    })
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('fetches questions for the given planet name', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    renderQuiz('Jupiter')

    await waitFor(() => {
      expect(getQuestionsByPlanet).toHaveBeenCalledWith('Jupiter', 5, 'player-1')
    })
  })

  it('uses playerId "0" when user is null', async () => {
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)
    render(
      <UserContext.Provider
        value={{ user: null, token: null, login: vi.fn(), logout: vi.fn(), isAuthenticated: false }}
      >
        <QuizWindow planetName="Mars" onClose={vi.fn()} onExitOrbit={vi.fn()} />
      </UserContext.Provider>
    )

    await waitFor(() => {
      expect(getQuestionsByPlanet).toHaveBeenCalledWith('Mars', 5, '0')
    })
  })

  it("timer expiry shows TIME'S UP, then auto-advances to the next question", async () => {
    vi.useFakeTimers()
    vi.mocked(getQuestionsByPlanet).mockResolvedValue(mockQuestions)

    // Render inside act so React flushes effects AND the async fetchQuestions
    // resolves via microtasks before we advance fake timers.
    await act(async () => {
      renderQuiz()
    })

    // Questions should be loaded now (question 1 of 2)
    expect(screen.getByText('QUESTION 1/2')).toBeInTheDocument()

    // Advance exactly TIME_PER_QUESTION = 10 000 ms (100 × 100 ms ticks).
    // The 100th tick sets prev=100 → handleTimeOut fires ONCE.
    // The await+act boundary then flushes React state (timerActive→false,
    // clearInterval), so no further ticks call handleTimeOut.
    await act(async () => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.getByText("TIME'S UP!")).toBeInTheDocument()

    // Advance the 2 000 ms delay that precedes nextQuestion()
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Quiz must have moved to question 2; TIME'S UP overlay should be gone
    expect(screen.queryByText("TIME'S UP!")).not.toBeInTheDocument()
    expect(screen.getByText('QUESTION 2/2')).toBeInTheDocument()

    vi.useRealTimers()
  })
})
