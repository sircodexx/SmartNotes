const { v4: uuidv4 } = require("uuid")
const db = require("../config/database")
const { validationResult } = require("express-validator")

// Obtener todas las tareas del usuario
exports.getTasks = async (req, res, next) => {
  try {
    const [tasks] = await db.query("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC", [req.user.id])

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener una tarea específica
exports.getTask = async (req, res, next) => {
  try {
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])

    if (task.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      data: task[0],
    })
  } catch (error) {
    next(error)
  }
}

// Crear una nueva tarea
exports.createTask = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, due_date, priority, category, estimated_time, points } = req.body

    const taskId = uuidv4()

    await db.query(
      `INSERT INTO tasks 
       (id, user_id, title, description, due_date, priority, status, category, estimated_time, points) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        taskId,
        req.user.id,
        title,
        description || "",
        new Date(due_date),
        priority,
        category,
        Number.parseInt(estimated_time),
        Number.parseInt(points),
      ],
    )

    const [newTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId])

    res.status(201).json({
      success: true,
      data: newTask[0],
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar una tarea
exports.updateTask = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Verificar si la tarea existe y pertenece al usuario
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])

    if (task.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    const { title, description, due_date, priority, status, category, estimated_time, actual_time, points } = req.body

    // Construir la consulta de actualización dinámicamente
    let updateQuery = "UPDATE tasks SET "
    const updateValues = []
    const updateFields = []

    if (title !== undefined) {
      updateFields.push("title = ?")
      updateValues.push(title)
    }

    if (description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(description)
    }

    if (due_date !== undefined) {
      updateFields.push("due_date = ?")
      updateValues.push(new Date(due_date))
    }

    if (priority !== undefined) {
      updateFields.push("priority = ?")
      updateValues.push(priority)
    }

    if (status !== undefined) {
      updateFields.push("status = ?")
      updateValues.push(status)

      // Si la tarea se marca como completada, actualizar estadísticas
      if (status === "completed" && task[0].status !== "completed") {
        await updateUserStats(req.user.id, task[0].points)
      }
    }

    if (category !== undefined) {
      updateFields.push("category = ?")
      updateValues.push(category)
    }

    if (estimated_time !== undefined) {
      updateFields.push("estimated_time = ?")
      updateValues.push(Number.parseInt(estimated_time))
    }

    if (actual_time !== undefined) {
      updateFields.push("actual_time = ?")
      updateValues.push(Number.parseInt(actual_time))
    }

    if (points !== undefined) {
      updateFields.push("points = ?")
      updateValues.push(Number.parseInt(points))
    }

    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionaron campos para actualizar",
      })
    }

    updateQuery += updateFields.join(", ")
    updateQuery += " WHERE id = ? AND user_id = ?"
    updateValues.push(req.params.id, req.user.id)

    await db.query(updateQuery, updateValues)

    const [updatedTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [req.params.id])

    res.status(200).json({
      success: true,
      data: updatedTask[0],
    })
  } catch (error) {
    next(error)
  }
}

// Eliminar una tarea
exports.deleteTask = async (req, res, next) => {
  try {
    // Verificar si la tarea existe y pertenece al usuario
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])

    if (task.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id])

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}

// Función auxiliar para actualizar estadísticas del usuario cuando completa una tarea
async function updateUserStats(userId, points) {
  try {
    // Actualizar puntos del usuario
    await db.query("UPDATE users SET points = points + ? WHERE id = ?", [points, userId])

    // Actualizar estadísticas diarias
    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya existe una entrada para hoy
    const [existingStats] = await db.query("SELECT * FROM daily_stats WHERE user_id = ? AND date = ?", [userId, today])

    if (existingStats.length > 0) {
      // Actualizar estadísticas existentes
      await db.query(
        "UPDATE daily_stats SET tasks_completed = tasks_completed + 1, points_earned = points_earned + ? WHERE user_id = ? AND date = ?",
        [points, userId, today],
      )
    } else {
      // Crear nueva entrada de estadísticas
      await db.query(
        "INSERT INTO daily_stats (id, user_id, date, tasks_completed, points_earned) VALUES (?, ?, ?, 1, ?)",
        [uuidv4(), userId, today, points],
      )
    }

    // Verificar si el usuario ha ganado nuevas insignias
    await checkForNewBadges(userId)
  } catch (error) {
    console.error("Error al actualizar estadísticas:", error)
  }
}

// Verificar si el usuario ha ganado nuevas insignias
async function checkForNewBadges(userId) {
  try {
    // Obtener datos del usuario
    const [userData] = await db.query("SELECT level, points FROM users WHERE id = ?", [userId])

    if (userData.length === 0) return

    const user = userData[0]

    // Obtener conteo de tareas completadas
    const [completedTasks] = await db.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "completed"',
      [userId],
    )

    const tasksCount = completedTasks[0].count

    // Obtener conteo de tareas urgentes completadas
    const [urgentTasks] = await db.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "completed" AND priority = "urgent"',
      [userId],
    )

    const urgentTasksCount = urgentTasks[0].count

    // Obtener insignias que el usuario ya tiene
    const [userBadges] = await db.query("SELECT badge_id FROM user_badges WHERE user_id = ?", [userId])

    const userBadgeIds = userBadges.map((badge) => badge.badge_id)

    // Verificar cada insignia
    const [allBadges] = await db.query("SELECT * FROM badges")

    for (const badge of allBadges) {
      // Si el usuario ya tiene esta insignia, continuar
      if (userBadgeIds.includes(badge.id)) continue

      let shouldAward = false

      // Lógica para cada tipo de insignia
      switch (badge.name) {
        case "Maestro de Tareas":
          shouldAward = tasksCount >= 50
          break
        case "Pro de Prioridades":
          shouldAward = urgentTasksCount >= 20
          break
        case "Académico":
          shouldAward = user.level >= 10
          break
        // Otras insignias requieren lógica más compleja que se implementaría aquí
      }

      if (shouldAward) {
        // Otorgar la insignia
        await db.query("INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)", [userId, badge.id])

        console.log(`Insignia "${badge.name}" otorgada al usuario ${userId}`)
      }
    }
  } catch (error) {
    console.error("Error al verificar insignias:", error)
  }
}
