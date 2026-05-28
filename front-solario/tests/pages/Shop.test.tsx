import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Shop from '../../src/pages/Shop'
import { UserContext } from '../../src/context/UserContext'
import type { User } from '../../src/api/types/User'
import type { ShopItem } from '../../src/api/types/ShopItem'

vi.mock('../../src/api/shop', () => ({
  getShopItems: vi.fn(),
  purchaseItem: vi.fn()
}))

import { getShopItems, purchaseItem } from '../../src/api/shop'

const mockUser: User = {
  id: 'user-1',
  username: 'Pilot',
  email: 'pilot@test.com',
  role: 'User',
  level: 1,
  credits: 1000,
  quizzesCompleted: 0,
  wins: 0,
  conqueredPlanets: [],
  inventory: [],
  equippedSkin: 'default'
}

const passportItem: ShopItem = {
  id: 'item-passport-1',
  name: 'Mars Passport',
  description: 'Grants access to Mars',
  price: 500,
  imageUrl: '',
  type: 'passport'
}

const skinItem: ShopItem = {
  id: 'item-skin-1',
  name: 'Red Cruiser',
  description: 'A sleek red ship',
  price: 300,
  imageUrl: '',
  type: 'skin'
}

const expensiveItem: ShopItem = {
  id: 'item-expensive-1',
  name: 'Galactic Fleet',
  description: 'Very expensive ship',
  price: 9999,
  imageUrl: '',
  type: 'passport'
}

const mockLogin = vi.fn()

function renderShop(user: User = mockUser) {
  return render(
    <UserContext.Provider
      value={{
        user,
        token: 'test-token',
        login: mockLogin,
        logout: vi.fn(),
        isAuthenticated: true
      }}
    >
      <Shop />
    </UserContext.Provider>
  )
}

describe('Shop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    vi.mocked(getShopItems).mockReturnValue(new Promise(() => {}))
    renderShop()
    expect(screen.getByText(/LOADING STORE DATA/i)).toBeInTheDocument()
  })

  it('shows GALACTIC SUPPLY header after loading', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    renderShop()

    await waitFor(() => {
      expect(screen.getByText(/GALACTIC SUPPLY/i)).toBeInTheDocument()
    })
  })

  it('displays passport items in the Passports tab by default', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem, skinItem])
    renderShop()

    await waitFor(() => {
      expect(screen.getByText('Mars Passport')).toBeInTheDocument()
    })
    expect(screen.queryByText('Red Cruiser')).not.toBeInTheDocument()
  })

  it('switches to skin items when clicking Skins tab', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem, skinItem])
    renderShop()

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    fireEvent.click(screen.getByText(/Ships & Skins/i))

    expect(screen.getByText('Red Cruiser')).toBeInTheDocument()
    expect(screen.queryByText('Mars Passport')).not.toBeInTheDocument()
  })

  it('shows PURCHASE button for affordable items', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    renderShop()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /PURCHASE/i })).toBeInTheDocument()
    })
  })

  it('shows INSUFFICIENT FUNDS for items the user cannot afford', async () => {
    vi.mocked(getShopItems).mockResolvedValue([expensiveItem])
    renderShop()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /INSUFFICIENT FUNDS/i })).toBeInTheDocument()
    })
  })

  it('shows OWNED for items already in the user inventory', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    const userWithItem = { ...mockUser, inventory: ['item-passport-1'] }
    renderShop(userWithItem)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /OWNED/i })).toBeInTheDocument()
    })
  })

  it('OWNED and INSUFFICIENT FUNDS buttons are disabled', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem, expensiveItem])
    const userWithItem = { ...mockUser, inventory: ['item-passport-1'] }
    renderShop(userWithItem)

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    expect(screen.getByRole('button', { name: /OWNED/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /INSUFFICIENT FUNDS/i })).toBeDisabled()
  })

  it('shows success message after successful purchase', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    vi.mocked(purchaseItem).mockResolvedValue({ message: 'Success' } as any)
    renderShop()

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    fireEvent.click(screen.getByRole('button', { name: /PURCHASE/i }))

    await waitFor(() => {
      expect(screen.getByText(/Successfully purchased Mars Passport/i)).toBeInTheDocument()
    })

    expect(purchaseItem).toHaveBeenCalledWith('user-1', 'item-passport-1')
    expect(mockLogin).toHaveBeenCalled()
  })

  it('shows error message on purchase failure', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    vi.mocked(purchaseItem).mockRejectedValue({ response: { data: { message: 'Insufficient funds' } } })
    renderShop()

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    fireEvent.click(screen.getByRole('button', { name: /PURCHASE/i }))

    await waitFor(() => {
      expect(screen.getByText('Insufficient funds')).toBeInTheDocument()
    })
  })

  it('shows empty state message when no items in current tab', async () => {
    vi.mocked(getShopItems).mockResolvedValue([skinItem])
    renderShop()

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    expect(screen.getByText(/NO SHIPMENTS DETECTED/i)).toBeInTheDocument()
  })

  it('shows user credits balance in the header', async () => {
    vi.mocked(getShopItems).mockResolvedValue([])
    renderShop()

    await waitFor(() => {
      expect(screen.getByText(/CURRENT BALANCE/i)).toBeInTheDocument()
    })
  })

  it('shop still renders (not stuck in loading) when getShopItems fails', async () => {
    vi.mocked(getShopItems).mockRejectedValue(new Error('Server Error'))
    renderShop()

    // The finally block sets loading=false, so the main layout should appear
    await waitFor(() => {
      expect(screen.getByText(/GALACTIC SUPPLY/i)).toBeInTheDocument()
    })
    // No items in the passport tab → empty state message
    expect(screen.getByText(/NO SHIPMENTS DETECTED/i)).toBeInTheDocument()
  })

  it('shows generic "Purchase failed" when error has no response message', async () => {
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    vi.mocked(purchaseItem).mockRejectedValue(new Error('Network Error'))
    renderShop()

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    fireEvent.click(screen.getByRole('button', { name: /PURCHASE/i }))

    await waitFor(() => {
      expect(screen.getByText('Purchase failed')).toBeInTheDocument()
    })
  })

  it('hides success message after 3 seconds', async () => {
    vi.useFakeTimers()
    vi.mocked(getShopItems).mockResolvedValue([passportItem])
    vi.mocked(purchaseItem).mockResolvedValue({ message: 'ok' } as any)
    renderShop()

    // Restore real timers for the async loading phase
    vi.useRealTimers()

    await waitFor(() => screen.getByText(/GALACTIC SUPPLY/i))

    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: /PURCHASE/i }))

    await vi.runAllTimersAsync()

    vi.useRealTimers()

    await waitFor(() => {
      expect(screen.queryByText(/Successfully purchased/i)).not.toBeInTheDocument()
    })
  })
})
