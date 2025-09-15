const { PrismaClient } = require('@prisma/client');

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set' : 'Not set');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const cityCount = await prisma.city.count();
    console.log(`📊 Current cities in database: ${cityCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
