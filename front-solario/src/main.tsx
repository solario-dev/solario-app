import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameStateProvider } from './app/providers/GameStateContext.tsx'
import { SimulationStateProvider } from './app/providers/SimulationStateContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameStateProvider>
      <SimulationStateProvider>
        <App />
      </SimulationStateProvider>
    </GameStateProvider>
  </StrictMode>,
)
