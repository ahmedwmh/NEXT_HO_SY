const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo data...');

  // Create cities
  const city1 = await prisma.city.upsert({
    where: { name: 'بغداد' },
    update: {},
    create: { name: 'بغداد' },
  });

  const city2 = await prisma.city.upsert({
    where: { name: 'البصرة' },
    update: {},
    create: { name: 'البصرة' },
  });

  const city3 = await prisma.city.upsert({
    where: { name: 'أربيل' },
    update: {},
    create: { name: 'أربيل' },
  });

  console.log('✅ Cities created');

  // Create hospitals
  const hospital1 = await prisma.hospital.upsert({
    where: { id: 'hospital-1' },
    update: {},
    create: {
      id: 'hospital-1',
      name: 'مستشفى بغداد التعليمي',
      address: 'شارع الرشيد، بغداد، العراق',
      phone: '+964-1-234-5678',
      email: 'info@baghdadhospital.edu.iq',
      cityId: city1.id,
    },
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { id: 'hospital-2' },
    update: {},
    create: {
      id: 'hospital-2',
      name: 'مستشفى البصرة العام',
      address: 'شارع الكورنيش، البصرة، العراق',
      phone: '+964-40-123-4567',
      email: 'info@basrahhospital.gov.iq',
      cityId: city2.id,
    },
  });

  const hospital3 = await prisma.hospital.upsert({
    where: { id: 'hospital-3' },
    update: {},
    create: {
      id: 'hospital-3',
      name: 'مستشفى أربيل الطبي',
      address: 'شارع 60 متر، أربيل، كردستان العراق',
      phone: '+964-66-123-4567',
      email: 'info@erbilmedical.com',
      cityId: city3.id,
    },
  });

  console.log('✅ Hospitals created');

  // Create users
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

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      id: 'doctor-user',
      email: 'doctor@hospital.com',
      password: 'doctor123',
      role: 'DOCTOR',
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@hospital.com' },
    update: {},
    create: {
      id: 'staff-user',
      email: 'staff@hospital.com',
      password: 'staff123',
      role: 'STAFF',
    },
  });

  console.log('✅ Users created');

  // Create doctor profile
  await prisma.doctor.upsert({
    where: { id: 'doctor-1' },
    update: {},
    create: {
      id: 'doctor-1',
      userId: doctorUser.id,
      hospitalId: hospital1.id,
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'Cardiology',
      phone: '+1-555-0303',
      licenseNumber: 'MD123456',
    },
  });

  // Create staff profile
  await prisma.staff.upsert({
    where: { id: 'staff-1' },
    update: {},
    create: {
      id: 'staff-1',
      userId: staffUser.id,
      hospitalId: hospital1.id,
      firstName: 'Jane',
      lastName: 'Doe',
      position: 'Nurse',
      phone: '+1-555-0404',
    },
  });

  console.log('✅ Doctor and Staff profiles created');

  // Create sample patients
  const patient1 = await prisma.patient.upsert({
    where: { id: 'patient-1' },
    update: {},
    create: {
      id: 'patient-1',
      patientNumber: 'P001',
      cityId: city1.id,
      hospitalId: hospital1.id,
      firstName: 'أحمد',
      lastName: 'محمد',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      phone: '+964-770-123-4567',
      email: 'ahmed.mohammed@email.com',
      address: 'شارع الرشيد، بغداد، العراق',
      emergencyContact: '+964-770-123-4568',
      bloodType: 'A+',
      allergies: 'البنسلين',
      medicalHistory: 'لا يوجد تاريخ مرضي مهم',
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: 'patient-2' },
    update: {},
    create: {
      id: 'patient-2',
      patientNumber: 'P002',
      cityId: city2.id,
      hospitalId: hospital2.id,
      firstName: 'فاطمة',
      lastName: 'علي',
      dateOfBirth: new Date('1978-07-22'),
      gender: 'female',
      phone: '+964-770-234-5678',
      email: 'fatima.ali@email.com',
      address: 'شارع الكورنيش، البصرة، العراق',
      emergencyContact: '+964-770-234-5679',
      bloodType: 'O-',
      allergies: 'لا يوجد',
      medicalHistory: 'جراحة قلب سابقة في 2020',
    },
  });

  console.log('✅ Sample patients created');

  // Create sample visit
  await prisma.visit.upsert({
    where: { id: 'visit-1' },
    update: {},
    create: {
      id: 'visit-1',
      patientId: patient1.id,
      doctorId: 'doctor-1',
      hospitalId: hospital1.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'SCHEDULED',
      notes: 'Regular checkup appointment',
    },
  });

  console.log('✅ Sample visit created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('- Admin: admin@hospital.com / admin123');
  console.log('- Doctor: doctor@hospital.com / doctor123');
  console.log('- Staff: staff@hospital.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
