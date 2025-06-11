"use client"

import { useAuth } from "@/contexts/auth-context"
import { useTasks } from "@/contexts/tasks-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Calendar, Trophy, Target, BookOpen, Plus } from "lucide-react"

interface DashboardProps {
  onPageChange: (page: string) => void
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth()
  const { tasks } = useTasks()

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const pendingTasks = tasks.filter((task) => task.status === "pending").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  const urgentTasks = tasks.filter((task) => task.priority === "urgent" && task.status !== "completed").length

  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const upcomingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente"
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return "Sin prioridad"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">¡Hola, {user?.name}! 👋</h1>
            <p className="text-blue-100 mt-1">
              {user?.career} - {user?.semester}° Ciclo
            </p>
            <p className="text-blue-100 mt-2">
              Tienes {pendingTasks + inProgressTasks} tareas pendientes. ¡Sigamos adelante!
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span className="text-lg font-semibold">Nivel {user?.level}</span>
            </div>
            <p className="text-blue-100">{user?.points} puntos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">{completionRate.toFixed(1)}% de progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Tareas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Por comenzar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTasks}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Progreso Semanal</span>
            </CardTitle>
            <CardDescription>Tu rendimiento académico esta semana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tareas Completadas</span>
                <span>
                  {completedTasks}/{tasks.length}
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user?.points}</div>
                <div className="text-sm text-green-700">Puntos Totales</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user?.badges.length}</div>
                <div className="text-sm text-blue-700">Insignias</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Acciones Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => onPageChange("tasks")} className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
            <Button onClick={() => onPageChange("calendar")} className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Calendario
            </Button>
            <Button onClick={() => onPageChange("focus")} className="w-full justify-start" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Modo Enfoque
            </Button>
            <Button onClick={() => onPageChange("gamification")} className="w-full justify-start" variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Progreso
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Próximas Tareas</span>
          </CardTitle>
          <CardDescription>Tareas que requieren tu atención próximamente</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>¡Excelente! No tienes tareas pendientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-500">{task.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{getPriorityText(task.priority)}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(task.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
