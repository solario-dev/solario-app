import { describe, it, expect, vi } from 'vitest'
import api from '../../src/api/client'

// Access the registered interceptor handlers directly from Axios internals.
// The InterceptorManager stores entries in `.handlers` (Axios 1.x public API).
const getInterceptorHandler = () => {
  const manager = api.interceptors.response as unknown as {
    handlers: Array<{ fulfilled: (r: unknown) => unknown; rejected: (e: unknown) => unknown } | null>
  }
  return manager.handlers.find(Boolean)!
}

describe('api/client', () => {
  it('is an axios instance configured with the correct base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5001')
  })

  it('success interceptor returns the response unchanged', () => {
    const { fulfilled } = getInterceptorHandler()
    const mockResponse = { data: { id: 1 }, status: 200 }
    expect(fulfilled(mockResponse)).toBe(mockResponse)
  })

  it('error interceptor calls console.error and re-throws the error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rejected } = getInterceptorHandler()
    const testError = new Error('Simulated API failure')

    await expect(rejected(testError)).rejects.toBe(testError)
    expect(consoleError).toHaveBeenCalledWith('API Error:', testError)

    consoleError.mockRestore()
  })
})
