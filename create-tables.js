require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createTables() {
  // Получаем URL и ключ из .env.local
  const supabaseUrl = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL;
  const supabaseKey = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Ошибка: Не найдены переменные окружения');
    console.error('NEXT_PUBLIC_STORAGE_SUPABASE_URL:', !!supabaseUrl);
    console.error('STORAGE_SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    process.exit(1);
  }

  console.log('🔌 Подключение к Supabase...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      avatar TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'MEDIUM',
      status TEXT DEFAULT 'PLANNED',
      due_date TIMESTAMP,
      tags TEXT[] DEFAULT '{}',
      color TEXT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      duration INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      started_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS daily_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      tasks_created INTEGER DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      focus_minutes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_dueDate ON tasks(user_id, due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority);
    CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_daily_reports_user ON daily_reports(user_id, date);
  `;

  console.log('📝 Создание таблиц...');

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('❌ Ошибка SQL:', error);
    console.log('⚠️  Попробуйте выполнить SQL вручную в Supabase Dashboard → SQL Editor');
    process.exit(1);
  }

  console.log('✅ Все таблицы созданы успешно!');
}

createTables().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
