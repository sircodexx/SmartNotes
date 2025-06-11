const db = require("../config/database")

// Obtener estadísticas generales del usuario
exports.getUserStats = async (req, res, next) => {
  try {
    // Obtener conteo de tareas
    const [taskStats] = await db.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
       FROM tasks 
       WHERE user_id = ?`,
      [req.user.id],
    )

    // Calcular tasa de finalización
    const completionRate =
      taskStats[0].total_tasks > 0 ? Math.round((taskStats[0].completed_tasks / taskStats[0].total_tasks) * 100) : 0

    // Obtener estadísticas por categoría
    const [categoryStats] = await db.query(
      `SELECT 
        category,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM tasks 
       WHERE user_id = ?
       GROUP BY category`,
      [req.user.id],
    )

    // Obtener estadísticas de los últimos 7 días
    const [weeklyStats] = await db.query(
      `SELECT 
        date,
        tasks_completed,
        points_earned,
        study_time
       FROM daily_stats 
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY date ASC`,
      [req.user.id],
    )

    // Calcular racha actual
    const [streakResult] = await db.query(
      `WITH date_series AS (
        SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY AS date
        FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
        CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
        CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS c
        WHERE CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
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

    const currentStreak = streakResult[0].streak || 0

    // Obtener insignias del usuario
    const [badges] = await db.query(`SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?`, [req.user.id])

    res.status(200).json({
      success: true,
      data: {
        totalTasks: taskStats[0].total_tasks,
        completedTasks: taskStats[0].completed_tasks,
        inProgressTasks: taskStats[0].in_progress_tasks,
        pendingTasks: taskStats[0].pending_tasks,
        completionRate,
        totalPoints: req.user.points,
        currentStreak,
        badges: badges[0].count,
        categoryStats,
        weeklyStats,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Obtener estadísticas de estudio
exports.getStudyStats = async (req, res, next) => {
  try {
    // Obtener sesiones de estudio
    const [sessions] = await db.query(
      `SELECT * FROM study_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 50`,
      [req.user.id],
    )

    // Calcular tiempo total de estudio
    const [totalTime] = await db.query(
      `SELECT SUM(duration) as total FROM study_sessions WHERE user_id = ? AND session_type = 'work'`,
      [req.user.id],
    )

    // Calcular tiempo promedio por sesión
    const [avgTime] = await db.query(
      `SELECT AVG(duration) as average FROM study_sessions WHERE user_id = ? AND session_type = 'work'`,
      [req.user.id],
    )

    // Obtener estadísticas por día de la semana
    const [dayStats] = await db.query(
      `SELECT 
        DAYOFWEEK(started_at) as day_of_week,
        SUM(duration) as total_time,
        COUNT(*) as session_count
       FROM study_sessions 
       WHERE user_id = ? AND session_type = 'work'
       GROUP BY DAYOFWEEK(started_at)
       ORDER BY DAYOFWEEK(started_at)`,
      [req.user.id],
    )

    res.status(200).json({
      success: true,
      data: {
        sessions,
        totalStudyTime: totalTime[0].total || 0,
        averageSessionTime: avgTime[0].average || 0,
        dayStats,
      },
    })
  } catch (error) {
    next(error)
  }
}
