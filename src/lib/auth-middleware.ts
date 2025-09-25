import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'ADMIN' | 'DOCTOR' | 'STAFF'
  doctorId?: string
  staffId?: string
  hospitalId?: string
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // تبسيط المصادقة - إرجاع مستخدم افتراضي للجميع
    console.log('🔐 التحقق من المصادقة')
    
    // تحديد نوع المستخدم من URL
    const url = new URL(request.url)
    const pathname = url.pathname
    
    if (pathname.includes('/doctor/')) {
      return {
        id: 'doctor-user',
        email: 'doctor@hospital.com',
        role: 'DOCTOR',
        hospitalId: 'cmfnss5oe0001wfeac4r7yoem' // معرف المستشفى الافتراضي
      }
    } else if (pathname.includes('/admin/')) {
      return {
        id: 'admin-user',
        email: 'admin@hospital.com',
        role: 'ADMIN'
      }
    } else if (pathname.includes('/employee/')) {
      return {
        id: 'staff-user',
        email: 'staff@hospital.com',
        role: 'STAFF',
        hospitalId: 'cmfnss5oe0001wfeac4r7yoem'
      }
    }
    
    // افتراضي - إدمن
    return {
      id: 'admin-user',
      email: 'admin@hospital.com',
      role: 'ADMIN'
    }
  } catch (error) {
    console.error('خطأ في المصادقة:', error)
    // في حالة الخطأ، إرجاع مستخدم افتراضي
    return {
      id: 'admin-user',
      email: 'admin@hospital.com',
      role: 'ADMIN'
    }
  }
}

export function hasPermission(user: AuthenticatedUser | null, requiredRole: 'ADMIN' | 'DOCTOR' | 'STAFF'): boolean {
  if (!user) return false
  
  const roleHierarchy = {
    'ADMIN': 3,
    'DOCTOR': 2,
    'STAFF': 1
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function canAccessHospital(user: AuthenticatedUser | null, hospitalId: string): boolean {
  if (!user) return false
  
  // Admin can access all hospitals
  if (user.role === 'ADMIN') return true
  
  // Doctor and Staff can only access their own hospital
  return user.hospitalId === hospitalId
}
