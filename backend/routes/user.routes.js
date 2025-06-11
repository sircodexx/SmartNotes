const express = require("express")
const { check } = require("express-validator")
const userController = require("../controllers/user.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware.protect)

// Obtener perfil del usuario
router.get("/profile", userController.getProfile)

// Actualizar perfil del usuario
router.put(
  "/profile",
  [
    check("name", "El nombre no puede estar vacío").optional().not().isEmpty(),
    check("career", "La carrera no puede estar vacía").optional().not().isEmpty(),
    check("semester", "El ciclo debe ser un número entre 1 y 10").optional().isInt({ min: 1, max: 10 }),
  ],
  userController.updateProfile,
)

// Actualizar contraseña
router.put(
  "/password",
  [
    check("currentPassword", "La contraseña actual es obligatoria").not().isEmpty(),
    check("newPassword", "La nueva contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
  ],
  userController.updatePassword,
)

// Actualizar preferencias
router.put("/preferences", userController.updatePreferences)

module.exports = router
