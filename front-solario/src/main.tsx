import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameStateProvider } from './context/GameStateContext.tsx'
import { SimulationStateProvider } from './context/SimulationStateContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameStateProvider>
      <SimulationStateProvider>
        <App />
      </SimulationStateProvider>
    </GameStateProvider>
  </StrictMode>,
)
