const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Use transaction pooler for better performance
    },
  },
});

// المحافظات العراقية (المدن)
const iraqiGovernorates = [
  'بغداد',
  'البصرة',
  'الموصل',
  'أربيل',
  'السليمانية',
  'دهوك',
  'كركوك',
  'الأنبار',
  'النجف',
  'كربلاء',
  'بابل',
  'واسط',
  'ديالى',
  'ميسان',
  'المثنى',
  'القادسية',
  'ذي قار',
  'صلاح الدين'
];

// التخصصات الطبية
const specializations = [
  'أمراض القلب',
  'أمراض الأعصاب',
  'العظام',
  'طب الأطفال',
  'أمراض النساء',
  'الأمراض الجلدية',
  'أمراض العيون',
  'أنف وأذن وحنجرة',
  'الجراحة العامة',
  'الطب الباطني',
  'الطوارئ',
  'التخدير',
  'الأشعة',
  'الطب الشرعي',
  'الطب النفسي'
];

// مناصب الموظفين
const staffPositions = [
  'ممرض',
  'فني مختبر',
  'فني أشعة',
  'صيدلي',
  'موظف إداري',
  'موظف استقبال',
  'حارس أمن',
  'فني صيانة',
  'دعم تقني',
  'محاسب'
];

async function main() {
  console.log('🇮🇶 بدء إنشاء بيانات المستشفيات العراقية...');

  try {
    // إنشاء المدن العراقية
    console.log('🏙️  إنشاء المحافظات العراقية...');
    const cities = [];
    for (const governorate of iraqiGovernorates) {
      const city = await prisma.city.upsert({
        where: { name: governorate },
        update: {},
        create: { name: governorate },
      });
      cities.push(city);
      console.log(`✅ تم إنشاء المدينة: ${governorate}`);
    }

    // إنشاء المستشفيات مباشرة للمدن الرئيسية
    console.log('\n🏥 إنشاء المستشفيات...');
    const hospitals = [];
    const majorCities = ['بغداد', 'البصرة', 'الموصل', 'أربيل', 'السليمانية'];
    
    for (const cityName of majorCities) {
      const city = cities.find(c => c.name === cityName);
      if (city) {
        // إنشاء 2-3 مستشفيات لكل مدينة رئيسية
        const hospitalCount = cityName === 'بغداد' ? 3 : 2;
        
        for (let i = 1; i <= hospitalCount; i++) {
          const hospital = await prisma.hospital.upsert({
            where: { id: `hospital-${city.id}-${i}` },
            update: {},
            create: {
              id: `hospital-${city.id}-${i}`,
              name: `مستشفى ${cityName} العام ${i > 1 ? i : ''}`.trim(),
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

    // إنشاء مستخدم الإدارة
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

    // إنشاء الأطباء لكل مستشفى
    console.log('\n👨‍⚕️ إنشاء الأطباء...');
    const doctors = [];
    for (const hospital of hospitals) {
      const doctorCount = Math.floor(Math.random() * 3) + 3; // 3-5 أطباء لكل مستشفى
      
      for (let i = 1; i <= doctorCount; i++) {
        try {
          const specialization = specializations[Math.floor(Math.random() * specializations.length)];
          const firstName = `د. ${['أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'يوسف', 'إبراهيم'][Math.floor(Math.random() * 8)]}`;
          const lastName = ['المحمود', 'الحسن', 'الرشيد', 'البغدادي', 'البصري', 'الموصلي', 'الكردي'][Math.floor(Math.random() * 7)];
          
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
          
          // إضافة تأخير صغير لمنع مشاكل تجمع الاتصالات
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ خطأ في إنشاء الطبيب للمستشفى ${hospital.name}:`, error.message);
        }
      }
    }

    // إنشاء الموظفين لكل مستشفى
    console.log('\n👥 إنشاء الموظفين...');
    const staff = [];
    for (const hospital of hospitals) {
      const staffCount = Math.floor(Math.random() * 5) + 5; // 5-9 موظف لكل مستشفى
      
      for (let i = 1; i <= staffCount; i++) {
        try {
          const position = staffPositions[Math.floor(Math.random() * staffPositions.length)];
          const firstName = ['فاطمة', 'عائشة', 'زينب', 'خديجة', 'مريم', 'نور', 'ليلى', 'هالة'][Math.floor(Math.random() * 8)];
          const lastName = ['المحمود', 'الحسن', 'الرشيد', 'البغدادي', 'البصري', 'الموصلي', 'الكردي'][Math.floor(Math.random() * 7)];
          
          const staffUser = await prisma.user.create({
            data: {
              email: `staff${i}@${hospital.name.toLowerCase().replace(/\s+/g, '')}.iq`,
              password: 'staff123',
              role: 'STAFF',
            },
          });

          const staffMember = await prisma.staff.create({
            data: {
              userId: staffUser.id,
              hospitalId: hospital.id,
              firstName: firstName,
              lastName: lastName,
              position: position,
              phone: `+964-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            },
          });
          
          staff.push(staffMember);
          console.log(`✅ تم إنشاء الموظف: ${firstName} ${lastName} - ${position}`);
          
          // إضافة تأخير صغير لمنع مشاكل تجمع الاتصالات
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ خطأ في إنشاء الموظف للمستشفى ${hospital.name}:`, error.message);
        }
      }
    }

    // إنشاء عينة من المرضى
    console.log('\n👤 إنشاء عينة من المرضى...');
    const patients = [];
    for (const hospital of hospitals) {
      const patientCount = Math.floor(Math.random() * 5) + 5; // 5-9 مريض لكل مستشفى
      
      for (let i = 1; i <= patientCount; i++) {
        try {
          const firstName = ['أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'يوسف', 'إبراهيم', 'فاطمة', 'عائشة', 'زينب', 'خديجة', 'مريم', 'نور', 'ليلى', 'هالة'][Math.floor(Math.random() * 16)];
          const lastName = ['المحمود', 'الحسن', 'الرشيد', 'البغدادي', 'البصري', 'الموصلي', 'الكردي', 'النجفي', 'الكربلائي'][Math.floor(Math.random() * 9)];
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
              allergies: Math.random() > 0.7 ? ['البنسلين', 'الأسبرين', 'اللاتكس'][Math.floor(Math.random() * 3)] : null,
              medicalHistory: Math.random() > 0.5 ? 'حالات طبية سابقة' : null,
            },
          });
          
          patients.push(patient);
          console.log(`✅ تم إنشاء المريض: ${firstName} ${lastName}`);
          
          // إضافة تأخير صغير لمنع مشاكل تجمع الاتصالات
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ خطأ في إنشاء المريض للمستشفى ${hospital.name}:`, error.message);
        }
      }
    }

    // إنشاء بعض الزيارات النموذجية
    console.log('\n📅 إنشاء بعض الزيارات النموذجية...');
    for (let i = 0; i < 50; i++) {
      const randomPatient = patients[Math.floor(Math.random() * patients.length)];
      const hospitalDoctors = doctors.filter(d => d.hospitalId === randomPatient.hospitalId);
      const randomDoctor = hospitalDoctors[Math.floor(Math.random() * hospitalDoctors.length)];
      
      if (randomDoctor) {
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() + Math.floor(Math.random() * 30)); // خلال 30 يوم القادمة
        
        await prisma.visit.create({
          data: {
            patientId: randomPatient.id,
            doctorId: randomDoctor.id,
            hospitalId: randomPatient.hospitalId,
            scheduledAt: visitDate,
            status: 'SCHEDULED',
            notes: 'موعد فحص دوري',
          },
        });
      }
    }
    console.log('✅ تم إنشاء 50 زيارة نموذجية');

    console.log('\n🎉 تم إنشاء قاعدة البيانات بنجاح!');
    console.log('\n📊 الملخص:');
    console.log(`- المدن: ${cities.length}`);
    console.log(`- المستشفيات: ${hospitals.length}`);
    console.log(`- الأطباء: ${doctors.length}`);
    console.log(`- الموظفين: ${staff.length}`);
    console.log(`- المرضى: ${patients.length}`);
    console.log('\n🔑 بيانات الدخول التجريبية:');
    console.log('- الإدارة: admin@hospital.com / admin123');
    console.log('- الطبيب: doctor1@[hospital].iq / doctor123');
    console.log('- الموظف: staff1@[hospital].iq / staff123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
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
