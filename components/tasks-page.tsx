"use client"

import type React from "react"

import { useState } from "react"
import { useTasks, type Task } from "@/contexts/tasks-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Calendar, Filter } from "lucide-react"

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useTasks()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">("dueDate")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as Task["priority"],
    category: "",
    estimatedTime: 1,
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: "",
      estimatedTime: 1,
    })
    setEditingTask(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const taskData = {
      ...formData,
      dueDate: new Date(formData.dueDate),
      status: "pending" as Task["status"],
      points:
        formData.priority === "urgent"
          ? 50
          : formData.priority === "high"
            ? 40
            : formData.priority === "medium"
              ? 30
              : 20,
    }

    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString().split("T")[0],
      priority: task.priority,
      category: task.category,
      estimatedTime: task.estimatedTime,
    })
    setIsDialogOpen(true)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      default:
        return 0
    }
  })

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
          <p className="text-gray-600">Organiza y prioriza tus actividades académicas</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
              <DialogDescription>
                {editingTask ? "Modifica los detalles de tu tarea" : "Crea una nueva tarea para tu agenda académica"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Proyecto final de matemáticas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe los detalles de la tarea..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha límite</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Tiempo estimado (horas)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Examen">Examen</SelectItem>
                      <SelectItem value="Proyecto">Proyecto</SelectItem>
                      <SelectItem value="Tarea">Tarea</SelectItem>
                      <SelectItem value="Ensayo">Ensayo</SelectItem>
                      <SelectItem value="Práctica">Práctica</SelectItem>
                      <SelectItem value="Presentación">Presentación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingTask ? "Actualizar" : "Crear"} Tarea</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes ({tasks.filter((t) => t.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="in-progress">
              En Progreso ({tasks.filter((t) => t.status === "in-progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completadas ({tasks.filter((t) => t.status === "completed").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Fecha límite</SelectItem>
              <SelectItem value="priority">Prioridad</SelectItem>
              <SelectItem value="created">Fecha creación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {filter === "all"
                  ? "No tienes tareas"
                  : `No tienes tareas ${filter === "pending" ? "pendientes" : filter === "in-progress" ? "en progreso" : "completadas"}`}
              </h3>
              <p className="text-gray-400 mb-4">
                {filter === "all"
                  ? "Crea tu primera tarea para comenzar a organizar tu vida académica"
                  : "Todas tus tareas están en otras categorías"}
              </p>
              {filter === "all" && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Tarea
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={`transition-all hover:shadow-md ${task.status === "completed" ? "opacity-75" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(task.status)}
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3
                          className={`font-semibold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                        >
                          {task.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedTime}h estimadas</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getPriorityText(task.priority)}
                        </Badge>
                        <span className="text-green-600 font-medium">+{task.points} pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {task.status !== "completed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateTask(task.id, {
                              status: task.status === "pending" ? "in-progress" : "completed",
                            })
                          }
                        >
                          {task.status === "pending" ? "Iniciar" : "Completar"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(task)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
