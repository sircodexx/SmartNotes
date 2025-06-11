const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")
const db = require("../config/database")
const { validationResult } = require("express-validator")

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// Registrar un nuevo usuario
exports.register = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, career, semester } = req.body

    // Verificar si el usuario ya existe
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico ya está registrado",
      })
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Crear usuario
    const userId = uuidv4()
    await db.query("INSERT INTO users (id, name, email, password, career, semester) VALUES (?, ?, ?, ?, ?, ?)", [
      userId,
      name,
      email,
      hashedPassword,
      career,
      Number.parseInt(semester),
    ])

    // Crear preferencias por defecto
    await db.query("INSERT INTO user_preferences (user_id) VALUES (?)", [userId])

    // Obtener el usuario creado
    const [newUser] = await db.query(
      "SELECT id, name, email, career, semester, level, points FROM users WHERE id = ?",
      [userId],
    )

    // Generar token
    const token = generateToken(userId)

    res.status(201).json({
      success: true,
      token,
      user: newUser[0],
    })
  } catch (error) {
    next(error)
  }
}

// Iniciar sesión
exports.login = async (req, res, next) => {
  try {
    // Validar entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Verificar si el usuario existe
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    const user = users[0]

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Obtener insignias del usuario
    const [userBadges] = await db.query(
      `SELECT b.id, b.name, b.description, b.icon 
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       WHERE ub.user_id = ?`,
      [user.id],
    )

    // Generar token
    const token = generateToken(user.id)

    // Eliminar la contraseña del objeto de usuario
    delete user.password

    res.status(200).json({
      success: true,
      token,
      user: {
        ...user,
        badges: userBadges.map((badge) => badge.id),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Obtener usuario actual
exports.getMe = async (req, res, next) => {
  try {
    // Obtener insignias del usuario
    const [userBadges] = await db.query(
      `SELECT b.id, b.name, b.description, b.icon 
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       WHERE ub.user_id = ?`,
      [req.user.id],
    )

    res.status(200).json({
      success: true,
      user: {
        ...req.user,
        badges: userBadges.map((badge) => badge.id),
      },
    })
  } catch (error) {
    next(error)
  }
}
