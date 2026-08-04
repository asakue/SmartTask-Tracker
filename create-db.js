require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createTables() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ Ошибка: DATABASE_URL не найден в .env.local');
    process.exit(1);
  }

  console.log('🔌 Подключение к Supabase...');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Подключено!');

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS tasks (
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
      )`,

      `CREATE TABLE IF NOT EXISTS subtasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS focus_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS daily_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        tasks_created INTEGER DEFAULT 0,
        tasks_completed INTEGER DEFAULT 0,
        focus_minutes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date)
      )`
    ];

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_user_dueDate ON tasks(user_id, due_date)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority)',
      'CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_daily_reports_user ON daily_reports(user_id, date)'
    ];

    console.log('📝 Создание таблиц...');
    
    for (const sql of tables) {
      await client.query(sql);
      console.log('  ✅ Таблица создана');
    }

    console.log('📝 Создание индексов...');
    
    for (const sql of indexes) {
      await client.query(sql);
    }

    console.log('\n✅ Все таблицы и индексы созданы успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
