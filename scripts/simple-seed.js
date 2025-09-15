
const { PrismaClient } = require('@prisma/client');

// Use Prisma client with environment variables from .env
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🏥 بدء إنشاء بيانات المستشفى...');
  
  try {
    // Test connection first
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');

    // Create a simple city
    const city = await prisma.city.upsert({
      where: { name: 'بغداد' },
      update: {},
      create: { name: 'بغداد' },
    });
    console.log('✅ تم إنشاء المدينة: بغداد');

    // Create a hospital
    const hospital = await prisma.hospital.upsert({
      where: { id: 'test-hospital' },
      update: {},
      create: {
        id: 'test-hospital',
        name: 'مستشفى بغداد التجريبي',
        address: 'شارع الرشيد، بغداد، العراق',
        phone: '+964-1-234-5678',
        email: 'test@baghdadhospital.iq',
        cityId: city.id,
      },
    });
    console.log('✅ تم إنشاء المستشفى: مستشفى بغداد التجريبي');

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        id: 'admin-user',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'ADMIN',
      },
    });
    console.log('✅ تم إنشاء مستخدم الإدارة');

    // Create a doctor
    const doctorUser = await prisma.user.create({
      data: {
        email: 'doctor@hospital.com',
        password: 'doctor123',
        role: 'DOCTOR',
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        hospitalId: hospital.id,
        firstName: 'د. أحمد',
        lastName: 'المحمود',
        specialization: 'أمراض القلب',
        phone: '+964-770-123-4567',
        licenseNumber: 'MD-123456',
      },
    });
    console.log('✅ تم إنشاء الطبيب: د. أحمد المحمود');

    // Create a patient
    const patient = await prisma.patient.create({
      data: {
        hospitalId: hospital.id,
        cityId: city.id,
        patientNumber: 'P001',
        firstName: 'محمد',
        lastName: 'الحسن',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'ذكر',
        phone: '+964-770-123-4567',
        email: 'mohammed.hassan@email.com',
        address: 'شارع الرشيد، بغداد، العراق',
        emergencyContact: '+964-770-123-4568',
        bloodType: 'A+',
        allergies: 'البنسلين',
        medicalHistory: 'لا يوجد تاريخ مرضي مهم',
      },
    });
    console.log('✅ تم إنشاء المريض: محمد الحسن');

    // Create a visit
    const visit = await prisma.visit.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        scheduledAt: new Date(),
        status: 'COMPLETED',
        notes: 'فحص دوري شامل',
        diagnosis: 'فحص طبيعي',
        symptoms: 'لا توجد أعراض',
        vitalSigns: 'ضغط الدم: 120/80، النبض: 72',
        temperature: '36.5°C',
        bloodPressure: '120/80',
        heartRate: '72',
        weight: '75kg',
        height: '175cm',
      },
    });
    console.log('✅ تم إنشاء الزيارة');

    // Create a test
    const test = await prisma.test.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        visitId: visit.id,
        name: 'فحص الدم الشامل',
        description: 'تحليل شامل لمكونات الدم',
        scheduledAt: new Date(),
        status: 'COMPLETED',
        results: 'نتائج طبيعية - جميع المؤشرات ضمن المعدل الطبيعي',
        notes: 'تم إجراء الفحص بنجاح',
      },
    });
    console.log('✅ تم إنشاء الفحص: فحص الدم الشامل');

    // Create a disease
    const disease = await prisma.disease.create({
      data: {
        patientId: patient.id,
        name: 'ارتفاع ضغط الدم',
        description: 'تم تشخيص ارتفاع ضغط الدم بناءً على الفحوصات',
        diagnosedAt: new Date(),
        severity: 'متوسط',
        status: 'نشط',
        notes: 'يحتاج متابعة دورية',
      },
    });
    console.log('✅ تم تشخيص المرض: ارتفاع ضغط الدم');

    // Create a treatment
    const treatment = await prisma.treatment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        visitId: visit.id,
        name: 'العلاج الدوائي',
        description: 'تناول الأدوية الموصوفة لعلاج ارتفاع ضغط الدم',
        scheduledAt: new Date(),
        status: 'COMPLETED',
        notes: 'علاج ارتفاع ضغط الدم باستخدام الأدوية',
      },
    });
    console.log('✅ تم إنشاء العلاج: العلاج الدوائي');

    // Create a prescription
    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        visitId: visit.id,
        medication: 'أملوديبين',
        dosage: '5mg',
        frequency: 'مرة يومياً',
        duration: '30 يوم',
        instructions: 'تناول مع الطعام',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        notes: 'وصفة طبية من د. أحمد المحمود',
      },
    });
    console.log('✅ تم إنشاء الوصفة: أملوديبين');

    console.log('\n🎉 تم إنشاء البيانات التجريبية بنجاح!');
    console.log('\n📊 الملخص:');
    console.log('- المدن: 1');
    console.log('- المستشفيات: 1');
    console.log('- الأطباء: 1');
    console.log('- المرضى: 1');
    console.log('- الزيارات: 1');
    console.log('- الفحوصات: 1');
    console.log('- الأمراض: 1');
    console.log('- العلاجات: 1');
    console.log('- الوصفات: 1');
    
    console.log('\n🔄 التدفق الطبي المُنشأ:');
    console.log('المريض محمد الحسن → زيارة → فحص الدم → تشخيص ارتفاع ضغط الدم → علاج دوائي → وصفة أملوديبين');
    
    console.log('\n🔑 بيانات الدخول:');
    console.log('- الإدارة: admin@hospital.com / admin123');
    console.log('- الطبيب: doctor@hospital.com / doctor123');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
