require("dotenv").config()
const express = require("express")
const cors = require("cors")
const db = require("./config/database")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const taskRoutes = require("./routes/task.routes")
const badgeRoutes = require("./routes/badge.routes")
const statsRoutes = require("./routes/stats.routes")

// Inicializar la aplicación Express
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/badges", badgeRoutes)
app.use("/api/stats", statsRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de SmartNotes" })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// Puerto
const PORT = process.env.PORT || 5000

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`)

  try {
    // Verificar conexión a la base de datos
    await db.query("SELECT 1")
    console.log("Conexión a la base de datos establecida correctamente")
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message)
  }
})
