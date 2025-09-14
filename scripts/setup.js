#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 Setting up Hospital Management System...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from env.example...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created. Please update with your actual values.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated.\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Push database schema
console.log('🗄️  Setting up database schema...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema created.\n');
} catch (error) {
  console.error('❌ Failed to setup database schema:', error.message);
  console.log('Please check your DATABASE_URL in .env.local\n');
  process.exit(1);
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Set up Supabase Storage:');
console.log('   npm run setup:storage');
console.log('3. Seed the database with demo data:');
console.log('   npm run seed');
console.log('4. Start the development server:');
console.log('   npm run dev');
console.log('5. Open http://localhost:3000 in your browser');
console.log('\nDemo credentials:');
console.log('- Admin: admin@hospital.com / admin123');
console.log('- Doctor: doctor@hospital.com / doctor123');
console.log('- Staff: staff@hospital.com / staff123');
