const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Iraqi cities
const iraqiCities = [
  'بغداد', 'البصرة', 'الموصل', 'أربيل', 'السليمانية', 'دهوك', 'كركوك', 'الأنبار', 
  'النجف', 'كربلاء', 'بابل', 'واسط', 'ديالى', 'ميسان', 'المثنى', 'القادسية', 'ذي قار', 'صلاح الدين'
];

// Medical specializations
const specializations = [
  'أمراض القلب', 'أمراض الأعصاب', 'العظام', 'طب الأطفال', 'أمراض النساء', 
  'الأمراض الجلدية', 'أمراض العيون', 'أنف وأذن وحنجرة', 'الجراحة العامة', 
  'الطب الباطني', 'الطوارئ', 'التخدير', 'الأشعة', 'الطب الشرعي', 'الطب النفسي'
];

// Staff positions
const staffPositions = [
  'ممرض', 'فني مختبر', 'فني أشعة', 'صيدلي', 'موظف إداري', 
  'موظف استقبال', 'حارس أمن', 'فني صيانة', 'دعم تقني', 'محاسب'
];

// Test types
const testTypes = [
  { name: 'فحص الدم الشامل', description: 'تحليل شامل لمكونات الدم' },
  { name: 'فحص السكر', description: 'قياس مستوى السكر في الدم' },
  { name: 'فحص الكوليسترول', description: 'قياس مستوى الكوليسترول' },
  { name: 'فحص وظائف الكبد', description: 'تقييم وظائف الكبد' },
  { name: 'فحص وظائف الكلى', description: 'تقييم وظائف الكلى' },
  { name: 'تخطيط القلب', description: 'فحص كهربائية القلب' },
  { name: 'الأشعة السينية', description: 'فحص بالأشعة السينية' },
  { name: 'الموجات فوق الصوتية', description: 'فحص بالموجات فوق الصوتية' },
  { name: 'الرنين المغناطيسي', description: 'فحص بالرنين المغناطيسي' },
  { name: 'المنظار', description: 'فحص بالمنظار الطبي' }
];

// Common diseases
const diseases = [
  { name: 'ارتفاع ضغط الدم', severity: 'متوسط', status: 'مزمن' },
  { name: 'داء السكري', severity: 'متوسط', status: 'مزمن' },
  { name: 'أمراض القلب', severity: 'عالي', status: 'نشط' },
  { name: 'التهاب المفاصل', severity: 'متوسط', status: 'مزمن' },
  { name: 'الربو', severity: 'منخفض', status: 'نشط' },
  { name: 'الالتهاب الرئوي', severity: 'عالي', status: 'نشط' },
  { name: 'التهاب المعدة', severity: 'منخفض', status: 'نشط' },
  { name: 'الصداع النصفي', severity: 'متوسط', status: 'نشط' },
  { name: 'الاكتئاب', severity: 'متوسط', status: 'نشط' },
  { name: 'القلق', severity: 'منخفض', status: 'نشط' }
];

// Treatment types
const treatments = [
  { name: 'العلاج الدوائي', description: 'تناول الأدوية الموصوفة' },
  { name: 'العلاج الطبيعي', description: 'تمارين وعلاج طبيعي' },
  { name: 'العلاج النفسي', description: 'جلسات علاج نفسي' },
  { name: 'العلاج بالليزر', description: 'علاج باستخدام الليزر' },
  { name: 'العلاج الكيميائي', description: 'علاج كيميائي للسرطان' },
  { name: 'العلاج الإشعاعي', description: 'علاج إشعاعي' },
  { name: 'العلاج بالحرارة', description: 'علاج بالحرارة' },
  { name: 'العلاج بالبرودة', description: 'علاج بالبرودة' }
];

// Operation types
const operations = [
  { name: 'جراحة القلب المفتوح', description: 'عملية جراحية على القلب' },
  { name: 'جراحة الأوعية الدموية', description: 'عملية على الأوعية الدموية' },
  { name: 'جراحة العظام', description: 'عملية جراحية على العظام' },
  { name: 'جراحة المخ والأعصاب', description: 'عملية جراحية على المخ' },
  { name: 'جراحة العيون', description: 'عملية جراحية على العيون' },
  { name: 'جراحة الأنف والأذن', description: 'عملية جراحية على الأنف والأذن' },
  { name: 'جراحة البطن', description: 'عملية جراحية على البطن' },
  { name: 'جراحة الصدر', description: 'عملية جراحية على الصدر' }
];

// Medications
const medications = [
  { name: 'أسبرين', dosage: '100mg', frequency: 'مرة يومياً' },
  { name: 'باراسيتامول', dosage: '500mg', frequency: '3 مرات يومياً' },
  { name: 'أوميبرازول', dosage: '20mg', frequency: 'مرة يومياً' },
  { name: 'ميتفورمين', dosage: '500mg', frequency: 'مرتين يومياً' },
  { name: 'أملوديبين', dosage: '5mg', frequency: 'مرة يومياً' },
  { name: 'أتورفاستاتين', dosage: '20mg', frequency: 'مرة يومياً' },
  { name: 'لوسارتان', dosage: '50mg', frequency: 'مرة يومياً' },
  { name: 'سيتالوبرام', dosage: '20mg', frequency: 'مرة يومياً' }
];

async function main() {
  console.log('🏥 بدء إنشاء نظام إدارة المستشفى الشامل...');
  
  try {
    // 1. Create cities
    console.log('\n🏙️ إنشاء المدن العراقية...');
    const cities = [];
    for (const cityName of iraqiCities) {
      const city = await prisma.city.upsert({
        where: { name: cityName },
        update: {},
        create: { name: cityName },
      });
      cities.push(city);
      console.log(`✅ تم إنشاء المدينة: ${cityName}`);
    }

    // 2. Create hospitals
    console.log('\n🏥 إنشاء المستشفيات...');
    const hospitals = [];
    const majorCities = ['بغداد', 'البصرة', 'الموصل', 'أربيل'];
    
    for (const cityName of majorCities) {
      const city = cities.find(c => c.name === cityName);
      if (city) {
        for (let i = 1; i <= 2; i++) {
          const hospital = await prisma.hospital.upsert({
            where: { id: `hospital-${city.id}-${i}` },
            update: {},
            create: {
              id: `hospital-${city.id}-${i}`,
              name: `مستشفى ${cityName} الطبي ${i > 1 ? i : ''}`.trim(),
              address: `المنطقة الطبية ${i}, ${cityName}, العراق`,
              phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              email: `info@${cityName.replace(' ', '')}hospital${i > 1 ? i : ''}.iq`,
              cityId: city.id,
            },
          });
          hospitals.push(hospital);
          console.log(`✅ تم إنشاء المستشفى: ${hospital.name}`);
        }
      }
    }

    // 3. Create admin user
    console.log('\n👤 إنشاء مستخدم الإدارة...');
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

    // 4. Create doctors
    console.log('\n👨‍⚕️ إنشاء الأطباء...');
    const doctors = [];
    for (const hospital of hospitals) {
      for (let i = 1; i <= 3; i++) {
        const specialization = specializations[Math.floor(Math.random() * specializations.length)];
        const firstName = `د. ${['أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد'][Math.floor(Math.random() * 6)]}`;
        const lastName = ['المحمود', 'الحسن', 'الرشيد', 'البغدادي'][Math.floor(Math.random() * 4)];
        
        const doctorUser = await prisma.user.create({
          data: {
            email: `doctor${i}@${hospital.name.toLowerCase().replace(/\s+/g, '')}.iq`,
            password: 'doctor123',
            role: 'DOCTOR',
          },
        });

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
        console.log(`✅ تم إنشاء الطبيب: ${firstName} ${lastName} - ${specialization}`);
      }
    }

    // 5. Create staff
    console.log('\n👥 إنشاء الموظفين...');
    for (const hospital of hospitals) {
      for (let i = 1; i <= 3; i++) {
        const position = staffPositions[Math.floor(Math.random() * staffPositions.length)];
        const firstName = ['فاطمة', 'عائشة', 'زينب', 'مريم'][Math.floor(Math.random() * 4)];
        const lastName = ['المحمود', 'الحسن', 'الرشيد', 'البغدادي'][Math.floor(Math.random() * 4)];
        
        const staffUser = await prisma.user.create({
          data: {
            email: `staff${i}@${hospital.name.toLowerCase().replace(/\s+/g, '')}.iq`,
            password: 'staff123',
            role: 'STAFF',
          },
        });

        await prisma.staff.create({
          data: {
            userId: staffUser.id,
            hospitalId: hospital.id,
            firstName: firstName,
            lastName: lastName,
            position: position,
            phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          },
        });
        
        console.log(`✅ تم إنشاء الموظف: ${firstName} ${lastName} - ${position}`);
      }
    }

    // 6. Create patients with complete medical flow
    console.log('\n👤 إنشاء المرضى مع التدفق الطبي الكامل...');
    const patients = [];
    
    for (const hospital of hospitals) {
      for (let i = 1; i <= 5; i++) {
        const firstName = ['أحمد', 'محمد', 'علي', 'فاطمة', 'عائشة'][Math.floor(Math.random() * 5)];
        const lastName = ['المحمود', 'الحسن', 'الرشيد', 'البغدادي'][Math.floor(Math.random() * 4)];
        const gender = Math.random() > 0.5 ? 'ذكر' : 'أنثى';
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
        
        // Generate random birth date (18-80 years old)
        const birthYear = new Date().getFullYear() - Math.floor(Math.random() * 62) - 18;
        const birthMonth = Math.floor(Math.random() * 12);
        const birthDay = Math.floor(Math.random() * 28) + 1;
        
        const patient = await prisma.patient.create({
          data: {
            hospitalId: hospital.id,
            cityId: hospital.cityId,
            patientNumber: `P${hospital.id.slice(-4)}${String(i).padStart(3, '0')}`,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: new Date(birthYear, birthMonth, birthDay),
            gender: gender,
            phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
            address: `المنطقة ${Math.floor(Math.random() * 10) + 1}, ${hospital.name.split(' ')[1]}, العراق`,
            emergencyContact: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            bloodType: bloodType,
            allergies: Math.random() > 0.7 ? 'البنسلين' : null,
            medicalHistory: Math.random() > 0.5 ? 'حالات طبية سابقة' : null,
          },
        });
        
        patients.push(patient);
        console.log(`✅ تم إنشاء المريض: ${firstName} ${lastName}`);

        // 7. Create visits for each patient
        console.log(`   📅 إنشاء الزيارات للمريض ${firstName} ${lastName}...`);
        const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
        const randomDoctor = hospitalDoctors[Math.floor(Math.random() * hospitalDoctors.length)];
        
        if (randomDoctor) {
          // Create 2-4 visits per patient
          const visitCount = Math.floor(Math.random() * 3) + 2;
          
          for (let v = 1; v <= visitCount; v++) {
            const visitDate = new Date();
            visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
            
            const visit = await prisma.visit.create({
              data: {
                patientId: patient.id,
                doctorId: randomDoctor.id,
                hospitalId: hospital.id,
                scheduledAt: visitDate,
                status: v === visitCount ? 'COMPLETED' : 'COMPLETED', // All completed for demo
                notes: `زيارة طبية رقم ${v}`,
                diagnosis: v === visitCount ? 'فحص شامل' : 'فحص دوري',
                symptoms: v === visitCount ? 'ألم في الصدر، ضيق في التنفس' : 'فحص روتيني',
                vitalSigns: 'ضغط الدم: 120/80، النبض: 72',
                temperature: '36.5°C',
                bloodPressure: '120/80',
                heartRate: '72',
                weight: `${60 + Math.floor(Math.random() * 30)}kg`,
                height: `${160 + Math.floor(Math.random() * 30)}cm`,
              },
            });

            console.log(`     ✅ تم إنشاء الزيارة ${v}`);

            // 8. Create tests for each visit
            console.log(`     🔬 إنشاء الفحوصات للزيارة ${v}...`);
            const testCount = Math.floor(Math.random() * 3) + 1; // 1-3 tests per visit
            
            for (let t = 1; t <= testCount; t++) {
              const testType = testTypes[Math.floor(Math.random() * testTypes.length)];
              const testDate = new Date(visitDate);
              testDate.setHours(testDate.getHours() + t * 2);
              
              const test = await prisma.test.create({
                data: {
                  patientId: patient.id,
                  doctorId: randomDoctor.id,
                  hospitalId: hospital.id,
                  visitId: visit.id,
                  name: testType.name,
                  description: testType.description,
                  scheduledAt: testDate,
                  status: 'COMPLETED',
                  results: `نتائج ${testType.name}: طبيعية`,
                  notes: `تم إجراء ${testType.name} بنجاح`,
                },
              });

              console.log(`       ✅ تم إنشاء الفحص: ${testType.name}`);

              // 9. Based on test results, create diseases
              if (Math.random() > 0.6) { // 40% chance of disease
                const disease = diseases[Math.floor(Math.random() * diseases.length)];
                
                await prisma.disease.create({
                  data: {
                    patientId: patient.id,
                    name: disease.name,
                    description: `تم تشخيص ${disease.name} بناءً على نتائج ${testType.name}`,
                    diagnosedAt: testDate,
                    severity: disease.severity,
                    status: disease.status,
                    notes: `تشخيص من خلال ${testType.name}`,
                  },
                });

                console.log(`       🦠 تم تشخيص المرض: ${disease.name}`);

                // 10. Create treatments based on diseases
                if (Math.random() > 0.5) { // 50% chance of treatment
                  const treatment = treatments[Math.floor(Math.random() * treatments.length)];
                  
                  await prisma.treatment.create({
                    data: {
                      patientId: patient.id,
                      doctorId: randomDoctor.id,
                      hospitalId: hospital.id,
                      visitId: visit.id,
                      name: treatment.name,
                      description: treatment.description,
                      scheduledAt: new Date(testDate.getTime() + 24 * 60 * 60 * 1000), // Next day
                      status: 'COMPLETED',
                      notes: `علاج ${disease.name} باستخدام ${treatment.name}`,
                    },
                  });

                  console.log(`       💊 تم إنشاء العلاج: ${treatment.name}`);
                }

                // 11. Create operations if needed
                if (Math.random() > 0.8) { // 20% chance of operation
                  const operation = operations[Math.floor(Math.random() * operations.length)];
                  
                  await prisma.operation.create({
                    data: {
                      patientId: patient.id,
                      doctorId: randomDoctor.id,
                      hospitalId: hospital.id,
                      visitId: visit.id,
                      name: operation.name,
                      description: operation.description,
                      scheduledAt: new Date(testDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
                      status: 'COMPLETED',
                      notes: `عملية ${operation.name} لعلاج ${disease.name}`,
                    },
                  });

                  console.log(`       🏥 تم إنشاء العملية: ${operation.name}`);
                }
              }

              // 12. Create prescriptions
              if (Math.random() > 0.4) { // 60% chance of prescription
                const medication = medications[Math.floor(Math.random() * medications.length)];
                
                await prisma.prescription.create({
                  data: {
                    patientId: patient.id,
                    doctorId: randomDoctor.id,
                    hospitalId: hospital.id,
                    visitId: visit.id,
                    medication: medication.name,
                    dosage: medication.dosage,
                    frequency: medication.frequency,
                    duration: '7 أيام',
                    instructions: 'تناول مع الطعام',
                    startDate: testDate,
                    endDate: new Date(testDate.getTime() + 7 * 24 * 60 * 60 * 1000),
                    status: 'COMPLETED',
                    notes: `وصفة طبية من ${randomDoctor.firstName} ${randomDoctor.lastName}`,
                  },
                });

                console.log(`       💉 تم إنشاء الوصفة: ${medication.name}`);
              }
            }
          }
        }
      }
    }

    console.log('\n🎉 تم إنشاء نظام إدارة المستشفى بنجاح!');
    console.log('\n📊 الملخص:');
    console.log(`- المدن: ${cities.length}`);
    console.log(`- المستشفيات: ${hospitals.length}`);
    console.log(`- الأطباء: ${doctors.length}`);
    console.log(`- المرضى: ${patients.length}`);
    
    // Count all related records
    const visitsCount = await prisma.visit.count();
    const testsCount = await prisma.test.count();
    const diseasesCount = await prisma.disease.count();
    const treatmentsCount = await prisma.treatment.count();
    const operationsCount = await prisma.operation.count();
    const prescriptionsCount = await prisma.prescription.count();
    
    console.log(`- الزيارات: ${visitsCount}`);
    console.log(`- الفحوصات: ${testsCount}`);
    console.log(`- الأمراض: ${diseasesCount}`);
    console.log(`- العلاجات: ${treatmentsCount}`);
    console.log(`- العمليات: ${operationsCount}`);
    console.log(`- الوصفات: ${prescriptionsCount}`);
    
    console.log('\n🔑 بيانات الدخول التجريبية:');
    console.log('- الإدارة: admin@hospital.com / admin123');
    console.log('- الأطباء: doctor1@[hospital].iq / doctor123');
    console.log('- الموظفين: staff1@[hospital].iq / staff123');
    
    console.log('\n🔄 التدفق الطبي المُنشأ:');
    console.log('المريض → الزيارة → الفحوصات → التشخيص (الأمراض) → العلاج/العمليات → الوصفات');

  } catch (error) {
    console.error('❌ خطأ في إنشاء قاعدة البيانات:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
