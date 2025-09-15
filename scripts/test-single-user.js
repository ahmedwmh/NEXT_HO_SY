const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testSingleUser() {
  console.log('🔍 Testing database connection by creating a single user...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try to create a single admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'test@hospital.com' },
      update: {},
      create: {
        id: 'test-admin-user',
        email: 'test@hospital.com',
        password: 'test123',
        role: 'ADMIN',
      },
    });
    
    console.log('✅ User created successfully!');
    console.log('User details:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Test reading the user
    const foundUser = await prisma.user.findUnique({
      where: { email: 'test@hospital.com' }
    });
    
    console.log('✅ User read successfully!');
    console.log('Found user:', foundUser);
    
    // Clean up - delete the test user
    await prisma.user.delete({
      where: { id: 'test-admin-user' }
    });
    
    console.log('✅ Test user cleaned up successfully!');
    console.log('🎉 Database connection and operations are working perfectly!');
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSingleUser();
