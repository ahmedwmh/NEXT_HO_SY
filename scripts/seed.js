const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo data...');

  // Create cities
  const city1 = await prisma.city.upsert({
    where: { name: 'New York' },
    update: {},
    create: { name: 'New York' },
  });

  const city2 = await prisma.city.upsert({
    where: { name: 'Los Angeles' },
    update: {},
    create: { name: 'Los Angeles' },
  });

  console.log('✅ Cities created');

  // Create centers
  const center1 = await prisma.center.upsert({
    where: { id: 'center-1' },
    update: {},
    create: {
      id: 'center-1',
      name: 'Manhattan Medical Center',
      address: '123 Medical Plaza, Manhattan, NY',
      cityId: city1.id,
    },
  });

  const center2 = await prisma.center.upsert({
    where: { id: 'center-2' },
    update: {},
    create: {
      id: 'center-2',
      name: 'LA Healthcare Complex',
      address: '456 Health Street, Los Angeles, CA',
      cityId: city2.id,
    },
  });

  console.log('✅ Centers created');

  // Create hospitals
  const hospital1 = await prisma.hospital.upsert({
    where: { id: 'hospital-1' },
    update: {},
    create: {
      id: 'hospital-1',
      name: 'General Hospital NYC',
      address: '789 Hospital Ave, Manhattan, NY',
      phone: '+1-555-0101',
      email: 'info@generalhospitalnyc.com',
      centerId: center1.id,
    },
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { id: 'hospital-2' },
    update: {},
    create: {
      id: 'hospital-2',
      name: 'City Medical Center LA',
      address: '321 Medical Blvd, Los Angeles, CA',
      phone: '+1-555-0202',
      email: 'contact@citymedicalla.com',
      centerId: center2.id,
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
      hospitalId: hospital1.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'female',
      phone: '+1-555-0505',
      email: 'alice.johnson@email.com',
      address: '123 Main St, New York, NY',
      emergencyContact: '+1-555-0506',
      bloodType: 'A+',
      allergies: 'Penicillin',
      medicalHistory: 'No significant medical history',
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: 'patient-2' },
    update: {},
    create: {
      id: 'patient-2',
      hospitalId: hospital1.id,
      firstName: 'Bob',
      lastName: 'Wilson',
      dateOfBirth: new Date('1978-07-22'),
      gender: 'male',
      phone: '+1-555-0606',
      email: 'bob.wilson@email.com',
      address: '456 Oak Ave, New York, NY',
      emergencyContact: '+1-555-0607',
      bloodType: 'O-',
      allergies: 'None',
      medicalHistory: 'Previous heart surgery in 2020',
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
