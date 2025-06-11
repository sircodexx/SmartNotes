"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de usuario desde localStorage
    const savedUser = localStorage.getItem("smartnotes-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simular autenticación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      name: "Juan Pérez",
      email,
      career: "Ingeniería de Sistemas",
      semester: 4,
      level: 12,
      points: 2450,
      badges: ["early-bird", "task-master", "streak-keeper"],
    }

    setUser(mockUser)
    localStorage.setItem("smartnotes-user", JSON.stringify(mockUser))
    setIsLoading(false)
    return true
  }

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      career: userData.career,
      semester: userData.semester,
      level: 1,
      points: 0,
      badges: [],
    }

    setUser(newUser)
    localStorage.setItem("smartnotes-user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("smartnotes-user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
