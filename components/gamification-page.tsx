"use client"

import { useAuth } from "@/contexts/auth-context"
import { useTasks } from "@/contexts/tasks-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award, TrendingUp, CheckCircle, Clock, Flame } from "lucide-react"

export function GamificationPage() {
  const { user } = useAuth()
  const { tasks } = useTasks()

  const completedTasks = tasks.filter((task) => task.status === "completed")
  const totalPoints = completedTasks.reduce((sum, task) => sum + task.points, 0)
  const currentLevel = user?.level || 1
  const pointsForNextLevel = currentLevel * 1000
  const progressToNextLevel = (totalPoints % 1000) / 10

  const badges = [
    {
      id: "early-bird",
      name: "Madrugador",
      description: "Completa 5 tareas antes de las 8 AM",
      icon: "🌅",
      earned: user?.badges.includes("early-bird"),
      progress: 3,
      total: 5,
    },
    {
      id: "task-master",
      name: "Maestro de Tareas",
      description: "Completa 50 tareas",
      icon: "🎯",
      earned: user?.badges.includes("task-master"),
      progress: completedTasks.length,
      total: 50,
    },
    {
      id: "streak-keeper",
      name: "Racha Perfecta",
      description: "Mantén una racha de 7 días completando tareas",
      icon: "🔥",
      earned: user?.badges.includes("streak-keeper"),
      progress: 5,
      total: 7,
    },
    {
      id: "priority-pro",
      name: "Pro de Prioridades",
      description: "Completa 20 tareas urgentes",
      icon: "⚡",
      earned: false,
      progress: completedTasks.filter((t) => t.priority === "urgent").length,
      total: 20,
    },
    {
      id: "time-master",
      name: "Maestro del Tiempo",
      description: "Completa tareas dentro del tiempo estimado 10 veces",
      icon: "⏰",
      earned: false,
      progress: 7,
      total: 10,
    },
    {
      id: "scholar",
      name: "Académico",
      description: "Alcanza el nivel 10",
      icon: "🎓",
      earned: false,
      progress: currentLevel,
      total: 10,
    },
  ]

  const weeklyStats = {
    tasksCompleted: completedTasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return taskDate >= weekAgo
    }).length,
    pointsEarned: 450,
    streak: 5,
    averageTime: 2.5,
  }

  const achievements = [
    {
      title: "Primera Tarea Completada",
      description: "Completaste tu primera tarea en SmartNotes",
      date: "2024-11-15",
      points: 50,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: "Nivel 5 Alcanzado",
      description: "Has alcanzado el nivel 5 en tu progreso académico",
      date: "2024-11-20",
      points: 200,
      icon: <Star className="w-5 h-5 text-yellow-500" />,
    },
    {
      title: "Racha de 3 Días",
      description: "Mantuviste una racha de 3 días completando tareas",
      date: "2024-11-25",
      points: 100,
      icon: <Flame className="w-5 h-5 text-orange-500" />,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Tu Progreso Académico</h1>
        <p className="text-gray-600">Mantente motivado y alcanza tus metas</p>
      </div>

      {/* Level and Points */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nivel {currentLevel}</h2>
                <p className="text-purple-100">{user?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <p className="text-purple-100">Puntos Totales</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso al Nivel {currentLevel + 1}</span>
              <span>
                {totalPoints % 1000}/{pointsForNextLevel} pts
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-3 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{weeklyStats.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Ganados</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{weeklyStats.pointsEarned}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{weeklyStats.streak}</div>
            <p className="text-xs text-muted-foreground">Días consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{weeklyStats.averageTime}h</div>
            <p className="text-xs text-muted-foreground">Por tarea</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Insignias</span>
            </CardTitle>
            <CardDescription>Desbloquea insignias completando desafíos específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    badge.earned ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${badge.earned ? "" : "grayscale opacity-50"}`}>{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{badge.name}</h3>
                        {badge.earned && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Desbloqueada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>

                      {!badge.earned && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progreso</span>
                            <span>
                              {badge.progress}/{badge.total}
                            </span>
                          </div>
                          <Progress value={(badge.progress / badge.total) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Logros Recientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {achievement.icon}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{achievement.date}</span>
                      <Badge variant="outline" className="text-xs">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Tabla de Clasificación</span>
          </CardTitle>
          <CardDescription>Compite con otros estudiantes de tu carrera</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Ana García", career: "Ing. Sistemas", points: 3200, level: 15, position: 1 },
              { name: "Carlos López", career: "Ing. Sistemas", points: 2800, level: 13, position: 2 },
              {
                name: user?.name || "Tú",
                career: user?.career || "",
                points: totalPoints,
                level: currentLevel,
                position: 3,
                isUser: true,
              },
              { name: "María Rodríguez", career: "Ing. Sistemas", points: 2200, level: 11, position: 4 },
              { name: "Pedro Martín", career: "Ing. Sistemas", points: 2000, level: 10, position: 5 },
            ].map((student) => (
              <div
                key={student.position}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  student.isUser ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      student.position === 1
                        ? "bg-yellow-100 text-yellow-700"
                        : student.position === 2
                          ? "bg-gray-100 text-gray-700"
                          : student.position === 3
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {student.position}
                  </div>
                  <div>
                    <h4 className={`font-medium ${student.isUser ? "text-blue-700" : ""}`}>{student.name}</h4>
                    <p className="text-sm text-gray-500">{student.career}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{student.points} pts</div>
                  <div className="text-sm text-gray-500">Nivel {student.level}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
