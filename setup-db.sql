-- ═══════════════════════════════════════════════════════════
-- SmartTask Tracker — Инициализация базы данных
-- ═══════════════════════════════════════════════════════════
-- Скопируйте ВСЕЭТ строчки и вставьте в Supabase SQL Editor
-- Нажмите "Run"

-- Удаляем старые таблицы если есть
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS focus_sessions CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Таблица пользователей
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица задач
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'PLANNED',
  due_date TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  color TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Таблица подзадач
CREATE TABLE subtasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица фокус-сессий
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица ежедневных отчётов
CREATE TABLE daily_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  focus_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_dueDate ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id, created_at);
CREATE INDEX idx_daily_reports_user ON daily_reports(user_id, date);
