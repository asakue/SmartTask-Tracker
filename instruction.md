# SmartTask Tracker — Инструкция по запуску и деплою

## 📋 Содержание
1. [Локальный запуск](#локальный-запуск)
2. [Деплой на Vercel](#деплой-на-vercel)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Структура проекта](#структура-проекта)
5. [API Endpoints](#api-endpoints)
6. [Диагностика проблем](#диагностика-проблем)

---

## Локальный запуск

### Требования
- **Node.js** 18+ (рекомендуется 20+ LTS)
- **PostgreSQL** 14+ (локально или удалённо)
- **npm** или **yarn**

### Шаг 1: Клонирование и установка

```bash
# Клонировать репозиторий
git clone <your-repo-url>
cd "SmartTask Tracker"

# Установить зависимости
npm install
```

### Шаг 2: Настройка базы данных

#### Вариант A: Локальная PostgreSQL

1. Установите PostgreSQL (если не установлен):
   - Windows: https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. Создайте базу данных:
```sql
CREATE DATABASE smarttask;
CREATE USER smarttask_user WITH PASSWORD 'smarttask_password';
GRANT ALL PRIVILEGES ON DATABASE smarttask TO smarttask_user;
```

3. Обновите `.env`:
```env
DATABASE_URL="postgresql://smarttask_user:smarttask_password@localhost:5432/smarttask"
```

#### Вариант B: Удалённая PostgreSQL (Supabase, Railway, Neon)

1. Создайте базу данных на платформе:
   - **Supabase**: https://supabase.com (бесплатно)
   - **Railway**: https://railway.app (бесплатно)
   - **Neon**: https://neon.tech (бесплатно)

2. Скопируйте connection string и вставьте в `.env`:
```env
DATABASE_URL="postgresql://user:password@host.db.supabase.co:5432/postgres"
```

### Шаг 3: Настройка Prisma

```bash
# Сгенерировать клиент Prisma
npx prisma generate

# Применить миграции к базе данных
npx prisma db push
```

### Шаг 4: Запуск приложения

```bash
# Запустить development сервер
npm run dev
```

Откройте http://localhost:3000 в браузере.

### Шаг 5: Проверка работы

1. Перейдите на http://localhost:3000
2. Зарегистрируйте нового пользователя
3. Войдите в систему
4. Создайте несколько задач с разными приоритетами
5. Проверьте раздел "Аналитика"
6. Проверьте Pomodoro таймер

---

## Деплой на Vercel

### Почему Vercel?
- Бесплатный тариф для личных проектов
- Автоматический деплой из Git
- Поддержка Next.js из коробки
- Встроенные environment variables
- Автоматические HTTPS сертификаты

### Шаг 1: Подготовка проекта

1. **Убедитесь, что все файлы на месте:**
```
├── .env.example
├── next.config.mjs
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
├── tailwind.config.ts
└── tsconfig.json
```

2. **Создайте репозиторий на GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

3. **Добавьте `.vercelignore` (опционально):**
```
node_modules
.env.local
*.db
prisma/dev.db
```

### Шаг 2: Настройка PostgreSQL на Vercel

#### Способ 1: Vercel Postgres (рекомендуется)

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в Vercel:
```bash
vercel login
```

3. Создайте Postgres базу данных:
```bash
vercel db create smarttask --type postgres
```

4. Подключите базу данных к проекту:
```bash
vercel env add DATABASE_URL
# Вставьте connection string из Vercel Dashboard
```

#### Способ 2: Внешний PostgreSQL

1. Создайте базу данных на Supabase/Railway/Neon
2. Скопируйте connection string
3. Добавьте в Vercel через Dashboard или CLI:
```bash
vercel env add DATABASE_URL "postgresql://user:password@host:5432/db"
```

### Шаг 3: Настройка Environment Variables

В Vercel Dashboard → Settings → Environment Variables добавьте:

| Variable | Значение | Environment |
|----------|----------|-------------|
| `DATABASE_URL` | Connection string к PostgreSQL | Production, Preview, Development |
| `JWT_SECRET` | Случайная строка (минимум 32 символа) | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `7d` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | URL вашего проекта (например, `https://smarttask.vercel.app`) | Production, Preview, Development |

**Генерация JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Шаг 4: Деплой

#### Через Git (рекомендуется)

1. Push в main branch:
```bash
git push origin main
```

2. Vercel автоматически обнаружит репозиторий и запустит деплой.

3. После деплоя выполните Prisma миграции:
```bash
vercel db exec --db smarttask < prisma/schema.prisma
# Или через Dashboard: Database → SQL → выполнить schema.prisma
```

#### Через CLI

```bash
# Деплоить проект
vercel

# Для production
vercel --prod
```

### Шаг 5: Настройка домена (опционально)

1. В Vercel Dashboard → Settings → Domains
2. Добавьте свой домен
3. Настройте DNS записи

---

## Настройка базы данных

### Схема базы данных

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          String    @default("USER")
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tasks         Task[]
  focusSessions FocusSession[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String    @default("")
  priority    Priority  @default(MEDIUM)
  status      Status    @default(PLANNED)
  dueDate     DateTime?
  tags        String[]  @default([])
  color       String?
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?

  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  subtasks Subtask[]
  sessions FocusSession[]
}

model Subtask {
  id          String   @id @default(cuid())
  title       String
  completed   Boolean  @default(false)
  taskId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model FocusSession {
  id          String   @id @default(cuid())
  duration    Int
  completed   Boolean  @default(false)
  taskId      String?
  userId      String
  startedAt   DateTime @default(now())
  createdAt   DateTime @default(now())

  task    Task?    @relation(fields: [taskId], references: [id], onDelete: SetNull)
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Приоритеты и статусы

**Приоритеты (Priority):**
- `LOW` — Низкий
- `MEDIUM` — Средний
- `HIGH` — Высокий

**Статусы (Status):**
- `PLANNED` — В планах
- `IN_PROGRESS` — В процессе
- `COMPLETED` — Выполнено

---

## Структура проекта

```
SmartTask Tracker/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── src/
│   ├── app/
│   │   ├── api/               # API Routes (бэкенд)
│   │   │   ├── auth/          # Регистрация, вход, профиль
│   │   │   ├── tasks/         # CRUD задач
│   │   │   ├── analytics/     # Аналитика
│   │   │   └── focus/         # Pomodoro сессии
│   │   ├── dashboard/         # Защищённые страницы
│   │   │   ├── tasks/         # Список задач
│   │   │   ├── calendar/      # Календарь
│   │   │   ├── analytics/     # Аналитика и отчёты
│   │   │   └── focal/         # Pomodoro таймер
│   │   ├── login/             # Страница входа/регистрации
│   │   ├── globals.css        # Глобальные стили
│   │   └── layout.tsx         # Корневой layout
│   ├── components/
│   │   ├── auth/              # Формы входа/регистрации
│   │   ├── dashboard/         # Layout дашборда
│   │   ├── tasks/             # Компоненты задач
│   │   └── ui/                # Базовые UI компоненты
│   ├── lib/
│   │   ├── prisma.ts          # Prisma клиент
│   │   ├── jwt.ts             # JWT утилиты
│   │   ├── bcrypt.ts          # Хеширование паролей
│   │   ├── middleware.ts      # Auth middleware
│   │   ├── api.ts             # Утилиты для API запросов
│   │   └── utils.ts           # Утилиты
│   ├── store/
│   │   ├── auth-store.ts      # Стейт авторизации
│   │   ├── tasks-store.ts     # Стейт задач
│   │   └── pomodoro-store.ts  # Стейт Pomodoro
│   └── types/
│       └── index.ts           # TypeScript типы
├── .env.example               # Пример environment переменных
├── next.config.mjs            # Конфиг Next.js
├── tailwind.config.ts         # Конфиг Tailwind CSS
├── tsconfig.json              # Конфиг TypeScript
└── package.json
```

---

## API Endpoints

### Аутентификация
| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/auth/register` | Регистрация нового пользователя |
| POST | `/api/auth/login` | Вход в систему |
| GET | `/api/auth/me` | Получить профиль текущего пользователя |
| POST | `/api/auth/logout` | Выход из системы |

### Задачи
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/tasks` | Получить все задачи (с фильтрами) |
| POST | `/api/tasks` | Создать новую задачу |
| GET | `/api/tasks/:id` | Получить одну задачу |
| PUT | `/api/tasks/:id` | Обновить задачу |
| DELETE | `/api/tasks/:id` | Удалить задачу |

### Аналитика
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/analytics` | Получить детальную аналитику |

### Фокус-сессии
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/focus` | Получить фокус-сессии |
| POST | `/api/focus` | Создать фокус-сессию |
| PUT | `/api/focus/:id` | Обновить сессию |
| DELETE | `/api/focus/:id` | Удалить сессию |

> **Важно:** Все endpoints кроме регистрации и входа требуют JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Диагностика проблем

### Ошибка: "ECONNREFUSED" при подключении к базе данных

**Причина:** База данных не запущена или неверные credentials.

**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Убедитесь, что DATABASE_URL правильный
3. Проверьте firewall

### Ошибка: "Prisma client not generated"

**Решение:**
```bash
npx prisma generate
```

### Ошибка: "Internal Server Error" на страницах

**Причины:**
1. Не применены миграции базы данных
2. Отсутствуют environment variables
3. Ошибка в коде

**Решение:**
```bash
# Применить миграции
npx prisma db push

# Проверить logs
npm run dev
```

### Ошибка: "CORS error" при запросах к API

**Решение:** Убедитесь, что фронтенд и бэкенд на одном домене (Next.js API Routes не требуют CORS).

### Ошибка: "JWT token invalid"

**Решение:**
1. Проверьте, что JWT_SECRET совпадает в .env и Vercel
2. Перезапустите сервер
3. Войдите заново

### Ошибка: "Module not found" при билде

**Решение:**
```bash
# Очистить кэш
rm -rf .next node_modules

# Переустановить зависимости
npm install

# Сгенерировать Prisma client
npx prisma generate
```

### Проблема: Страница не загружается

**Решение:**
1. Проверьте, что сервер запущен: `npm run dev`
2. Проверьте порт: http://localhost:3000
3. Посмотрите логи в терминале
4. Проверьте .env файл

---

## Дополнительные команды

```bash
# Запуск development сервера
npm run dev

# Production build
npm run build

# Запуск production сервера
npm run start

# Открыть Prisma Studio (GUI для базы данных)
npx prisma studio

# Сбросить базу данных (ОСТОРОЖНО!)
npx prisma db push --force

# Создать миграцию (для продакшена)
npx prisma migrate dev --name init
```

---

## Поддержка

Если возникли проблемы:
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@example.com

---

**Версия:** 1.0.0  
**Последнее обновление:** Август 2024
