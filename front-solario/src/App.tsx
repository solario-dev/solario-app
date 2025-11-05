import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.tsx'
import Profile from './pages/Profile.tsx'
import Shop from './pages/Shop.tsx'
import Navbar from './components/navbar/Navbar.tsx'
import LandingPage from './pages/LandingPage.tsx'
import Training from './pages/Training.tsx'

export default function App() {
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
