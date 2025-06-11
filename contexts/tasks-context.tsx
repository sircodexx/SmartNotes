"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Task {
  id: string
  title: string
  description: string
  dueDate: Date
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed"
  category: string
  estimatedTime: number
  actualTime?: number
  points: number
}

interface TasksContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Proyecto Final de Base de Datos",
      description: "Desarrollar sistema de gestión de biblioteca",
      dueDate: new Date("2024-12-20"),
      priority: "high",
      status: "in-progress",
      category: "Proyecto",
      estimatedTime: 20,
      actualTime: 8,
      points: 100,
    },
    {
      id: "2",
      title: "Ensayo de Filosofía",
      description: "Análisis crítico sobre la ética en la tecnología",
      dueDate: new Date("2024-12-15"),
      priority: "medium",
      status: "pending",
      category: "Ensayo",
      estimatedTime: 6,
      points: 50,
    },
    {
      id: "3",
      title: "Práctica de Cálculo III",
      description: "Ejercicios de integrales múltiples",
      dueDate: new Date("2024-12-12"),
      priority: "urgent",
      status: "pending",
      category: "Práctica",
      estimatedTime: 3,
      points: 30,
    },
  ])

  const addTask = (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const completeTask = (id: string) => {
    updateTask(id, { status: "completed" })
  }

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, completeTask }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}
