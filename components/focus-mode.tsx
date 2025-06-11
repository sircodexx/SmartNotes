"use client"

import { useState, useEffect } from "react"
import { useTasks } from "@/contexts/tasks-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, RotateCcw, Focus, Clock, Target, CheckCircle } from "lucide-react"

export function FocusMode() {
  const { tasks, updateTask } = useTasks()
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionType, setSessionType] = useState<"work" | "break">("work")
  const [completedSessions, setCompletedSessions] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState(25)

  const availableTasks = tasks.filter((task) => task.status !== "completed")
  const currentTask = tasks.find((task) => task.id === selectedTask)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, timeRemaining])

  const handleSessionComplete = () => {
    setIsActive(false)
    setCompletedSessions((prev) => prev + 1)

    if (sessionType === "work") {
      // Mark task as in progress if it was pending
      if (currentTask && currentTask.status === "pending") {
        updateTask(currentTask.id, { status: "in-progress" })
      }

      // Switch to break
      setSessionType("break")
      setTimeRemaining(5 * 60) // 5 minute break
    } else {
      // Switch back to work
      setSessionType("work")
      setTimeRemaining(selectedDuration * 60)
    }
  }

  const startTimer = () => {
    if (!selectedTask && sessionType === "work") {
      alert("Por favor selecciona una tarea para enfocar")
      return
    }
    setIsActive(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
  }

  const stopTimer = () => {
    setIsActive(false)
    setIsPaused(false)
    setTimeRemaining(sessionType === "work" ? selectedDuration * 60 : 5 * 60)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsPaused(false)
    setTimeRemaining(selectedDuration * 60)
    setSessionType("work")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = sessionType === "work" ? selectedDuration * 60 : 5 * 60
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  const completeCurrentTask = () => {
    if (currentTask) {
      updateTask(currentTask.id, { status: "completed" })
      setSelectedTask("")
      stopTimer()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Focus className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Modo Enfoque</h1>
          </div>
          <p className="text-gray-600">Técnica Pomodoro para maximizar tu productividad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{sessionType === "work" ? "Sesión de Trabajo" : "Descanso"}</span>
                </span>
                {sessionType === "work" && currentTask && (
                  <span className="text-sm font-normal text-gray-600">{currentTask.title}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Timer Display */}
              <div className="space-y-4">
                <div
                  className={`text-8xl font-mono font-bold ${
                    sessionType === "work" ? "text-indigo-600" : "text-green-600"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <Progress value={getProgress()} className={`h-3 ${sessionType === "work" ? "" : "bg-green-100"}`} />
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!isActive ? (
                  <Button onClick={startTimer} size="lg" className="px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="outline" className="px-8">
                    <Pause className="w-5 h-5 mr-2" />
                    {isPaused ? "Reanudar" : "Pausar"}
                  </Button>
                )}

                <Button onClick={stopTimer} size="lg" variant="outline">
                  <Square className="w-5 h-5 mr-2" />
                  Detener
                </Button>

                <Button onClick={resetTimer} size="lg" variant="outline">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{completedSessions}</div>
                  <div className="text-sm text-indigo-700">Sesiones Completadas</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor((completedSessions * selectedDuration) / 60)}h{" "}
                    {(completedSessions * selectedDuration) % 60}m
                  </div>
                  <div className="text-sm text-purple-700">Tiempo Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings & Task Selection */}
          <div className="space-y-4">
            {/* Task Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Tarea Actual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tarea" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentTask && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{currentTask.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{currentTask.description}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{currentTask.category}</span>
                        <span>{currentTask.estimatedTime}h estimadas</span>
                      </div>
                    </div>

                    <Button onClick={completeCurrentTask} className="w-full" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Completada
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timer Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duración de trabajo (minutos)</label>
                  <Select
                    value={selectedDuration.toString()}
                    onValueChange={(value) => {
                      setSelectedDuration(Number.parseInt(value))
                      if (!isActive) {
                        setTimeRemaining(Number.parseInt(value) * 60)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="25">25 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Consejos para el enfoque:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Elimina distracciones del entorno</li>
                    <li>• Mantén agua cerca para hidratarte</li>
                    <li>• Respeta los descansos</li>
                    <li>• Celebra cada sesión completada</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sesiones</span>
                    <span className="font-semibold">{completedSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tiempo enfocado</span>
                    <span className="font-semibold">
                      {Math.floor((completedSessions * selectedDuration) / 60)}h{" "}
                      {(completedSessions * selectedDuration) % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tareas completadas</span>
                    <span className="font-semibold">{tasks.filter((t) => t.status === "completed").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
