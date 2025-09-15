require('dotenv').config();
const { Client } = require('pg');

// Use your DIRECT_URL for seeding
const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function main() {
  console.log('👤 إنشاء مستخدم الإدارة...');
  console.log('🔗 محاولة الاتصال بقاعدة البيانات...');
  
  try {
    await client.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');

    // Insert admin user
    const insertUserQuery = `
      INSERT INTO users (id, email, password, role, "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    
    const result = await client.query(insertUserQuery, [
      'admin-user',
      'admin@hospital.com',
      'admin123',
      'ADMIN'
    ]);

    if (result.rows.length > 0) {
      console.log('✅ تم إنشاء مستخدم الإدارة بنجاح!');
      console.log('📧 البريد الإلكتروني: admin@hospital.com');
      console.log('🔑 كلمة المرور: admin123');
    } else {
      console.log('ℹ️ مستخدم الإدارة موجود بالفعل');
    }

    // Check if user was created
    const checkQuery = 'SELECT COUNT(*) FROM users WHERE role = $1';
    const countResult = await client.query(checkQuery, ['ADMIN']);
    console.log(`📊 عدد مستخدمي الإدارة: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ خطأ في إنشاء مستخدم الإدارة:', error.message);
  } finally {
    await client.end();
  }
}

main();
