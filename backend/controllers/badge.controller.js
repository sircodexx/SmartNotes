const db = require("../config/database")

// Obtener todas las insignias
exports.getAllBadges = async (req, res, next) => {
  try {
    const [badges] = await db.query("SELECT * FROM badges")

    // Obtener las insignias que el usuario ya tiene
    const [userBadges] = await db.query("SELECT badge_id FROM user_badges WHERE user_id = ?", [req.user.id])

    const userBadgeIds = userBadges.map((badge) => badge.badge_id)

    // Agregar campo para indicar si el usuario tiene la insignia
    const badgesWithEarned = badges.map((badge) => ({
      ...badge,
      earned: userBadgeIds.includes(badge.id),
    }))

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badgesWithEarned,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener insignias del usuario
exports.getUserBadges = async (req, res, next) => {
  try {
    const [badges] = await db.query(
      `SELECT b.*, ub.earned_at 
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       WHERE ub.user_id = ?`,
      [req.user.id],
    )

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener progreso de insignias
exports.getBadgeProgress = async (req, res, next) => {
  try {
    // Obtener todas las insignias
    const [badges] = await db.query("SELECT * FROM badges")

    // Obtener las insignias que el usuario ya tiene
    const [userBadges] = await db.query("SELECT badge_id FROM user_badges WHERE user_id = ?", [req.user.id])

    const userBadgeIds = userBadges.map((badge) => badge.badge_id)

    // Obtener datos necesarios para calcular el progreso
    const [userData] = await db.query("SELECT level, points FROM users WHERE id = ?", [req.user.id])

    const [taskCounts] = await db.query(
      `SELECT 
        COUNT(*) as total_completed,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_completed,
        SUM(CASE WHEN actual_time <= estimated_time THEN 1 ELSE 0 END) as on_time_completed
       FROM tasks 
       WHERE user_id = ? AND status = 'completed'`,
      [req.user.id],
    )

    // Calcular racha actual
    const [streakResult] = await db.query(
      `WITH date_series AS (
        SELECT CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY AS date
        FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
        CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
        WHERE CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      )
      SELECT COUNT(*) as streak
      FROM (
        SELECT ds.date
        FROM date_series ds
        LEFT JOIN daily_stats st ON ds.date = st.date AND st.user_id = ?
        WHERE ds.date <= CURDATE()
        ORDER BY ds.date DESC
      ) AS dates
      WHERE dates.date IN (
        SELECT date FROM daily_stats WHERE user_id = ? AND tasks_completed > 0
      )
      LIMIT 30`,
      [req.user.id, req.user.id],
    )

    // Obtener conteo de tareas completadas antes de las 8 AM
    const [earlyTasks] = await db.query(
      `SELECT COUNT(*) as count 
       FROM tasks 
       WHERE user_id = ? AND status = 'completed' AND HOUR(updated_at) < 8`,
      [req.user.id],
    )

    // Calcular progreso para cada insignia
    const badgesWithProgress = badges.map((badge) => {
      let progress = 0
      let total = 1
      const earned = userBadgeIds.includes(badge.id)

      switch (badge.name) {
        case "Madrugador":
          progress = earlyTasks[0].count
          total = 5
          break
        case "Maestro de Tareas":
          progress = taskCounts[0].total_completed
          total = 50
          break
        case "Racha Perfecta":
          progress = streakResult[0].streak
          total = 7
          break
        case "Pro de Prioridades":
          progress = taskCounts[0].urgent_completed
          total = 20
          break
        case "Maestro del Tiempo":
          progress = taskCounts[0].on_time_completed
          total = 10
          break
        case "Académico":
          progress = userData[0].level
          total = 10
          break
      }

      return {
        ...badge,
        earned,
        progress,
        total,
      }
    })

    res.status(200).json({
      success: true,
      data: badgesWithProgress,
    })
  } catch (error) {
    next(error)
  }
}
