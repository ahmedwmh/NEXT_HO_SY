// نظام صلاحيات مبسط للعميل (Client-side)
// لا يستخدم Prisma Client

export interface ClientPermissionCheck {
  userId: string
  resource: string
  action: string
  hospitalId?: string
}

/**
 * دالة مبسطة للتحقق من الصلاحيات في العميل
 */
export function hasClientPermission(check: ClientPermissionCheck): boolean {
  console.log('🔐 التحقق من الصلاحية (عميل):', check)
  
  // للطبيب - السماح بجميع الصلاحيات
  if (check.userId === 'admin-user' || check.userId.includes('doctor') || check.userId === 'cmfnsw80z00004sivy8lz7tk1') {
    return true
  }
  
  // للآخرين - التحقق من الصلاحيات الافتراضية
  return checkDefaultClientPermission(check)
}

/**
 * صلاحيات افتراضية مبسطة
 */
function checkDefaultClientPermission(check: ClientPermissionCheck): boolean {
  const { resource, action, userId } = check
  
  // صلاحيات الإدمن
  if (userId === 'admin-user') {
    return true // الإدمن له جميع الصلاحيات
  }
  
  // صلاحيات الطبيب
  if (userId === 'doctor-user') {
    const doctorPermissions = {
      'PATIENTS': ['READ', 'WRITE'],
      'VISITS': ['READ', 'WRITE'],
      'TESTS': ['READ', 'WRITE'],
      'TREATMENTS': ['READ', 'WRITE'],
      'OPERATIONS': ['READ', 'WRITE'],
      'MEDICATIONS': ['READ', 'WRITE'],
      'PRESCRIPTIONS': ['READ', 'WRITE'],
      'REPORTS': ['READ'],
      'DISEASES': ['READ']
    }
    
    const allowedActions = doctorPermissions[resource as keyof typeof doctorPermissions] || []
    return allowedActions.includes(action)
  }
  
  // صلاحيات الموظف
  if (userId === 'staff-user') {
    const staffPermissions = {
      'PATIENTS': ['READ'],
      'VISITS': ['READ'],
      'TESTS': ['READ'],
      'TREATMENTS': ['READ'],
      'OPERATIONS': ['READ'],
      'MEDICATIONS': ['READ'],
      'PRESCRIPTIONS': ['READ'],
      'DISEASES': ['READ']
    }
    
    const allowedActions = staffPermissions[resource as keyof typeof staffPermissions] || []
    return allowedActions.includes(action)
  }
  
  return false
}

/**
 * دالة للحصول على معلومات المستخدم الحالي
 */
export function getCurrentUser(): { id: string; role: string; hospitalId?: string } | null {
  try {
    // محاولة جلب البيانات من localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      console.log('👤 المستخدم من localStorage:', user)
      return user
    }
    
    // تحديد المستخدم من URL
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      
      if (pathname.includes('/doctor/')) {
        return {
          id: 'doctor-user',
          role: 'DOCTOR',
          hospitalId: 'cmfnss5oe0001wfeac4r7yoem'
        }
      } else if (pathname.includes('/admin/')) {
        return {
          id: 'cmfnsw80z00004sivy8lz7tk1', // معرف الإدمن الحقيقي
          role: 'ADMIN'
        }
      } else if (pathname.includes('/employee/')) {
        return {
          id: 'staff-user',
          role: 'STAFF',
          hospitalId: 'cmfnss5oe0001wfeac4r7yoem'
        }
      }
    }
    
    // افتراضي - إدمن
    return {
      id: 'cmfnsw80z00004sivy8lz7tk1', // معرف الإدمن الحقيقي
      role: 'ADMIN'
    }
  } catch (error) {
    console.error('خطأ في جلب معلومات المستخدم:', error)
    return null
  }
}
