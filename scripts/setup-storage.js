#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🏥 Setting up Supabase Storage for Hospital Management System...\n');

  try {
    // Check if hospital bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const hospitalBucket = buckets.find(bucket => bucket.name === 'hospital');
    
    if (!hospitalBucket) {
      console.log('📦 Creating "hospital" bucket...');
      const { data, error } = await supabase.storage.createBucket('hospital', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/dicom',
          'image/dicom'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`);
      }

      console.log('✅ Hospital bucket created successfully');
    } else {
      console.log('✅ Hospital bucket already exists');
    }

    // Create folder structure
    console.log('\n📁 Setting up folder structure...');
    
    const folders = [
      'patient-photos',
      'medical-attachments',
      'medical-attachments/reports',
      'medical-attachments/scans', 
      'medical-attachments/images',
      'medical-attachments/documents'
    ];

    for (const folder of folders) {
      // Create a dummy file to establish the folder structure
      const dummyContent = new Blob([''], { type: 'text/plain' });
      const { error } = await supabase.storage
        .from('hospital')
        .upload(`${folder}/.gitkeep`, dummyContent);

      if (error && !error.message.includes('already exists')) {
        console.warn(`⚠️  Warning: Could not create folder ${folder}: ${error.message}`);
      } else {
        console.log(`✅ Created folder: ${folder}`);
      }
    }

    // Set up RLS policies (if needed)
    console.log('\n🔒 Setting up storage policies...');
    
    // Note: RLS policies need to be set up manually in Supabase dashboard
    // or via SQL commands. This is just a reminder.
    console.log('ℹ️  Please set up Row Level Security policies in Supabase dashboard:');
    console.log('   1. Go to Storage > Policies');
    console.log('   2. Create policies for the "hospital" bucket');
    console.log('   3. Allow authenticated users to upload/read files');
    console.log('   4. Restrict access based on user roles if needed');

    console.log('\n🎉 Storage setup complete!');
    console.log('\nYour hospital bucket is ready with the following structure:');
    console.log('hospital/');
    console.log('├── patient-photos/');
    console.log('└── medical-attachments/');
    console.log('    ├── reports/');
    console.log('    ├── scans/');
    console.log('    ├── images/');
    console.log('    └── documents/');

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
    process.exit(1);
  }
}

setupStorage();
