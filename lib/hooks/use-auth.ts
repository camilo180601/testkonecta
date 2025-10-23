"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  rolId: number
}

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  updateUsuario: (usuario: Usuario) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      login: (token, usuario) => set({ token, usuario, isAuthenticated: true }),
      logout: () => set({ token: null, usuario: null, isAuthenticated: false }),
      updateUsuario: (usuario) => set({ usuario }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
