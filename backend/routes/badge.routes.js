const express = require("express")
const badgeController = require("../controllers/badge.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware.protect)

// Obtener todas las insignias
router.get("/", badgeController.getAllBadges)

// Obtener insignias del usuario
router.get("/user", badgeController.getUserBadges)

// Obtener progreso de insignias
router.get("/progress", badgeController.getBadgeProgress)

module.exports = router
