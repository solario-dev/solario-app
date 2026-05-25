import { create } from "zustand";
import type { User } from "../types/User";
import api from "../lib/client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (newUser: User) => void;
}

// Odczytanie wartości początkowych z localStorage
const initialToken = localStorage.getItem("token");
const initialUser = localStorage.getItem("user");
let parsedUser: User | null = null;
let isExpired = false;

if (initialToken) {
  try {
    const base64Url = initialToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const { exp } = JSON.parse(jsonPayload);
    if (exp && exp * 1000 < Date.now()) {
      isExpired = true;
    }
  } catch (e) {
    isExpired = true;
  }
}

if (initialToken && !isExpired) {
  api.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
  if (initialUser) {
    try {
      parsedUser = JSON.parse(initialUser);
    } catch (e) {
      console.error("Failed to parse initial user from localStorage", e);
    }
  }
} else {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}


export const useAuthStore = create<AuthState>((set) => ({
  user: parsedUser,
  token: initialToken,
  isAuthenticated: !!parsedUser,
  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
