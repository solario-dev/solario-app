import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.tsx'
import Profile from './pages/Profile.tsx'
import Shop from './pages/Shop.tsx'
import Navbar from './components/navbar/Navbar.tsx'
import LandingPage from './pages/LandingPage.tsx'
import Training from './pages/Training.tsx'
import { useEffect } from 'react'
import { getGames } from './api/games.ts'

export default function App() {

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const games = await getGames();
        console.log("Games fetched in App.tsx:", games);
      } catch (error) {
        console.log("Nie udało się pobrać gry.");
        console.error("Error fetching games in App.tsx:", error);
      }
    };

    fetchGames();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Strona główna */}
        <Route path="/" element={<LandingPage />} />

        {/* Inne podstrony */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/shop" element={<Shop />} />

         {/* Rozgrywka treningowa */}
        <Route path="/training" element={<Training />} />

        {/* Opcjonalnie: obsługa nieistniejących stron */}
        <Route path="*" element={<h2>404 Nie znaleziono strony</h2>} />
      </Routes>
    </BrowserRouter>
  )
}
