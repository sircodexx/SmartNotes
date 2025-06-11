"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

const API_URL = "http://localhost:5000/api"

interface User {
  id: string
  name: string
  email: string
  career: string
  semester: number
  level: number
  points: number
  badges: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem("token")
    if (token) {
      loadUser(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUser = async (token: string) => {
    try {
      setIsLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const response = await axios.get(`${API_URL}/auth/me`, config)
      setUser(response.data.user)
      setError(null)
    } catch (err) {
      localStorage.removeItem("token")
      setError("Sesión expirada. Por favor inicia sesión nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      
      const { token, user } = response.data
      localStorage.setItem("token", token)
      setUser(user)
      
      return true
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión")
      return false
    } finally {
      setIsLoading(false)
    }
  }
}