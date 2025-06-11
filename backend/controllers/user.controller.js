const bcrypt = require("bcryptjs")
const db = require("../config/database")
const { validationResult } = require("express-validator")

// Obtener perfil del usuario
exports.getProfile = async (req, res, next) => {
  try {
    // Obtener datos del usuario
    const [userData] = await db.query(
      "SELECT id, name, email, career, semester, level, points, bio, university, created_at FROM users WHERE id = ?",
      [req.user.id],
    )

    if (userData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Obtener preferencias del usuario
    const [preferences] = await db.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.user.id])

    // Obtener insignias del usuario
    const [badges] = await db.query(
      `SELECT b.id, b.name, b.description, b.icon, ub.earned_at
       FROM badges b
       JOIN user_badges ub ON b.id = ub.badge_id
       WHERE ub.user_id = ?`,
      [req.user.id],
    )

    res.status(200).json({
      success: true,
      data: {
        ...userData[0],
        preferences: preferences.length > 0 ? preferences[0] : {},
        badges,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar perfil del usuario
exports.updateProfile = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, career, semester, bio, university } = req.body

    // Construir la consulta de actualización dinámicamente
    let updateQuery = "UPDATE users SET "
    const updateValues = []
    const updateFields = []

    if (name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(name)
    }

    if (career !== undefined) {
      updateFields.push("career = ?")
      updateValues.push(career)
    }

    if (semester !== undefined) {
      updateFields.push("semester = ?")
      updateValues.push(Number.parseInt(semester))
    }

    if (bio !== undefined) {
      updateFields.push("bio = ?")
      updateValues.push(bio)
    }

    if (university !== undefined) {
      updateFields.push("university = ?")
      updateValues.push(university)
    }

    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionaron campos para actualizar",
      })
    }

    updateQuery += updateFields.join(", ")
    updateQuery += " WHERE id = ?"
    updateValues.push(req.user.id)

    await db.query(updateQuery, updateValues)

    // Obtener el perfil actualizado
    const [updatedUser] = await db.query(
      "SELECT id, name, email, career, semester, level, points, bio, university FROM users WHERE id = ?",
      [req.user.id],
    )

    res.status(200).json({
      success: true,
      data: updatedUser[0],
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar contraseña
exports.updatePassword = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body

    // Obtener usuario con contraseña
    const [user] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id])

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user[0].password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "La contraseña actual es incorrecta",
      })
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Actualizar contraseña
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id])

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar preferencias del usuario
exports.updatePreferences = async (req, res, next) => {
  try {
    const {
      theme,
      language,
      default_task_duration,
      working_hours_start,
      working_hours_end,
      task_reminders,
      weekly_reports,
      achievements_notifications,
      deadline_alerts,
    } = req.body

    // Verificar si ya existen preferencias para el usuario
    const [existingPrefs] = await db.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.user.id])

    if (existingPrefs.length === 0) {
      // Crear nuevas preferencias
      await db.query(
        `INSERT INTO user_preferences 
         (user_id, theme, language, default_task_duration, working_hours_start, working_hours_end, 
          task_reminders, weekly_reports, achievements_notifications, deadline_alerts) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          theme || "light",
          language || "es",
          default_task_duration || 25,
          working_hours_start || "08:00:00",
          working_hours_end || "18:00:00",
          task_reminders !== undefined ? task_reminders : true,
          weekly_reports !== undefined ? weekly_reports : true,
          achievements_notifications !== undefined ? achievements_notifications : true,
          deadline_alerts !== undefined ? deadline_alerts : true,
        ],
      )
    } else {
      // Construir la consulta de actualización dinámicamente
      let updateQuery = "UPDATE user_preferences SET "
      const updateValues = []
      const updateFields = []

      if (theme !== undefined) {
        updateFields.push("theme = ?")
        updateValues.push(theme)
      }

      if (language !== undefined) {
        updateFields.push("language = ?")
        updateValues.push(language)
      }

      if (default_task_duration !== undefined) {
        updateFields.push("default_task_duration = ?")
        updateValues.push(Number.parseInt(default_task_duration))
      }

      if (working_hours_start !== undefined) {
        updateFields.push("working_hours_start = ?")
        updateValues.push(working_hours_start)
      }

      if (working_hours_end !== undefined) {
        updateFields.push("working_hours_end = ?")
        updateValues.push(working_hours_end)
      }

      if (task_reminders !== undefined) {
        updateFields.push("task_reminders = ?")
        updateValues.push(task_reminders)
      }

      if (weekly_reports !== undefined) {
        updateFields.push("weekly_reports = ?")
        updateValues.push(weekly_reports)
      }

      if (achievements_notifications !== undefined) {
        updateFields.push("achievements_notifications = ?")
        updateValues.push(achievements_notifications)
      }

      if (deadline_alerts !== undefined) {
        updateFields.push("deadline_alerts = ?")
        updateValues.push(deadline_alerts)
      }

      // Si no hay campos para actualizar
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionaron campos para actualizar",
        })
      }

      updateQuery += updateFields.join(", ")
      updateQuery += " WHERE user_id = ?"
      updateValues.push(req.user.id)

      await db.query(updateQuery, updateValues)
    }

    // Obtener las preferencias actualizadas
    const [updatedPrefs] = await db.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.user.id])

    res.status(200).json({
      success: true,
      data: updatedPrefs[0],
    })
  } catch (error) {
    next(error)
  }
  // Registrar nuevo usuario
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y contraseña son requeridos",
      })
    }

    // Verificar si el email ya existe
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email])
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El email ya está registrado",
      })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    await db.query(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      [uuidv4(), name, email, hashedPassword]
    )

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
    })
  } catch (error) {
    next(error)
  }
}
}
