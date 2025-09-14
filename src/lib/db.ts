import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use the direct database URL to avoid connection pooling issues
const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL, // Use direct connection to avoid pooling issues
    },
  },
  log: ['error'],
  errorFormat: 'pretty',
})

export const prisma = globalForPrisma.prisma ?? prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

