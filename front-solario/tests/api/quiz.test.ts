import { describe, it, expect, vi } from 'vitest'
import {
  getQuestionsByPlanet,
  submitAnswer,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../../src/api/quiz'
import api from '../../src/api/client'

vi.mock('../../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}))

const mockQuestion = {
  id: 'q1',
  text: 'What is the largest planet?',
  correctAnswerId: 'a2',
  answers: [
    { id: 'a1', text: 'Earth' },
    { id: 'a2', text: 'Jupiter' }
  ]
}

describe('quiz API', () => {
  it('getQuestionsByPlanet sends GET with planet and count params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [mockQuestion] })

    const result = await getQuestionsByPlanet('mars', 5)

    expect(api.get).toHaveBeenCalledWith('/api/questions?planet=mars&count=5')
    expect(result).toEqual([mockQuestion])
  })

  it('getQuestionsByPlanet uses default count of 5', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

    await getQuestionsByPlanet('earth')

    expect(api.get).toHaveBeenCalledWith('/api/questions?planet=earth&count=5')
  })

  it('submitAnswer sends POST to correct endpoint', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { correct: true } })

    const result = await submitAnswer('q1', 'player-1', 0.8, 'a2')

    expect(api.post).toHaveBeenCalledWith(
      '/api/quiz/questions/q1/answer?playerId=player-1',
      { answerId: 'a2', remainingRatio: 0.8 }
    )
    expect(result).toEqual({ correct: true })
  })

  it('submitAnswer returns false for incorrect answer', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { correct: false } })

    const result = await submitAnswer('q1', 'player-1', 0.5, 'a1')

    expect(result).toEqual({ correct: false })
  })

  it('createQuestion sends POST to /api/questions', async () => {
    const payload = {
      planetName: 'mars',
      text: 'New question?',
      answers: [{ text: 'A' }, { text: 'B' }],
      correctAnswerIndex: 0
    }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'q-new', ...payload } })

    const result = await createQuestion(payload)

    expect(api.post).toHaveBeenCalledWith('/api/questions', payload)
    expect(result).toMatchObject(payload)
  })

  it('updateQuestion sends PUT to /api/questions/:id', async () => {
    const payload = {
      planetName: 'mars',
      text: 'Updated question?',
      answers: [{ text: 'A' }, { text: 'B' }],
      correctAnswerIndex: 1
    }
    vi.mocked(api.put).mockResolvedValueOnce({ data: { id: 'q1', ...payload } })

    const result = await updateQuestion('q1', payload)

    expect(api.put).toHaveBeenCalledWith('/api/questions/q1', payload)
    expect(result).toMatchObject(payload)
  })

  it('deleteQuestion sends DELETE to /api/questions/:id', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: undefined })

    await deleteQuestion('q1')

    expect(api.delete).toHaveBeenCalledWith('/api/questions/q1')
  })

  it('getQuestionsByPlanet propagates errors', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Not found'))

    await expect(getQuestionsByPlanet('unknown')).rejects.toThrow('Not found')
  })
})
