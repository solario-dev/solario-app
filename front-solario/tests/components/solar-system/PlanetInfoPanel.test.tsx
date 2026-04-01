import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PlanetInfoPanel } from '../../../src/components/solar-system/PlanetInfoPanel'

describe('PlanetInfoPanel', () => {
  it('renders planet info correctly', () => {
    render(<PlanetInfoPanel planetName="Mars" />)
    
    expect(screen.getByText('Mars')).toBeInTheDocument()
    
    expect(screen.getByText(/3.*?389.*?5\s*km/)).toBeInTheDocument()
    
    expect(screen.getByText('Planet')).toBeInTheDocument()
  })

  it('calls onStartQuiz when quiz button is clicked', () => {
    const onStartQuizMock = vi.fn()
    render(<PlanetInfoPanel planetName="Mars" onStartQuiz={onStartQuizMock} />)
    
    fireEvent.click(screen.getByText('Start Quiz'))
    
    expect(onStartQuizMock).toHaveBeenCalledTimes(1)
  })
})