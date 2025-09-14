const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Use transaction pooler for better performance
    },
  },
});

async function clearAllData() {
  console.log('🗑️  بدء مسح جميع البيانات من قاعدة البيانات...');

  try {
    // Delete in reverse order of dependencies
    console.log('🗑️  مسح المرفقات...');
    await prisma.attachment.deleteMany();
    
    console.log('🗑️  مسح الوصفات الطبية...');
    await prisma.prescription.deleteMany();
    
    console.log('🗑️  مسح العمليات...');
    await prisma.operation.deleteMany();
    
    console.log('🗑️  مسح العلاجات...');
    await prisma.treatment.deleteMany();
    
    console.log('🗑️  مسح الفحوصات...');
    await prisma.test.deleteMany();
    
    console.log('🗑️  مسح الأمراض...');
    await prisma.disease.deleteMany();
    
    console.log('🗑️  مسح الزيارات...');
    await prisma.visit.deleteMany();
    
    console.log('🗑️  مسح المرضى...');
    await prisma.patient.deleteMany();
    
    console.log('🗑️  مسح الموظفين...');
    await prisma.staff.deleteMany();
    
    console.log('🗑️  مسح الأطباء...');
    await prisma.doctor.deleteMany();
    
    console.log('🗑️  مسح المستشفيات...');
    await prisma.hospital.deleteMany();
    
    console.log('🗑️  مسح المدن...');
    await prisma.city.deleteMany();
    
    console.log('🗑️  مسح المستخدمين...');
    await prisma.user.deleteMany();

    console.log('✅ تم مسح جميع البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في مسح البيانات:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();
