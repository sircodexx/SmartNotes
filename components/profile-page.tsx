"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTasks } from "@/contexts/tasks-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Bell, Shield, Trophy, Save, Edit } from "lucide-react"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { tasks } = useTasks()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    career: user?.career || "",
    semester: user?.semester || 1,
    bio: "Estudiante apasionado por la tecnología y el aprendizaje continuo.",
    university: "Universidad Nacional",
  })

  const [notifications, setNotifications] = useState({
    taskReminders: true,
    weeklyReports: true,
    achievements: true,
    deadlineAlerts: true,
  })

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "es",
    defaultTaskDuration: 25,
    workingHours: { start: "08:00", end: "18:00" },
  })

  const completedTasks = tasks.filter((task) => task.status === "completed")
  const totalPoints = completedTasks.reduce((sum, task) => sum + task.points, 0)

  const handleSaveProfile = () => {
    // Aquí se guardarían los cambios en el backend
    setIsEditing(false)
    alert("Perfil actualizado correctamente")
  }

  const stats = {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    totalPoints: totalPoints,
    currentStreak: 5,
    badges: user?.badges.length || 0,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarFallback className="text-2xl">
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-600">{user?.career}</p>
              <p className="text-sm text-gray-500">{user?.semester}° Ciclo</p>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Nivel {user?.level}</span>
              <Badge variant="secondary">{totalPoints} pts</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completedTasks}</div>
                <div className="text-xs text-gray-500">Tareas Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.badges}</div>
                <div className="text-xs text-gray-500">Insignias</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              <TabsTrigger value="preferences">Preferencias</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Información Personal</span>
                  </CardTitle>
                  <CardDescription>Actualiza tu información personal y académica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">Universidad</Label>
                      <Input
                        id="university"
                        value={profileData.university}
                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="career">Carrera</Label>
                      <Select
                        value={profileData.career}
                        onValueChange={(value) => setProfileData({ ...profileData, career: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ingeniería de Sistemas">Ingeniería de Sistemas</SelectItem>
                          <SelectItem value="Ingeniería Industrial">Ingeniería Industrial</SelectItem>
                          <SelectItem value="Medicina">Medicina</SelectItem>
                          <SelectItem value="Derecho">Derecho</SelectItem>
                          <SelectItem value="Psicología">Psicología</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Ciclo académico</Label>
                    <Select
                      value={profileData.semester.toString()}
                      onValueChange={(value) => setProfileData({ ...profileData, semester: Number.parseInt(value) })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}° Ciclo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Cuéntanos un poco sobre ti..."
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5" />
                      <span>Estadísticas Generales</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                        <div className="text-sm text-blue-700">Total de Tareas</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                        <div className="text-sm text-green-700">Completadas</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                        <div className="text-sm text-purple-700">Tasa de Éxito</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
                        <div className="text-sm text-yellow-700">Puntos Totales</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                        <div className="text-sm text-orange-700">Racha Actual</div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{stats.badges}</div>
                        <div className="text-sm text-indigo-700">Insignias</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progreso por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Proyecto", "Examen", "Tarea", "Ensayo"].map((category) => {
                        const categoryTasks = tasks.filter((t) => t.category === category)
                        const completedInCategory = categoryTasks.filter((t) => t.status === "completed").length
                        const percentage =
                          categoryTasks.length > 0 ? (completedInCategory / categoryTasks.length) * 100 : 0

                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{category}</span>
                              <span>
                                {completedInCategory}/{categoryTasks.length}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Configuración de Notificaciones</span>
                  </CardTitle>
                  <CardDescription>Personaliza cómo y cuándo recibir notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recordatorios de tareas</Label>
                        <p className="text-sm text-gray-500">Recibe notificaciones antes de las fechas límite</p>
                      </div>
                      <Switch
                        checked={notifications.taskReminders}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, taskReminders: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reportes semanales</Label>
                        <p className="text-sm text-gray-500">Resumen semanal de tu progreso académico</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Logros y insignias</Label>
                        <p className="text-sm text-gray-500">Notificaciones cuando desbloquees nuevos logros</p>
                      </div>
                      <Switch
                        checked={notifications.achievements}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, achievements: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de fechas límite</Label>
                        <p className="text-sm text-gray-500">Alertas urgentes para tareas próximas a vencer</p>
                      </div>
                      <Switch
                        checked={notifications.deadlineAlerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, deadlineAlerts: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Preferencias de la Aplicación</span>
                  </CardTitle>
                  <CardDescription>Personaliza la experiencia de SmartNotes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Tema de la aplicación</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Oscuro</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duración predeterminada de tareas (minutos)</Label>
                      <Select
                        value={preferences.defaultTaskDuration.toString()}
                        onValueChange={(value) =>
                          setPreferences({ ...preferences, defaultTaskDuration: Number.parseInt(value) })
                        }
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
                  </div>

                  <div className="space-y-4">
                    <Label>Horario de trabajo</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time" className="text-sm">
                          Hora de inicio
                        </Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={preferences.workingHours.start}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              workingHours: { ...preferences.workingHours, start: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time" className="text-sm">
                          Hora de fin
                        </Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={preferences.workingHours.end}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              workingHours: { ...preferences.workingHours, end: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full md:w-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Shield className="w-5 h-5" />
            <span>Zona de Peligro</span>
          </CardTitle>
          <CardDescription>Acciones irreversibles que afectan tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium">Cerrar sesión</h4>
              <p className="text-sm text-gray-500">Cierra tu sesión actual en este dispositivo</p>
            </div>
            <Button variant="outline" onClick={logout} className="text-red-600 border-red-200 hover:bg-red-50">
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
