const jwt = require("jsonwebtoken")
const db = require("../config/database")

exports.protect = async (req, res, next) => {
  try {
    let token

    // Verificar si hay token en el header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No estás autorizado para acceder a este recurso",
      })
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Verificar si el usuario existe
      const [user] = await db.query("SELECT id, name, email, career, semester, level, points FROM users WHERE id = ?", [
        decoded.id,
      ])

      if (!user.length) {
        return res.status(401).json({
          success: false,
          message: "El usuario ya no existe",
        })
      }

      // Agregar el usuario a la solicitud
      req.user = user[0]
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      })
    }
  } catch (error) {
    next(error)
  }
}
