import './App.css'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Dashboard from './features/dashboard/Dashboard.tsx'
import Profile from './features/profile/Profile.tsx'
import Shop from './features/shop/Shop.tsx'
import Navbar from './features/nav/Navbar.tsx'
import LandingPage from './features/landing/LandingPage.tsx'
import Training from './features/training/Training.tsx'
import LoginPage from './features/auth/LoginPage.tsx'
import RegisterPage from './features/auth/RegisterPage.tsx'
import AdminPage from './features/admin/AdminPage.tsx'
import { useEffect } from 'react'
import { getGames } from './features/game/api/games.ts'
import { GameStateProvider } from './app/providers/GameStateContext.tsx'
import { SimulationStateProvider } from './app/providers/SimulationStateContext.tsx'
import { UserProvider } from './app/providers/UserContext.tsx'

const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/profile", element: <Profile /> },
      { path: "/shop", element: <Shop /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/training", element: <Training /> },
      { path: "*", element: <h2>404 Nie znaleziono strony</h2> },
    ],
  },
]);

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
          <RouterProvider router={router} />
        </SimulationStateProvider>
      </GameStateProvider>
    </UserProvider>
  )
}