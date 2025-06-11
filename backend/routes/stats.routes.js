const express = require("express")
const statsController = require("../controllers/stats.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware.protect)

// Obtener estadísticas generales del usuario
router.get("/user", statsController.getUserStats)

// Obtener estadísticas de estudio
router.get("/study", statsController.getStudyStats)

module.exports = router
