import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../../src/pages/Profile'
import { UserContext } from '../../src/context/UserContext'
import type { User } from '../../src/api/types/User'
import type { ShopItem } from '../../src/api/types/ShopItem'

vi.mock('../../src/api/shop', () => ({
  getShopItems: vi.fn()
}))

vi.mock('../../src/api/users', () => ({
  equipSkin: vi.fn()
}))

import { getShopItems } from '../../src/api/shop'
import { equipSkin } from '../../src/api/users'

const mockUser: User = {
  id: 'user-42',
  username: 'StarPilot',
  email: 'star@solario.com',
  role: 'User',
  level: 7,
  credits: 2500,
  quizzesCompleted: 15,
  wins: 5,
  conqueredPlanets: ['Mars', 'Jupiter'],
  inventory: ['skin-1'],
  equippedSkin: 'default'
}

const skinShopItem: ShopItem = {
  id: 'skin-1',
  name: 'Red Racer',
  description: 'A fast red ship',
  price: 200,
  imageUrl: '',
  type: 'skin'
}

const mockLogin = vi.fn()

function renderProfile(user: User | null = mockUser) {
  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          user,
          token: user ? 'test-token' : null,
          login: mockLogin,
          logout: vi.fn(),
          isAuthenticated: !!user
        }}
      >
        <Profile />
      </UserContext.Provider>
    </MemoryRouter>
  )
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getShopItems).mockResolvedValue([skinShopItem])
  })

  it('redirects unauthenticated users (profile content not visible)', () => {
    renderProfile(null)
    // When not authenticated, Profile renders <Navigate> which changes the route
    // The profile content (username) should not be rendered
    expect(screen.queryByText('StarPilot')).not.toBeInTheDocument()
  })

  it('shows the username in the profile header', () => {
    renderProfile()
    // Profile renders user.username as text (CSS uppercase class doesn't change DOM text)
    expect(screen.getByText('StarPilot')).toBeInTheDocument()
  })

  it('shows user level', () => {
    renderProfile()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows user wins', () => {
    renderProfile()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows planet names in the conquered planets section', () => {
    renderProfile()
    expect(screen.getByText('Mars')).toBeInTheDocument()
    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  it('shows inventory items from the shop', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByText('Red Racer')).toBeInTheDocument()
    })
  })

  it('shows empty inventory message when inventory is empty', async () => {
    const emptyUser = { ...mockUser, inventory: [] }
    renderProfile(emptyUser)

    await waitFor(() => {
      expect(screen.getByText(/Inventory empty/i)).toBeInTheDocument()
    })
  })

  it('shows EQUIP button for skin items not yet equipped', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /EQUIP/i })).toBeInTheDocument()
    })
  })

  it('clicking EQUIP calls equipSkin with correct args', async () => {
    vi.mocked(equipSkin).mockResolvedValue({ message: 'ok', equippedSkin: 'skin-1' })
    renderProfile()

    await waitFor(() => screen.getByRole('button', { name: /EQUIP/i }))

    fireEvent.click(screen.getByRole('button', { name: /EQUIP/i }))

    await waitFor(() => {
      expect(equipSkin).toHaveBeenCalledWith('user-42', 'skin-1')
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ equippedSkin: 'skin-1' }),
        'test-token'
      )
    })
  })

  it('shows EQUIPPED label for the currently equipped skin', async () => {
    const equippedUser = { ...mockUser, equippedSkin: 'skin-1' }
    renderProfile(equippedUser)

    await waitFor(() => {
      expect(screen.getByText('EQUIPPED')).toBeInTheDocument()
    })
  })

  it('shows Unequip button when a non-default skin is equipped', async () => {
    const equippedUser = { ...mockUser, equippedSkin: 'skin-1' }
    renderProfile(equippedUser)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unequip/i })).toBeInTheDocument()
    })
  })

  it('renders profile without item names when getShopItems fails (fetchItems catch)', async () => {
    vi.mocked(getShopItems).mockRejectedValue(new Error('Server Error'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderProfile()

    // Profile itself must still render (no crash)
    expect(screen.getByText('StarPilot')).toBeInTheDocument()

    // shopItems stays empty → inventory item shows as "Unknown Item"
    await waitFor(() => {
      expect(screen.getByText(/Unknown Item \(skin-1\)/)).toBeInTheDocument()
    })
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('does not call login when equipSkin throws (handleEquip catch)', async () => {
    vi.mocked(equipSkin).mockRejectedValue(new Error('Equip failed'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderProfile()

    await waitFor(() => screen.getByRole('button', { name: /EQUIP/i }))
    fireEvent.click(screen.getByRole('button', { name: /EQUIP/i }))

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to equip', expect.any(Error))
    })
    expect(mockLogin).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('shows QUIZZES RESULTS section heading', () => {
    renderProfile()
    expect(screen.getByText('QUIZZES RESULTS')).toBeInTheDocument()
  })

  it('shows CONQUERED PLANETS section heading', () => {
    renderProfile()
    expect(screen.getByText('CONQUERED PLANETS')).toBeInTheDocument()
  })

  it('shows INVENTORY section heading', () => {
    renderProfile()
    expect(screen.getByText('INVENTORY')).toBeInTheDocument()
  })

  it('shows user role badge in uppercase', () => {
    renderProfile()
    expect(screen.getByText('USER')).toBeInTheDocument()
  })
})
