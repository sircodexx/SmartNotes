require("dotenv").config()
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")
const db = require("../config/database")

async function seed() {
  try {
    console.log("Iniciando proceso de población de la base de datos...")

    // Insertar insignias predefinidas
    const badges = [
      {
        id: uuidv4(),
        name: "Madrugador",
        description: "Completa 5 tareas antes de las 8 AM",
        icon: "🌅",
      },
      {
        id: uuidv4(),
        name: "Maestro de Tareas",
        description: "Completa 50 tareas",
        icon: "🎯",
      },
      {
        id: uuidv4(),
        name: "Racha Perfecta",
        description: "Mantén una racha de 7 días completando tareas",
        icon: "🔥",
      },
      {
        id: uuidv4(),
        name: "Pro de Prioridades",
        description: "Completa 20 tareas urgentes",
        icon: "⚡",
      },
      {
        id: uuidv4(),
        name: "Maestro del Tiempo",
        description: "Completa tareas dentro del tiempo estimado 10 veces",
        icon: "⏰",
      },
      {
        id: uuidv4(),
        name: "Académico",
        description: "Alcanza el nivel 10",
        icon: "🎓",
      },
    ]

    // Insertar las insignias
    for (const badge of badges) {
      await db.query("INSERT INTO badges (id, name, description, icon) VALUES (?, ?, ?, ?)", [
        badge.id,
        badge.name,
        badge.description,
        badge.icon,
      ])
    }
    console.log(`${badges.length} insignias insertadas correctamente`)

    // Crear un usuario de demostración
    const hashedPassword = await bcrypt.hash("password123", 10)
    const userId = uuidv4()

    await db.query(
      "INSERT INTO users (id, name, email, password, career, semester, level, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, "Juan Pérez", "juan@ejemplo.com", hashedPassword, "Ingeniería de Sistemas", 4, 12, 2450],
    )
    console.log("Usuario de demostración creado")

    // Asignar algunas insignias al usuario
    const userBadges = [badges[0].id, badges[1].id, badges[2].id]
    for (const badgeId of userBadges) {
      await db.query("INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)", [userId, badgeId])
    }
    console.log("Insignias asignadas al usuario")

    // Crear preferencias para el usuario
    await db.query("INSERT INTO user_preferences (user_id) VALUES (?)", [userId])
    console.log("Preferencias de usuario creadas")

    // Crear algunas tareas para el usuario
    const tasks = [
      {
        id: uuidv4(),
        title: "Proyecto Final de Base de Datos",
        description: "Desarrollar sistema de gestión de biblioteca",
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días en el futuro
        priority: "high",
        status: "in-progress",
        category: "Proyecto",
        estimated_time: 20,
        actual_time: 8,
        points: 100,
      },
      {
        id: uuidv4(),
        title: "Ensayo de Filosofía",
        description: "Análisis crítico sobre la ética en la tecnología",
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días en el futuro
        priority: "medium",
        status: "pending",
        category: "Ensayo",
        estimated_time: 6,
        actual_time: null,
        points: 50,
      },
      {
        id: uuidv4(),
        title: "Práctica de Cálculo III",
        description: "Ejercicios de integrales múltiples",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días en el futuro
        priority: "urgent",
        status: "pending",
        category: "Práctica",
        estimated_time: 3,
        actual_time: null,
        points: 30,
      },
    ]

    for (const task of tasks) {
      await db.query(
        `INSERT INTO tasks 
         (id, user_id, title, description, due_date, priority, status, category, estimated_time, actual_time, points) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          userId,
          task.title,
          task.description,
          task.due_date,
          task.priority,
          task.status,
          task.category,
          task.estimated_time,
          task.actual_time,
          task.points,
        ],
      )
    }
    console.log(`${tasks.length} tareas creadas para el usuario`)

    // Crear algunas estadísticas diarias
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const stats = [
      {
        id: uuidv4(),
        user_id: userId,
        date: today,
        tasks_completed: 2,
        points_earned: 150,
        study_time: 120,
      },
      {
        id: uuidv4(),
        user_id: userId,
        date: yesterday,
        tasks_completed: 3,
        points_earned: 200,
        study_time: 180,
      },
    ]

    for (const stat of stats) {
      await db.query(
        "INSERT INTO daily_stats (id, user_id, date, tasks_completed, points_earned, study_time) VALUES (?, ?, ?, ?, ?, ?)",
        [stat.id, stat.user_id, stat.date, stat.tasks_completed, stat.points_earned, stat.study_time],
      )
    }
    console.log("Estadísticas diarias creadas")

    console.log("Base de datos poblada exitosamente")
  } catch (error) {
    console.error("Error al poblar la base de datos:", error)
  } finally {
    process.exit()
  }
}

seed()
