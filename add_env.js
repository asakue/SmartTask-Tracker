const https = require('https');
const { execSync } = require('child_process');

// Получаем токен авторизации
const token = execSync('vercel auth token').toString().trim();

// Данные для добавления
const vars = [
  {
    name: 'DATABASE_URL',
    value: execSync('vercel env ls --json').toString(), // Заглушка - нужно вручную
    target: 'production',
    type: 'secret',
    gitBranch: null
  },
  {
    name: 'JWT_SECRET',
    value: 'ad43ae5a42af583214f2406d3d9f0ed9875400288fa23eb540ac433740a0d03ad697143d67bff619bcf2774f46eba732e7f3560898b085f94c7aba0083461ca5',
    target: 'production',
    type: 'secret',
    gitBranch: null
  }
];

console.log('Для добавления переменных используйте Vercel Dashboard:');
console.log('https://vercel.com/asakues-projects/smarttask-tracker/settings/environment-variables');
