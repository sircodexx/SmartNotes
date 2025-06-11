"use client"

import { useState } from "react"
import { useTasks } from "@/contexts/tasks-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, AlertTriangle } from "lucide-react"

export function CalendarPage() {
  const { tasks } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []

  // Previous month days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0)
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i),
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true,
    })
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false,
    })
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isPastDue = (date: Date) => {
    return date < today && !isToday(date)
  }

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

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const upcomingTasks = tasks
    .filter((task) => {
      const taskDate = new Date(task.dueDate)
      return taskDate >= today && task.status !== "completed"
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendario Académico</h1>
          <p className="text-gray-600">Visualiza tus tareas y fechas importantes</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={view === "month" ? "default" : "outline"} onClick={() => setView("month")}>
            Mes
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} onClick={() => setView("week")}>
            Semana
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>
                  {monthNames[currentMonth]} {currentYear}
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day.date)
                const hasUrgentTasks = dayTasks.some(
                  (task) => task.priority === "urgent" && task.status !== "completed",
                )

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border rounded-lg transition-colors cursor-pointer
                      ${day.isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"}
                      ${isToday(day.date) ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                      ${hasUrgentTasks ? "ring-1 ring-red-300" : ""}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm ${isToday(day.date) ? "font-bold text-blue-600" : ""}`}>
                        {day.date.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">{dayTasks.length}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-700 line-through"
                              : isPastDue(day.date) && task.status !== "completed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                          title={task.title}
                        >
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">+{dayTasks.length - 2} más</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tareas de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              {getTasksForDate(today).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tienes tareas para hoy</p>
              ) : (
                <div className="space-y-2">
                  {getTasksForDate(today).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tienes tareas próximas</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 ml-5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Intl.DateTimeFormat("es-ES", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tareas este mes</span>
                <span className="font-semibold">
                  {
                    tasks.filter((task) => {
                      const taskDate = new Date(task.dueDate)
                      return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completadas</span>
                <span className="font-semibold text-green-600">
                  {
                    tasks.filter((task) => {
                      const taskDate = new Date(task.dueDate)
                      return (
                        task.status === "completed" &&
                        taskDate.getMonth() === currentMonth &&
                        taskDate.getFullYear() === currentYear
                      )
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendientes</span>
                <span className="font-semibold text-orange-600">
                  {
                    tasks.filter((task) => {
                      const taskDate = new Date(task.dueDate)
                      return (
                        task.status !== "completed" &&
                        taskDate.getMonth() === currentMonth &&
                        taskDate.getFullYear() === currentYear
                      )
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                  Urgentes
                </span>
                <span className="font-semibold text-red-600">
                  {tasks.filter((task) => task.priority === "urgent" && task.status !== "completed").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
