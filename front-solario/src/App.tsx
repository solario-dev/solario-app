import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.tsx'
import Profile from './pages/Profile.tsx'
import Shop from './pages/Shop.tsx'
import Navbar from './components/navbar/Navbar.tsx'
import LandingPage from './pages/LandingPage.tsx'
import Training from './pages/Training.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import { useEffect } from 'react'
import { getGames } from './api/games.ts'
import { GameStateProvider } from './context/GameStateContext.tsx'
import { SimulationStateProvider } from './context/SimulationStateContext.tsx'
import { UserProvider } from './context/UserContext.tsx'

export default function App() {

  useEffect(() => {
    const fetchGames = async () => {
      try {
        await getGames();
      } catch (error) {
        console.log("Nie udało się pobrać gry.");
      }
    };

    fetchGames();
  }, []);

  return (
    <UserProvider>
        <GameStateProvider>
            <SimulationStateProvider>
                <BrowserRouter>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/shop" element={<Shop />} />

                        <Route path="/training" element={<Training />} />

                        <Route path="*" element={<h2>404 Nie znaleziono strony</h2>} />
                    </Routes>
                </BrowserRouter>
            </SimulationStateProvider>
        </GameStateProvider>
    </UserProvider>
  )
}