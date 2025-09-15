const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

// المدن العراقية
const iraqiCities = [
  'بغداد', 'البصرة', 'الموصل', 'أربيل', 'السليمانية', 'دهوك', 'كركوك', 
  'الأنبار', 'النجف', 'كربلاء', 'بابل', 'واسط', 'ديالى', 'ميسان', 
  'المثنى', 'القادسية', 'ذي قار', 'صلاح الدين'
];

// التخصصات الطبية
const medicalSpecializations = [
  'أمراض القلب والشرايين', 'أمراض الأعصاب', 'جراحة العظام', 'طب الأطفال', 
  'أمراض النساء والولادة', 'الأمراض الجلدية', 'أمراض العيون', 'أنف وأذن وحنجرة', 
  'الجراحة العامة', 'الطب الباطني', 'الطوارئ والحوادث', 'التخدير والإنعاش', 
  'الأشعة التشخيصية', 'الطب الشرعي', 'الطب النفسي', 'أمراض الكلى', 
  'أمراض الجهاز الهضمي', 'أمراض الصدر', 'الجراحة التجميلية', 'الطب الرياضي'
];

// مناصب الموظفين
const staffPositions = [
  'ممرض', 'ممرضة', 'فني مختبر', 'فني أشعة', 'صيدلي', 'صيدلانية', 
  'موظف إداري', 'موظف استقبال', 'حارس أمن', 'فني صيانة', 'دعم تقني', 
  'محاسب', 'سكرتير طبي', 'مدير قسم', 'مشرف تمريض'
];

// أنواع الفحوصات الطبية
const medicalTests = [
  { name: 'فحص الدم الشامل', description: 'تحليل شامل لمكونات الدم وخلايا الدم' },
  { name: 'فحص السكر في الدم', description: 'قياس مستوى السكر في الدم' },
  { name: 'فحص الكوليسترول', description: 'قياس مستوى الكوليسترول والدهون' },
  { name: 'فحص وظائف الكبد', description: 'تقييم وظائف الكبد والإنزيمات' },
  { name: 'فحص وظائف الكلى', description: 'تقييم وظائف الكلى والكرياتينين' },
  { name: 'تخطيط القلب', description: 'فحص كهربائية القلب' },
  { name: 'الأشعة السينية للصدر', description: 'فحص الصدر بالأشعة السينية' },
  { name: 'الموجات فوق الصوتية', description: 'فحص بالموجات فوق الصوتية' },
  { name: 'الرنين المغناطيسي', description: 'فحص بالرنين المغناطيسي' },
  { name: 'المنظار الداخلي', description: 'فحص بالمنظار الطبي' },
  { name: 'فحص البول', description: 'تحليل شامل للبول' },
  { name: 'فحص البراز', description: 'تحليل البراز للكشف عن الطفيليات' }
];

// الأمراض الشائعة
const commonDiseases = [
  { name: 'ارتفاع ضغط الدم', severity: 'متوسط', status: 'مزمن' },
  { name: 'داء السكري', severity: 'متوسط', status: 'مزمن' },
  { name: 'أمراض القلب التاجية', severity: 'عالي', status: 'نشط' },
  { name: 'التهاب المفاصل الروماتويدي', severity: 'متوسط', status: 'مزمن' },
  { name: 'الربو', severity: 'منخفض', status: 'نشط' },
  { name: 'الالتهاب الرئوي', severity: 'عالي', status: 'نشط' },
  { name: 'التهاب المعدة', severity: 'منخفض', status: 'نشط' },
  { name: 'الصداع النصفي', severity: 'متوسط', status: 'نشط' },
  { name: 'الاكتئاب', severity: 'متوسط', status: 'نشط' },
  { name: 'القلق العام', severity: 'منخفض', status: 'نشط' },
  { name: 'فقر الدم', severity: 'منخفض', status: 'نشط' },
  { name: 'التهاب الكبد الوبائي', severity: 'عالي', status: 'نشط' }
];

// أنواع العلاجات
const treatmentTypes = [
  { name: 'العلاج الدوائي', description: 'تناول الأدوية الموصوفة حسب الجرعة' },
  { name: 'العلاج الطبيعي', description: 'تمارين وعلاج طبيعي للمفاصل والعضلات' },
  { name: 'العلاج النفسي', description: 'جلسات علاج نفسي واستشارة' },
  { name: 'العلاج بالليزر', description: 'علاج باستخدام الليزر الطبي' },
  { name: 'العلاج الكيميائي', description: 'علاج كيميائي للأورام السرطانية' },
  { name: 'العلاج الإشعاعي', description: 'علاج إشعاعي للأورام' },
  { name: 'العلاج بالحرارة', description: 'علاج بالحرارة الموضعية' },
  { name: 'العلاج بالبرودة', description: 'علاج بالبرودة والثلج' },
  { name: 'العلاج بالأكسجين', description: 'علاج بالأكسجين عالي الضغط' },
  { name: 'العلاج المائي', description: 'علاج بالماء والتمارين المائية' }
];

// أنواع العمليات الجراحية
const operationTypes = [
  { name: 'جراحة القلب المفتوح', description: 'عملية جراحية على القلب والأوعية الدموية' },
  { name: 'جراحة الأوعية الدموية', description: 'عملية على الشرايين والأوردة' },
  { name: 'جراحة العظام', description: 'عملية جراحية على العظام والمفاصل' },
  { name: 'جراحة المخ والأعصاب', description: 'عملية جراحية على المخ والحبل الشوكي' },
  { name: 'جراحة العيون', description: 'عملية جراحية على العيون' },
  { name: 'جراحة الأنف والأذن', description: 'عملية جراحية على الأنف والأذن والحنجرة' },
  { name: 'جراحة البطن', description: 'عملية جراحية على أعضاء البطن' },
  { name: 'جراحة الصدر', description: 'عملية جراحية على أعضاء الصدر' },
  { name: 'جراحة المسالك البولية', description: 'عملية جراحية على الكلى والمسالك البولية' },
  { name: 'جراحة التجميل', description: 'عملية جراحية تجميلية' }
];

// الأدوية الشائعة
const commonMedications = [
  { name: 'أسبرين', dosage: '100mg', frequency: 'مرة يومياً' },
  { name: 'باراسيتامول', dosage: '500mg', frequency: '3 مرات يومياً' },
  { name: 'أوميبرازول', dosage: '20mg', frequency: 'مرة يومياً' },
  { name: 'ميتفورمين', dosage: '500mg', frequency: 'مرتين يومياً' },
  { name: 'أملوديبين', dosage: '5mg', frequency: 'مرة يومياً' },
  { name: 'أتورفاستاتين', dosage: '20mg', frequency: 'مرة يومياً' },
  { name: 'لوسارتان', dosage: '50mg', frequency: 'مرة يومياً' },
  { name: 'سيتالوبرام', dosage: '20mg', frequency: 'مرة يومياً' },
  { name: 'أموكسيسيلين', dosage: '500mg', frequency: '3 مرات يومياً' },
  { name: 'إيبوبروفين', dosage: '400mg', frequency: '3 مرات يومياً' }
];

// الأسماء العربية
const arabicFirstNames = [
  'أحمد', 'محمد', 'علي', 'حسن', 'حسين', 'عمر', 'خالد', 'سعد', 'عبدالله', 'عبدالرحمن',
  'فاطمة', 'عائشة', 'زينب', 'مريم', 'خديجة', 'آمنة', 'نور', 'سارة', 'هند', 'نورا'
];

const arabicLastNames = [
  'المحمود', 'الحسن', 'الرشيد', 'البغدادي', 'البصري', 'الموصلي', 'الأربيلي', 
  'الكردي', 'النجفي', 'الكربلائي', 'البابلي', 'الديواني', 'الأنباري', 'الصلاحي'
];

async function main() {
  console.log('🏥 بدء إنشاء نظام إدارة المستشفى العراقي...');
  
  try {
    // 1. إنشاء المدن العراقية
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

    // 2. إنشاء المستشفيات
    console.log('\n🏥 إنشاء المستشفيات العراقية...');
    const hospitals = [];
    const majorCities = ['بغداد', 'البصرة', 'الموصل', 'أربيل', 'النجف', 'كربلاء'];
    
    for (const cityName of majorCities) {
      const city = cities.find(c => c.name === cityName);
      if (city) {
        // مستشفى تعليمي
        const teachingHospital = await prisma.hospital.upsert({
          where: { id: `hospital-${city.id}-teaching` },
          update: {},
          create: {
            id: `hospital-${city.id}-teaching`,
            name: `مستشفى ${cityName} التعليمي`,
            address: `المنطقة الطبية، ${cityName}، العراق`,
            phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            email: `info@${cityName.replace(' ', '')}teaching.iq`,
            cityId: city.id,
          },
        });
        hospitals.push(teachingHospital);
        console.log(`✅ تم إنشاء المستشفى: ${teachingHospital.name}`);

        // مستشفى عام
        const generalHospital = await prisma.hospital.upsert({
          where: { id: `hospital-${city.id}-general` },
          update: {},
          create: {
            id: `hospital-${city.id}-general`,
            name: `مستشفى ${cityName} العام`,
            address: `شارع المستشفيات، ${cityName}، العراق`,
            phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            email: `info@${cityName.replace(' ', '')}general.iq`,
            cityId: city.id,
          },
        });
        hospitals.push(generalHospital);
        console.log(`✅ تم إنشاء المستشفى: ${generalHospital.name}`);
      }
    }

    // 3. إنشاء مستخدم الإدارة
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
    console.log('✅ تم إنشاء مستخدم الإدارة');

    // 4. إنشاء الأطباء
    console.log('\n👨‍⚕️ إنشاء الأطباء العراقيين...');
    const doctors = [];
    for (const hospital of hospitals) {
      for (let i = 1; i <= 4; i++) {
        const specialization = medicalSpecializations[Math.floor(Math.random() * medicalSpecializations.length)];
        const firstName = `د. ${arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)]}`;
        const lastName = arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];
        
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

    // 5. إنشاء الموظفين
    console.log('\n👥 إنشاء الموظفين العراقيين...');
    for (const hospital of hospitals) {
      for (let i = 1; i <= 5; i++) {
        const position = staffPositions[Math.floor(Math.random() * staffPositions.length)];
        const firstName = arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)];
        const lastName = arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];
        
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

    // 6. إنشاء المرضى مع التدفق الطبي الكامل
    console.log('\n👤 إنشاء المرضى العراقيين مع التدفق الطبي...');
    const patients = [];
    
    for (const hospital of hospitals) {
      for (let i = 1; i <= 8; i++) {
        const firstName = arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)];
        const lastName = arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];
        const gender = Math.random() > 0.5 ? 'ذكر' : 'أنثى';
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
        
        // توليد تاريخ ميلاد عشوائي (18-80 سنة)
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
            nationality: 'عراقي',
            idNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            maritalStatus: Math.random() > 0.5 ? 'متزوج' : 'أعزب',
            occupation: ['موظف', 'طالب', 'معلم', 'مهندس', 'طبيب'][Math.floor(Math.random() * 5)],
          },
        });
        
        patients.push(patient);
        console.log(`✅ تم إنشاء المريض: ${firstName} ${lastName}`);

        // إنشاء الزيارات للمريض
        const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
        const randomDoctor = hospitalDoctors[Math.floor(Math.random() * hospitalDoctors.length)];
        
        if (randomDoctor) {
          // إنشاء 2-5 زيارات لكل مريض
          const visitCount = Math.floor(Math.random() * 4) + 2;
          
          for (let v = 1; v <= visitCount; v++) {
            const visitDate = new Date();
            visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 90)); // آخر 90 يوم
            
            const visit = await prisma.visit.create({
              data: {
                patientId: patient.id,
                doctorId: randomDoctor.id,
                hospitalId: hospital.id,
                scheduledAt: visitDate,
                status: 'COMPLETED',
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

            // إنشاء الفحوصات للزيارة
            const testCount = Math.floor(Math.random() * 3) + 1; // 1-3 فحوصات لكل زيارة
            
            for (let t = 1; t <= testCount; t++) {
              const testType = medicalTests[Math.floor(Math.random() * medicalTests.length)];
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

              // إنشاء الأمراض بناءً على نتائج الفحوصات
              if (Math.random() > 0.6) { // 40% احتمال وجود مرض
                const disease = commonDiseases[Math.floor(Math.random() * commonDiseases.length)];
                
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

                // إنشاء العلاجات بناءً على الأمراض
                if (Math.random() > 0.5) { // 50% احتمال وجود علاج
                  const treatment = treatmentTypes[Math.floor(Math.random() * treatmentTypes.length)];
                  
                  await prisma.treatment.create({
                    data: {
                      patientId: patient.id,
                      doctorId: randomDoctor.id,
                      hospitalId: hospital.id,
                      visitId: visit.id,
                      name: treatment.name,
                      description: treatment.description,
                      scheduledAt: new Date(testDate.getTime() + 24 * 60 * 60 * 1000), // اليوم التالي
                      status: 'COMPLETED',
                      notes: `علاج ${disease.name} باستخدام ${treatment.name}`,
                    },
                  });
                }

                // إنشاء العمليات إذا لزم الأمر
                if (Math.random() > 0.8) { // 20% احتمال وجود عملية
                  const operation = operationTypes[Math.floor(Math.random() * operationTypes.length)];
                  
                  await prisma.operation.create({
                    data: {
                      patientId: patient.id,
                      doctorId: randomDoctor.id,
                      hospitalId: hospital.id,
                      visitId: visit.id,
                      name: operation.name,
                      description: operation.description,
                      scheduledAt: new Date(testDate.getTime() + 7 * 24 * 60 * 60 * 1000), // الأسبوع التالي
                      status: 'COMPLETED',
                      notes: `عملية ${operation.name} لعلاج ${disease.name}`,
                    },
                  });
                }
              }

              // إنشاء الوصفات الطبية
              if (Math.random() > 0.4) { // 60% احتمال وجود وصفة
                const medication = commonMedications[Math.floor(Math.random() * commonMedications.length)];
                
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
              }
            }
          }
        }
      }
    }

    console.log('\n🎉 تم إنشاء نظام إدارة المستشفى العراقي بنجاح!');
    console.log('\n📊 الملخص:');
    console.log(`- المدن: ${cities.length}`);
    console.log(`- المستشفيات: ${hospitals.length}`);
    console.log(`- الأطباء: ${doctors.length}`);
    console.log(`- المرضى: ${patients.length}`);
    
    // عد جميع السجلات ذات الصلة
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
    
    console.log('\n🔑 بيانات الدخول:');
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
