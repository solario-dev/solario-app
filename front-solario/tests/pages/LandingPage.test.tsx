import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LandingPage from '../../src/pages/LandingPage'

describe('LandingPage', () => {
  it('renders the heading', () => {
    render(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('LandingPage')
  })
})