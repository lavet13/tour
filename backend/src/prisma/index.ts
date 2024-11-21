import { PrismaClient } from '@prisma/client';
import userExtension from '@/prisma/extensions/user.extensions';

const prisma = new PrismaClient({
  // ...(process.env.NODE_ENV === 'development' ? { log: ['query', 'info', 'warn', 'error'] } : {})
}).$extends(userExtension);

export default prisma;
