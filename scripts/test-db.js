const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  
  const prisma = new PrismaClient({
    log: ['error'],
  })

  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ User count: ${userCount}`)
    
    // Test cities
    const cityCount = await prisma.city.count()
    console.log(`✅ City count: ${cityCount}`)
    
    console.log('🎉 Database is working correctly!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Solution: Update your .env file:')
      console.log('DATABASE_URL="postgresql://postgres.vukuyczpheeelpickacs:dacvnn6fAEFxnfNL@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
