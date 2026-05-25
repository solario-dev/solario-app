interface LandingButtonProps {
  planetName: string
  onLand: () => void
}

export const LandingButton: React.FC<LandingButtonProps> = ({ planetName, onLand }) => {
  return (
    <button
      onClick={onLand}
      className="btn-primary-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      Land on {planetName}
    </button>
  )
}
