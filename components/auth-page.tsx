"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, BookOpen, Target } from "lucide-react"

export function AuthPage() {
  const { login, register, isLoading } = useAuth()
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    career: "",
    semester: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(loginData.email, loginData.password)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    await register({
      ...registerData,
      semester: Number.parseInt(registerData.semester),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">SmartNotes</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Organiza tu vida académica de manera inteligente</h2>
            <p className="text-gray-600 text-lg">
              La plataforma diseñada especialmente para estudiantes universitarios que buscan reducir el estrés y
              mejorar su productividad académica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700">Gestión Inteligente</h3>
              <p className="text-sm text-gray-500">Organiza tus tareas automáticamente</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700">Gamificación</h3>
              <p className="text-sm text-gray-500">Mantente motivado con puntos y logros</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700">Integración Moodle</h3>
              <p className="text-sm text-gray-500">Sincroniza con tu plataforma académica</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <Card className="w-full max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Bienvenido de vuelta</CardTitle>
                <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@universidad.edu"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>Únete a SmartNotes y transforma tu experiencia académica</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      placeholder="Juan Pérez"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@universidad.edu"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career">Carrera</Label>
                    <Select onValueChange={(value) => setRegisterData({ ...registerData, career: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sistemas">Ingeniería de Sistemas</SelectItem>
                        <SelectItem value="industrial">Ingeniería Industrial</SelectItem>
                        <SelectItem value="civil">Ingeniería Civil</SelectItem>
                        <SelectItem value="medicina">Medicina</SelectItem>
                        <SelectItem value="derecho">Derecho</SelectItem>
                        <SelectItem value="psicologia">Psicología</SelectItem>
                        <SelectItem value="administracion">Administración</SelectItem>
                        <SelectItem value="contabilidad">Contabilidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Ciclo académico</Label>
                    <Select onValueChange={(value) => setRegisterData({ ...registerData, semester: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1er Ciclo</SelectItem>
                        <SelectItem value="2">2do Ciclo</SelectItem>
                        <SelectItem value="3">3er Ciclo</SelectItem>
                        <SelectItem value="4">4to Ciclo</SelectItem>
                        <SelectItem value="5">5to Ciclo</SelectItem>
                        <SelectItem value="6">6to Ciclo</SelectItem>
                        <SelectItem value="7">7mo Ciclo</SelectItem>
                        <SelectItem value="8">8vo Ciclo</SelectItem>
                        <SelectItem value="9">9no Ciclo</SelectItem>
                        <SelectItem value="10">10mo Ciclo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
