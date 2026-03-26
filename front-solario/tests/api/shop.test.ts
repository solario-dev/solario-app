import { describe, it, expect, vi } from 'vitest'
import { getShopItems, purchaseItem } from '../../src/api/shop'
import api from '../../src/api/client'

vi.mock('../../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('Shop API', () => {
  it('fetches shop items', async () => {
    const mockData = [{ id: '1', name: 'Item 1' }]
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockData })

    const result = await getShopItems()

    expect(api.get).toHaveBeenCalledWith('/api/shop')
    expect(result).toEqual(mockData)
  })

  it('purchases an item', async () => {
    const mockResponse = { message: 'Success' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse })

    const result = await purchaseItem('user123', 'item456')

    expect(api.post).toHaveBeenCalledWith('/api/shop/purchase/user123/item456')
    expect(result).toEqual(mockResponse)
  })
})