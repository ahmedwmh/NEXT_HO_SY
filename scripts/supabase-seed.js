require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log('🏥 بدء إنشاء بيانات المستشفى باستخدام Supabase...');
  
  try {
    // 1. Insert cities
    console.log('🏙️ إنشاء المدن...');
    const cities = [
      { name: 'بغداد' },
      { name: 'البصرة' },
      { name: 'الموصل' },
      { name: 'أربيل' }
    ];
    
    for (const city of cities) {
      const { data, error } = await supabase
        .from('cities')
        .upsert(city, { onConflict: 'name' })
        .select();
      
      if (error) {
        console.error('❌ خطأ في إنشاء المدينة:', error);
      } else {
        console.log(`✅ تم إنشاء المدينة: ${city.name}`);
      }
    }

    // 2. Get cities for hospital creation
    const { data: citiesData } = await supabase.from('cities').select('*');
    const baghdadCity = citiesData?.find(c => c.name === 'بغداد');

    // 3. Insert hospitals
    console.log('\n🏥 إنشاء المستشفيات...');
    const hospitals = [
      {
        name: 'مستشفى بغداد التعليمي',
        address: 'شارع الرشيد، بغداد، العراق',
        phone: '+964-1-234-5678',
        email: 'info@baghdadhospital.edu.iq',
        cityId: baghdadCity?.id
      },
      {
        name: 'مستشفى البصرة العام',
        address: 'شارع الكورنيش، البصرة، العراق',
        phone: '+964-40-123-4567',
        email: 'info@basrahhospital.gov.iq',
        cityId: citiesData?.find(c => c.name === 'البصرة')?.id
      }
    ];

    for (const hospital of hospitals) {
      const { data, error } = await supabase
        .from('hospitals')
        .insert(hospital)
        .select();
      
      if (error) {
        console.error('❌ خطأ في إنشاء المستشفى:', error);
      } else {
        console.log(`✅ تم إنشاء المستشفى: ${hospital.name}`);
      }
    }

    // 4. Get hospitals for user creation
    const { data: hospitalsData } = await supabase.from('hospitals').select('*');
    const baghdadHospital = hospitalsData?.find(h => h.name === 'مستشفى بغداد التعليمي');

    // 5. Insert users
    console.log('\n👤 إنشاء المستخدمين...');
    const users = [
      {
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        email: 'doctor@hospital.com',
        password: 'doctor123',
        role: 'DOCTOR'
      },
      {
        email: 'staff@hospital.com',
        password: 'staff123',
        role: 'STAFF'
      }
    ];

    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' })
        .select();
      
      if (error) {
        console.error('❌ خطأ في إنشاء المستخدم:', error);
      } else {
        console.log(`✅ تم إنشاء المستخدم: ${user.email}`);
      }
    }

    // 6. Get users for profile creation
    const { data: usersData } = await supabase.from('users').select('*');
    const doctorUser = usersData?.find(u => u.email === 'doctor@hospital.com');
    const staffUser = usersData?.find(u => u.email === 'staff@hospital.com');

    // 7. Insert doctor profile
    console.log('\n👨‍⚕️ إنشاء الطبيب...');
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        userId: doctorUser?.id,
        hospitalId: baghdadHospital?.id,
        firstName: 'د. أحمد',
        lastName: 'المحمود',
        specialization: 'أمراض القلب',
        phone: '+964-770-123-4567',
        licenseNumber: 'MD-123456'
      })
      .select();

    if (doctorError) {
      console.error('❌ خطأ في إنشاء الطبيب:', doctorError);
    } else {
      console.log('✅ تم إنشاء الطبيب: د. أحمد المحمود');
    }

    // 8. Insert staff profile
    console.log('\n👥 إنشاء الموظف...');
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .insert({
        userId: staffUser?.id,
        hospitalId: baghdadHospital?.id,
        firstName: 'فاطمة',
        lastName: 'الحسن',
        position: 'ممرض',
        phone: '+964-770-234-5678'
      })
      .select();

    if (staffError) {
      console.error('❌ خطأ في إنشاء الموظف:', staffError);
    } else {
      console.log('✅ تم إنشاء الموظف: فاطمة الحسن');
    }

    // 9. Insert sample patient
    console.log('\n👤 إنشاء المريض...');
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert({
        cityId: baghdadCity?.id,
        hospitalId: baghdadHospital?.id,
        patientNumber: 'P001',
        firstName: 'محمد',
        lastName: 'الحسن',
        dateOfBirth: '1985-03-15',
        gender: 'ذكر',
        phone: '+964-770-123-4567',
        email: 'mohammed.hassan@email.com',
        address: 'شارع الرشيد، بغداد، العراق',
        emergencyContact: '+964-770-123-4568',
        bloodType: 'A+',
        allergies: 'البنسلين',
        medicalHistory: 'لا يوجد تاريخ مرضي مهم',
        isActive: true
      })
      .select();

    if (patientError) {
      console.error('❌ خطأ في إنشاء المريض:', patientError);
    } else {
      console.log('✅ تم إنشاء المريض: محمد الحسن');
    }

    console.log('\n🎉 تم إنشاء البيانات بنجاح!');
    console.log('\n🔑 بيانات الدخول:');
    console.log('- الإدارة: admin@hospital.com / admin123');
    console.log('- الطبيب: doctor@hospital.com / doctor123');
    console.log('- الموظف: staff@hospital.com / staff123');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
  }
}

main();
