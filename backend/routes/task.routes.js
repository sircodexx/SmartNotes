const express = require("express")
const { check } = require("express-validator")
const taskController = require("../controllers/task.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware.protect)

// Obtener todas las tareas
router.get("/", taskController.getTasks)

// Obtener una tarea específica
router.get("/:id", taskController.getTask)

// Crear una nueva tarea
router.post(
  "/",
  [
    check("title", "El título es obligatorio").not().isEmpty(),
    check("due_date", "La fecha límite es obligatoria").not().isEmpty(),
    check("priority", "La prioridad debe ser low, medium, high o urgent").isIn(["low", "medium", "high", "urgent"]),
    check("category", "La categoría es obligatoria").not().isEmpty(),
    check("estimated_time", "El tiempo estimado debe ser un número positivo").isInt({ min: 1 }),
  ],
  taskController.createTask,
)

// Actualizar una tarea
router.put("/:id", taskController.updateTask)

// Eliminar una tarea
router.delete("/:id", taskController.deleteTask)

module.exports = router
