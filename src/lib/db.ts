import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with Supabase configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })
}

const prismaClient = globalForPrisma.prisma ?? createPrismaClient()

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

