const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// الصلاحيات الأساسية للنظام
const basicPermissions = [
  // صلاحيات المرضى
  { name: 'قراءة المرضى', description: 'عرض قائمة المرضى وتفاصيلهم', resource: 'PATIENTS', action: 'READ' },
  { name: 'إضافة مرضى', description: 'إضافة مرضى جدد', resource: 'PATIENTS', action: 'WRITE' },
  { name: 'تعديل المرضى', description: 'تعديل بيانات المرضى', resource: 'PATIENTS', action: 'WRITE' },
  { name: 'حذف المرضى', description: 'حذف المرضى', resource: 'PATIENTS', action: 'DELETE' },
  { name: 'إدارة المرضى', description: 'إدارة شاملة للمرضى', resource: 'PATIENTS', action: 'MANAGE' },

  // صلاحيات الزيارات
  { name: 'قراءة الزيارات', description: 'عرض قائمة الزيارات', resource: 'VISITS', action: 'READ' },
  { name: 'إضافة زيارات', description: 'إضافة زيارات جديدة', resource: 'VISITS', action: 'WRITE' },
  { name: 'تعديل الزيارات', description: 'تعديل بيانات الزيارات', resource: 'VISITS', action: 'WRITE' },
  { name: 'حذف الزيارات', description: 'حذف الزيارات', resource: 'VISITS', action: 'DELETE' },
  { name: 'إدارة الزيارات', description: 'إدارة شاملة للزيارات', resource: 'VISITS', action: 'MANAGE' },

  // صلاحيات الفحوصات
  { name: 'قراءة الفحوصات', description: 'عرض قائمة الفحوصات', resource: 'TESTS', action: 'READ' },
  { name: 'إضافة فحوصات', description: 'إضافة فحوصات جديدة', resource: 'TESTS', action: 'WRITE' },
  { name: 'تعديل الفحوصات', description: 'تعديل بيانات الفحوصات', resource: 'TESTS', action: 'WRITE' },
  { name: 'حذف الفحوصات', description: 'حذف الفحوصات', resource: 'TESTS', action: 'DELETE' },
  { name: 'إدارة الفحوصات', description: 'إدارة شاملة للفحوصات', resource: 'TESTS', action: 'MANAGE' },

  // صلاحيات العلاجات
  { name: 'قراءة العلاجات', description: 'عرض قائمة العلاجات', resource: 'TREATMENTS', action: 'READ' },
  { name: 'إضافة علاجات', description: 'إضافة علاجات جديدة', resource: 'TREATMENTS', action: 'WRITE' },
  { name: 'تعديل العلاجات', description: 'تعديل بيانات العلاجات', resource: 'TREATMENTS', action: 'WRITE' },
  { name: 'حذف العلاجات', description: 'حذف العلاجات', resource: 'TREATMENTS', action: 'DELETE' },
  { name: 'إدارة العلاجات', description: 'إدارة شاملة للعلاجات', resource: 'TREATMENTS', action: 'MANAGE' },

  // صلاحيات العمليات
  { name: 'قراءة العمليات', description: 'عرض قائمة العمليات', resource: 'OPERATIONS', action: 'READ' },
  { name: 'إضافة عمليات', description: 'إضافة عمليات جديدة', resource: 'OPERATIONS', action: 'WRITE' },
  { name: 'تعديل العمليات', description: 'تعديل بيانات العمليات', resource: 'OPERATIONS', action: 'WRITE' },
  { name: 'حذف العمليات', description: 'حذف العمليات', resource: 'OPERATIONS', action: 'DELETE' },
  { name: 'إدارة العمليات', description: 'إدارة شاملة للعمليات', resource: 'OPERATIONS', action: 'MANAGE' },

  // صلاحيات الأدوية
  { name: 'قراءة الأدوية', description: 'عرض قائمة الأدوية', resource: 'MEDICATIONS', action: 'READ' },
  { name: 'إضافة أدوية', description: 'إضافة أدوية جديدة', resource: 'MEDICATIONS', action: 'WRITE' },
  { name: 'تعديل الأدوية', description: 'تعديل بيانات الأدوية', resource: 'MEDICATIONS', action: 'WRITE' },
  { name: 'حذف الأدوية', description: 'حذف الأدوية', resource: 'MEDICATIONS', action: 'DELETE' },
  { name: 'إدارة الأدوية', description: 'إدارة شاملة للأدوية', resource: 'MEDICATIONS', action: 'MANAGE' },

  // صلاحيات الوصفات
  { name: 'قراءة الوصفات', description: 'عرض قائمة الوصفات', resource: 'PRESCRIPTIONS', action: 'READ' },
  { name: 'إضافة وصفات', description: 'إضافة وصفات جديدة', resource: 'PRESCRIPTIONS', action: 'WRITE' },
  { name: 'تعديل الوصفات', description: 'تعديل بيانات الوصفات', resource: 'PRESCRIPTIONS', action: 'WRITE' },
  { name: 'حذف الوصفات', description: 'حذف الوصفات', resource: 'PRESCRIPTIONS', action: 'DELETE' },
  { name: 'إدارة الوصفات', description: 'إدارة شاملة للوصفات', resource: 'PRESCRIPTIONS', action: 'MANAGE' },

  // صلاحيات التقارير
  { name: 'قراءة التقارير', description: 'عرض التقارير', resource: 'REPORTS', action: 'READ' },
  { name: 'إنشاء تقارير', description: 'إنشاء تقارير جديدة', resource: 'REPORTS', action: 'WRITE' },
  { name: 'إدارة التقارير', description: 'إدارة شاملة للتقارير', resource: 'REPORTS', action: 'MANAGE' },

  // صلاحيات الإعدادات
  { name: 'قراءة الإعدادات', description: 'عرض الإعدادات', resource: 'SETTINGS', action: 'READ' },
  { name: 'تعديل الإعدادات', description: 'تعديل الإعدادات', resource: 'SETTINGS', action: 'WRITE' },
  { name: 'إدارة الإعدادات', description: 'إدارة شاملة للإعدادات', resource: 'SETTINGS', action: 'MANAGE' },

  // صلاحيات المستخدمين
  { name: 'قراءة المستخدمين', description: 'عرض قائمة المستخدمين', resource: 'USERS', action: 'READ' },
  { name: 'إضافة مستخدمين', description: 'إضافة مستخدمين جدد', resource: 'USERS', action: 'WRITE' },
  { name: 'تعديل المستخدمين', description: 'تعديل بيانات المستخدمين', resource: 'USERS', action: 'WRITE' },
  { name: 'حذف المستخدمين', description: 'حذف المستخدمين', resource: 'USERS', action: 'DELETE' },
  { name: 'إدارة المستخدمين', description: 'إدارة شاملة للمستخدمين', resource: 'USERS', action: 'MANAGE' },

  // صلاحيات المستشفيات
  { name: 'قراءة المستشفيات', description: 'عرض قائمة المستشفيات', resource: 'HOSPITALS', action: 'READ' },
  { name: 'إضافة مستشفيات', description: 'إضافة مستشفيات جديدة', resource: 'HOSPITALS', action: 'WRITE' },
  { name: 'تعديل المستشفيات', description: 'تعديل بيانات المستشفيات', resource: 'HOSPITALS', action: 'WRITE' },
  { name: 'حذف المستشفيات', description: 'حذف المستشفيات', resource: 'HOSPITALS', action: 'DELETE' },
  { name: 'إدارة المستشفيات', description: 'إدارة شاملة للمستشفيات', resource: 'HOSPITALS', action: 'MANAGE' },

  // صلاحيات المدن
  { name: 'قراءة المدن', description: 'عرض قائمة المدن', resource: 'CITIES', action: 'READ' },
  { name: 'إضافة مدن', description: 'إضافة مدن جديدة', resource: 'CITIES', action: 'WRITE' },
  { name: 'تعديل المدن', description: 'تعديل بيانات المدن', resource: 'CITIES', action: 'WRITE' },
  { name: 'حذف المدن', description: 'حذف المدن', resource: 'CITIES', action: 'DELETE' },
  { name: 'إدارة المدن', description: 'إدارة شاملة للمدن', resource: 'CITIES', action: 'MANAGE' }
]

// الأدوار الأساسية
const basicRoles = [
  {
    name: 'مدير النظام',
    description: 'مدير النظام مع جميع الصلاحيات',
    isSystem: true,
    permissions: [] // سيتم ملؤها لاحقاً
  },
  {
    name: 'طبيب أخصائي',
    description: 'طبيب أخصائي مع صلاحيات محدودة',
    isSystem: false,
    permissions: [
      'PATIENTS_READ', 'PATIENTS_WRITE',
      'VISITS_READ', 'VISITS_WRITE',
      'TESTS_READ', 'TESTS_WRITE',
      'TREATMENTS_READ', 'TREATMENTS_WRITE',
      'OPERATIONS_READ', 'OPERATIONS_WRITE',
      'MEDICATIONS_READ', 'MEDICATIONS_WRITE',
      'PRESCRIPTIONS_READ', 'PRESCRIPTIONS_WRITE',
      'REPORTS_READ'
    ]
  },
  {
    name: 'طبيب عام',
    description: 'طبيب عام مع صلاحيات أساسية',
    isSystem: false,
    permissions: [
      'PATIENTS_READ', 'PATIENTS_WRITE',
      'VISITS_READ', 'VISITS_WRITE',
      'TESTS_READ', 'TESTS_WRITE',
      'TREATMENTS_READ', 'TREATMENTS_WRITE',
      'MEDICATIONS_READ', 'MEDICATIONS_WRITE',
      'PRESCRIPTIONS_READ', 'PRESCRIPTIONS_WRITE'
    ]
  },
  {
    name: 'موظف استقبال',
    description: 'موظف استقبال مع صلاحيات محدودة',
    isSystem: false,
    permissions: [
      'PATIENTS_READ', 'PATIENTS_WRITE',
      'VISITS_READ', 'VISITS_WRITE'
    ]
  },
  {
    name: 'موظف مختبر',
    description: 'موظف مختبر مع صلاحيات الفحوصات',
    isSystem: false,
    permissions: [
      'PATIENTS_READ',
      'TESTS_READ', 'TESTS_WRITE'
    ]
  }
]

async function setupPermissions() {
  try {
    console.log('🚀 بدء إعداد نظام الصلاحيات...')

    // 1. إنشاء الصلاحيات الأساسية
    console.log('📝 إنشاء الصلاحيات الأساسية...')
    const createdPermissions = []
    
    for (const perm of basicPermissions) {
      const existing = await prisma.permission.findFirst({
        where: {
          name: perm.name,
          resource: perm.resource,
          action: perm.action
        }
      })

      if (!existing) {
        const permission = await prisma.permission.create({
          data: perm
        })
        createdPermissions.push(permission)
        console.log(`✅ تم إنشاء الصلاحية: ${permission.name}`)
      } else {
        createdPermissions.push(existing)
        console.log(`⚠️  الصلاحية موجودة: ${existing.name}`)
      }
    }

    // 2. إنشاء الأدوار الأساسية
    console.log('👥 إنشاء الأدوار الأساسية...')
    const createdRoles = []

    for (const roleData of basicRoles) {
      const existing = await prisma.role.findFirst({
        where: { name: roleData.name }
      })

      if (!existing) {
        // تحديد الصلاحيات للدور
        let rolePermissions = []
        
        if (roleData.name === 'مدير النظام') {
          // مدير النظام يحصل على جميع الصلاحيات
          rolePermissions = createdPermissions.map(p => ({
            permissionId: p.id,
            granted: true
          }))
        } else {
          // الأدوار الأخرى تحصل على صلاحيات محددة
          const permissionMap = new Map()
          createdPermissions.forEach(p => {
            const key = `${p.resource}_${p.action}`
            permissionMap.set(key, p.id)
          })

          rolePermissions = roleData.permissions
            .map(permKey => permissionMap.get(permKey))
            .filter(Boolean)
            .map(permissionId => ({
              permissionId,
              granted: true
            }))
        }

        const role = await prisma.role.create({
          data: {
            name: roleData.name,
            description: roleData.description,
            isSystem: roleData.isSystem,
            rolePermissions: {
              create: rolePermissions
            }
          }
        })

        createdRoles.push(role)
        console.log(`✅ تم إنشاء الدور: ${role.name}`)
      } else {
        createdRoles.push(existing)
        console.log(`⚠️  الدور موجود: ${existing.name}`)
      }
    }

    // 3. تحديث المستخدمين الحاليين لاستخدام الأدوار الجديدة
    console.log('🔄 تحديث المستخدمين الحاليين...')
    const users = await prisma.user.findMany({
      include: {
        doctorProfile: true,
        staffProfile: true
      }
    })

    for (const user of users) {
      let roleId = null

      if (user.role === 'ADMIN') {
        const adminRole = createdRoles.find(r => r.name === 'مدير النظام')
        if (adminRole) roleId = adminRole.id
      } else if (user.role === 'DOCTOR') {
        // تحديد نوع الطبيب حسب التخصص
        const specialization = user.doctorProfile?.specialization || ''
        if (specialization.includes('أخصائي') || specialization.includes('استشاري')) {
          const specialistRole = createdRoles.find(r => r.name === 'طبيب أخصائي')
          if (specialistRole) roleId = specialistRole.id
        } else {
          const generalRole = createdRoles.find(r => r.name === 'طبيب عام')
          if (generalRole) roleId = generalRole.id
        }
      } else if (user.role === 'STAFF') {
        const position = user.staffProfile?.position || ''
        if (position.includes('مختبر') || position.includes('فحص')) {
          const labRole = createdRoles.find(r => r.name === 'موظف مختبر')
          if (labRole) roleId = labRole.id
        } else {
          const receptionRole = createdRoles.find(r => r.name === 'موظف استقبال')
          if (receptionRole) roleId = receptionRole.id
        }
      }

      if (roleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId }
        })
        console.log(`✅ تم تحديث دور المستخدم: ${user.email}`)
      }
    }

    console.log('🎉 تم إعداد نظام الصلاحيات بنجاح!')
    console.log(`📊 إحصائيات:`)
    console.log(`   - الصلاحيات: ${createdPermissions.length}`)
    console.log(`   - الأدوار: ${createdRoles.length}`)
    console.log(`   - المستخدمين المحدثين: ${users.length}`)

  } catch (error) {
    console.error('❌ خطأ في إعداد نظام الصلاحيات:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
if (require.main === module) {
  setupPermissions()
    .then(() => {
      console.log('✅ تم الانتهاء من إعداد نظام الصلاحيات')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ فشل في إعداد نظام الصلاحيات:', error)
      process.exit(1)
    })
}

module.exports = { setupPermissions }
