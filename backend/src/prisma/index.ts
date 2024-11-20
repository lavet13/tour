import { PrismaClient } from '@prisma/client';
import userExtension from '@/prisma/extensions/user.extensions';

const prisma = new PrismaClient({
  ...(import.meta.env.DEV ? { log: ['query', 'info', 'warn', 'error'] } : {})
}).$extends(userExtension);

export default prisma;
