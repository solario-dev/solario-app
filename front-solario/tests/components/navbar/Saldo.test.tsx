import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Saldo from '../../../src/components/navbar/Saldo'
import { UserContext } from '../../../src/context/UserContext'
import type { User } from '../../../src/api/types/User'

const mockUser: User = {
  id: 'user-1',
  username: 'Pilot',
  email: 'pilot@test.com',
  role: 'User',
  level: 1,
  credits: 12345,
  quizzesCompleted: 0,
  wins: 0,
  conqueredPlanets: [],
  inventory: [],
  equippedSkin: 'default'
}

function renderSaldo(user: User | null) {
  const { container } = render(
    <UserContext.Provider
      value={{ user, token: user ? 'tok' : null, login: () => {}, logout: () => {}, isAuthenticated: !!user }}
    >
      <Saldo />
    </UserContext.Provider>
  )
  return container
}

describe('Saldo', () => {
  it('displays the user credits and CR suffix', () => {
    const container = renderSaldo(mockUser)

    // JSX produces two text nodes inside <p> so we query the element directly.
    // toLocaleString() uses the system locale which varies (e.g. "12,345" in
    // English or "12 345" in Polish), so strip all non-digit chars to compare
    // just the numeric value, then confirm the "CR" suffix is present.
    const p = container.querySelector('p')!
    const rawText = p.textContent ?? ''

    expect(rawText.replace(/\D/g, '')).toContain('12345')
    expect(rawText).toContain('CR')
  })

  it('shows 0 CR when user is null', () => {
    const container = renderSaldo(null)

    const p = container.querySelector('p')!
    expect(p.textContent).toContain('0')
    expect(p.textContent).toContain('CR')
  })

  it('shows the yellow coin indicator dot', () => {
    const container = renderSaldo(mockUser)
    expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument()
  })
})
