import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameStateProvider } from './context/GameStateContext.tsx'
import { GameSocketProvider } from './context/GameSocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameStateProvider>
      <GameSocketProvider>
        <App />
      </GameSocketProvider>
    </GameStateProvider>
  </StrictMode>,
)
