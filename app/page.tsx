"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { TasksProvider } from "@/contexts/tasks-context"
import { AuthPage } from "@/components/auth-page"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { TasksPage } from "@/components/tasks-page"
import { CalendarPage } from "@/components/calendar-page"
import { GamificationPage } from "@/components/gamification-page"
import { FocusMode } from "@/components/focus-mode"
import { ProfilePage } from "@/components/profile-page"

function AppContent() {
  const { user, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">SN</span>
          </div>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-500">Cargando SmartNotes...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onPageChange={setCurrentPage} />
      case "tasks":
        return <TasksPage />
      case "calendar":
        return <CalendarPage />
      case "gamification":
        return <GamificationPage />
      case "focus":
        return <FocusMode />
      case "profile":
        return <ProfilePage />
      default:
        return <Dashboard onPageChange={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="pb-6">{renderCurrentPage()}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <AppContent />
      </TasksProvider>
    </AuthProvider>
  )
}
