const express = require("express")
const { check } = require("express-validator")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// Ruta para registro
router.post(
  "/register",
  [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "Por favor incluye un email válido").isEmail(),
    check("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    check("career", "La carrera es obligatoria").not().isEmpty(),
    check("semester", "El ciclo académico es obligatorio").isInt({ min: 1, max: 10 }),
  ],
  authController.register,
)

// Ruta para login
router.post(
  "/login",
  [
    check("email", "Por favor incluye un email válido").isEmail(),
    check("password", "La contraseña es obligatoria").exists(),
  ],
  authController.login,
)

// Ruta para obtener usuario actual
router.get("/me", authMiddleware.protect, authController.getMe)

module.exports = router
