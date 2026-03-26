import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LandingButton } from '../../../src/components/solar-system/LandingButton'

describe('LandingButton', () => {
  it('renders with planet name', () => {
    render(<LandingButton planetName="Mars" onLand={() => {}} />)
    expect(screen.getByText('Land on Mars')).toBeInTheDocument()
  })

  it('calls onLand when clicked', () => {
    const onLandMock = vi.fn()
    render(<LandingButton planetName="Venus" onLand={onLandMock} />)
    
    fireEvent.click(screen.getByText('Land on Venus'))
    expect(onLandMock).toHaveBeenCalledTimes(1)
  })
})