import planetsData from '../../data/planets.json'

interface PlanetInfoPanelProps {
  planetName: string
}

export const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({ planetName }) => {
  const planetInfo = planetsData.celestialBodies.find(p => p.name === planetName)

  if (!planetInfo) return null

  const { radiusKm } = planetInfo

  return (
    <div className="w-[340px] panel backdrop-blur-md p-6 font-geist text-[var(--color-primary)] ">
      <h2 className="mb-6 text-base font-orbit border-b-2 border-[var(--color-primary)]/30 pb-3 text-glow tracking-wide uppercase">
        {planetName}
      </h2>

      <InfoRow label="RADIUS" value={`${radiusKm.toLocaleString()} km`} />
      <InfoRow label="TYPE" value="Planet" />

      {planetInfo.hasRings && (
        <InfoRow label="SPECIAL FEATURES" value="Ring System" />
      )}

      <div className="mt-6 p-3 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-md text-xs text-[var(--color-primary)]/60 text-center tracking-wide">
        Use mouse to rotate the planet
      </div>

      <button className='btn-primary mt-6'>Start Quiz</button>
    </div>
  )
}

const InfoLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[11px] text-[var(--color-primary)]/50 mb-1.5 tracking-widest font-semibold">
    {children}
  </div>
)

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="mb-5">
    <InfoLabel>{label}</InfoLabel>
    <div className="text-lg text-[var(--color-primary)]">{value}</div>
  </div>
)
