import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import Dashboard from './features/dashboard/dashboard.page.tsx'
import Profile from './features/profile/profile.page.tsx'
import Shop from './features/shop/shop.page.tsx'
import Navbar from './features/nav/Navbar.tsx'
import LandingPage from './features/landing/landing.page.tsx'
import Training from './features/training/training.page.tsx'
import LoginPage from './features/auth/login.page.tsx'
import RegisterPage from './features/auth/register.page.tsx'
import AdminPage from './features/admin/AdminPage.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const Layout = () => {

  return (
    <>
      <Navbar />
      <div className="pt-[73px]">
        <Outlet />
      </div>
    </>
  );
};

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}