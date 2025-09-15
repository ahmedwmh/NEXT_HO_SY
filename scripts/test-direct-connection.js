const { PrismaClient } = require('@prisma/client')

async function testDirectConnection() {
  console.log('🔍 Testing direct database connection...')
  
  // Test with environment variables from .env
  const prisma = new PrismaClient({
    log: ['error'],
  })

  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Direct database connection successful!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ User count: ${userCount}`)
    
    // Test cities
    const cityCount = await prisma.city.count()
    console.log(`✅ City count: ${cityCount}`)
    
    // Test hospitals
    const hospitalCount = await prisma.hospital.count()
    console.log(`✅ Hospital count: ${hospitalCount}`)
    
    // Test patients
    const patientCount = await prisma.patient.count()
    console.log(`✅ Patient count: ${patientCount}`)
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Direct database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectConnection()
