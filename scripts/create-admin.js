const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👤 إنشاء حساب المدير...')

    // إنشاء أو تحديث حساب المدير
    const admin = await prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {
        password: 'admin123',
        role: 'ADMIN'
      },
      create: {
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'ADMIN'
      }
    })

    console.log('✅ تم إنشاء/تحديث حساب المدير بنجاح!')
    console.log(`📧 البريد الإلكتروني: ${admin.email}`)
    console.log(`🔑 كلمة المرور: admin123`)
    console.log(`👑 الدور: ${admin.role}`)

  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المدير:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
