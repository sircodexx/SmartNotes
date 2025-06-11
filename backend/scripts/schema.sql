-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS smartnotes_db;
USE smartnotes_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  career VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  level INT DEFAULT 1,
  points INT DEFAULT 0,
  bio TEXT,
  university VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL,
  status ENUM('pending', 'in-progress', 'completed') NOT NULL DEFAULT 'pending',
  category VARCHAR(50) NOT NULL,
  estimated_time INT NOT NULL,
  actual_time INT,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de insignias
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación usuario-insignia
CREATE TABLE IF NOT EXISTS user_badges (
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(36) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- Tabla de sesiones de estudio
CREATE TABLE IF NOT EXISTS study_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  task_id VARCHAR(36),
  duration INT NOT NULL,
  session_type ENUM('work', 'break') NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Tabla de estadísticas diarias
CREATE TABLE IF NOT EXISTS daily_stats (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  tasks_completed INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  study_time INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, date)
);

-- Tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id VARCHAR(36) PRIMARY KEY,
  theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'es',
  default_task_duration INT DEFAULT 25,
  working_hours_start TIME DEFAULT '08:00:00',
  working_hours_end TIME DEFAULT '18:00:00',
  task_reminders BOOLEAN DEFAULT TRUE,
  weekly_reports BOOLEAN DEFAULT TRUE,
  achievements_notifications BOOLEAN DEFAULT TRUE,
  deadline_alerts BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);
