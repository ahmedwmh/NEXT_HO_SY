const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Arabic first names
const arabicFirstNames = [
  'أحمد', 'محمد', 'علي', 'حسن', 'حسين', 'عمر', 'خالد', 'يوسف', 'إبراهيم', 'عبدالله',
  'عبدالرحمن', 'عبدالعزيز', 'عبدالوهاب', 'عبدالرحيم', 'عبدالمحسن', 'عبدالمنعم',
  'عبدالهادي', 'عبداللطيف', 'عبدالستار', 'عبدالرحمن', 'نور الدين', 'زين العابدين',
  'طاهر', 'سعد', 'فاضل', 'كاظم', 'محمود', 'جعفر', 'عبدالوهاب', 'عبدالرحيم'
];

// Arabic last names
const arabicLastNames = [
  'المحمود', 'الحسن', 'الرشيد', 'البغدادي', 'البصري', 'الموصلي', 'الكردي',
  'الجعفري', 'الحسيني', 'الطوسي', 'الرازي', 'الخوارزمي', 'العباسي', 'النجفي',
  'الطبري', 'الطبرسي', 'السيوطي', 'الغزالي', 'ابن سينا', 'ابن خلدون', 'الفراهيدي',
  'الخليل', 'الأنباري', 'الشيرازي', 'الرومي', 'الكربلائي', 'الموصلي', 'الحسني',
  'البصري', 'الطوسي', 'النجفي', 'الجعفري', 'الحسيني', 'الطبرسي', 'السيوطي'
];

// Medical specializations in Arabic
const specializations = [
  'أمراض القلب', 'جراحة عامة', 'طب الأطفال', 'النساء والولادة', 'العظام',
  'العيون', 'الأذن والأنف والحنجرة', 'الجلدية', 'الأعصاب', 'الطب النفسي',
  'الطب الباطني', 'الطوارئ', 'التخدير', 'الأشعة', 'الطب النووي',
  'الطب الرياضي', 'الطب المهني', 'الطب الشرعي', 'الطب الوقائي', 'الطب التجميلي'
];

// Hospital names (we'll get these from the database)
let hospitals = [];

async function main() {
  console.log('🏥 Starting English Doctor Seeding...\n');

  try {
    // Get all hospitals from database
    hospitals = await prisma.hospital.findMany({
      include: { city: true }
    });

    if (hospitals.length === 0) {
      console.log('❌ No hospitals found. Please run the main seed script first.');
      return;
    }

    console.log(`📋 Found ${hospitals.length} hospitals`);

    // Create English doctor accounts
    console.log('\n👨‍⚕️ Creating English Doctor Accounts...');
    const doctors = [];
    let doctorCounter = 1;

    for (const hospital of hospitals) {
      // Create 3-5 doctors per hospital
      const doctorCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 1; i <= doctorCount; i++) {
        try {
          const firstName = arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)];
          const lastName = arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];
          const specialization = specializations[Math.floor(Math.random() * specializations.length)];
          
          // Create simple English email with unique counter
          const email = `doctor${doctorCounter}@gmail.com`;
          doctorCounter++;
          
          // Create user account
          const doctorUser = await prisma.user.create({
            data: {
              email: email,
              password: 'doctor123',
              role: 'DOCTOR',
            },
          });

          // Create doctor profile
          const doctor = await prisma.doctor.create({
            data: {
              userId: doctorUser.id,
              hospitalId: hospital.id,
              firstName: firstName,
              lastName: lastName,
              specialization: specialization,
              phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              licenseNumber: `MD-${Math.floor(Math.random() * 900000) + 100000}`,
            },
          });
          
          doctors.push(doctor);
          console.log(`✅ Created: ${firstName} ${lastName} - ${specialization} (${email})`);
        } catch (error) {
          console.error(`❌ Error creating doctor for ${hospital.name}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Successfully created ${doctors.length} English doctor accounts!`);
    
    // Display login credentials
    console.log('\n🔑 Login Credentials:');
    console.log('Email format: doctor[number]@[hospital].com');
    console.log('Password: doctor123');
    console.log('\nExample accounts:');
    
    // Show first 5 doctor accounts as examples
    const exampleDoctors = doctors.slice(0, 5);
    for (const doctor of exampleDoctors) {
      const user = await prisma.user.findUnique({
        where: { id: doctor.userId }
      });
      const hospital = await prisma.hospital.findUnique({
        where: { id: doctor.hospitalId }
      });
      console.log(`- ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Hospital: ${hospital.name}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
