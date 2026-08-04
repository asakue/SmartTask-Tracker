import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
try {
  await p.$connect();
  console.log('DB CONNECTED');
} catch (e) {
  console.log('DB ERROR:', e.message);
} finally {
  await p.$disconnect();
}
