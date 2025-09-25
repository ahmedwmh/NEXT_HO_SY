import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, requirePermission } from './permissions'
import { getAuthenticatedUser } from './auth-middleware'
import type { ResourceType, PermissionType } from '@prisma/client'

export interface PermissionMiddlewareOptions {
  resource: ResourceType
  action: PermissionType
  hospitalId?: string | ((req: NextRequest) => string | undefined)
  customCheck?: (req: NextRequest, user: any) => Promise<boolean>
  errorMessage?: string
}

/**
 * ميدلوير للتحقق من الصلاحيات
 * يمكن استخدامه في API routes
 */
export function withPermission(options: PermissionMiddlewareOptions) {
  return function permissionMiddleware(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async function(req: NextRequest, context?: any): Promise<NextResponse> {
      try {
        // جلب المستخدم المصادق عليه
        const user = await getAuthenticatedUser(req)
        
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'غير مصرح لك بالوصول' },
            { status: 401 }
          )
        }

        // التحقق من الصلاحية المخصصة
        if (options.customCheck) {
          const customAllowed = await options.customCheck(req, user)
          if (!customAllowed) {
            return NextResponse.json(
              { success: false, error: options.errorMessage || 'ليس لديك صلاحية للوصول' },
              { status: 403 }
            )
          }
        } else {
          // تحديد hospitalId
          let hospitalId = options.hospitalId
          if (typeof hospitalId === 'function') {
            hospitalId = hospitalId(req)
          }

          // التحقق من الصلاحية
          const allowed = await hasPermission({
            userId: user.id,
            resource: options.resource,
            action: options.action,
            hospitalId
          })

          if (!allowed) {
            return NextResponse.json(
              { success: false, error: options.errorMessage || `ليس لديك صلاحية ${options.action} على ${options.resource}` },
              { status: 403 }
            )
          }
        }

        // تنفيذ الـ handler الأصلي
        return await handler(req, context)
      } catch (error) {
        console.error('خطأ في ميدلوير الصلاحيات:', error)
        return NextResponse.json(
          { success: false, error: 'خطأ في التحقق من الصلاحيات' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * ميدلوير للتحقق من صلاحية الإدمن
 */
export function withAdminPermission() {
  return withPermission({
    resource: 'USERS',
    action: 'MANAGE',
    errorMessage: 'يجب أن تكون إدمن للوصول لهذه الصفحة'
  })
}

/**
 * ميدلوير للتحقق من صلاحية الطبيب
 */
export function withDoctorPermission(resource: ResourceType, action: PermissionType) {
  return withPermission({
    resource,
    action,
    errorMessage: `ليس لديك صلاحية ${action} على ${resource}`
  })
}

/**
 * ميدلوير للتحقق من صلاحية المستشفى
 */
export function withHospitalPermission(resource: ResourceType, action: PermissionType) {
  return withPermission({
    resource,
    action,
    hospitalId: (req) => {
      // جلب hospitalId من query parameters أو headers
      const url = new URL(req.url)
      return url.searchParams.get('hospitalId') || req.headers.get('x-hospital-id') || undefined
    },
    errorMessage: `ليس لديك صلاحية ${action} على ${resource} في هذا المستشفى`
  })
}

/**
 * ميدلوير للتحقق من صلاحية المريض
 */
export function withPatientPermission(action: PermissionType) {
  return withPermission({
    resource: 'PATIENTS',
    action,
    hospitalId: (req) => {
      // جلب hospitalId من مسار المريض
      const url = new URL(req.url)
      const pathParts = url.pathname.split('/')
      const patientIndex = pathParts.indexOf('patients')
      if (patientIndex !== -1 && pathParts[patientIndex + 1]) {
        // يمكن جلب hospitalId من بيانات المريض
        return undefined // سيتم تحديده لاحقاً
      }
      return undefined
    },
    errorMessage: `ليس لديك صلاحية ${action} على المرضى`
  })
}

/**
 * دالة مساعدة للتحقق من الصلاحيات في الكود
 */
export async function checkPermission(
  req: NextRequest,
  resource: ResourceType,
  action: PermissionType,
  hospitalId?: string
): Promise<{ allowed: boolean; user?: any; error?: string }> {
  try {
    const user = await getAuthenticatedUser(req)
    
    if (!user) {
      return { allowed: false, error: 'غير مصرح لك بالوصول' }
    }

    const allowed = await hasPermission({
      userId: user.id,
      resource,
      action,
      hospitalId
    })

    return { allowed, user }
  } catch (error) {
    console.error('خطأ في التحقق من الصلاحية:', error)
    return { allowed: false, error: 'خطأ في التحقق من الصلاحيات' }
  }
}

/**
 * دالة للتحقق من صلاحيات متعددة
 */
export async function checkMultiplePermissions(
  req: NextRequest,
  permissions: Array<{
    resource: ResourceType
    action: PermissionType
    hospitalId?: string
  }>
): Promise<{ allowed: boolean; user?: any; error?: string }> {
  try {
    const user = await getAuthenticatedUser(req)
    
    if (!user) {
      return { allowed: false, error: 'غير مصرح لك بالوصول' }
    }

    // التحقق من جميع الصلاحيات
    for (const permission of permissions) {
      const allowed = await hasPermission({
        userId: user.id,
        resource: permission.resource,
        action: permission.action,
        hospitalId: permission.hospitalId
      })

      if (!allowed) {
        return { 
          allowed: false, 
          user, 
          error: `ليس لديك صلاحية ${permission.action} على ${permission.resource}` 
        }
      }
    }

    return { allowed: true, user }
  } catch (error) {
    console.error('خطأ في التحقق من الصلاحيات المتعددة:', error)
    return { allowed: false, error: 'خطأ في التحقق من الصلاحيات' }
  }
}

/**
 * ميدلوير للتحقق من صلاحية الوصول للمستشفى
 */
export function withHospitalAccess() {
  return withPermission({
    resource: 'HOSPITALS',
    action: 'READ',
    customCheck: async (req, user) => {
      // التحقق من أن المستخدم مرتبط بمستشفى
      if (user.role === 'ADMIN') return true
      
      const hospitalId = req.headers.get('x-hospital-id') || 
                        new URL(req.url).searchParams.get('hospitalId')
      
      if (!hospitalId) return false
      
      // التحقق من أن المستخدم مرتبط بهذا المستشفى
      return user.hospitalId === hospitalId
    },
    errorMessage: 'ليس لديك صلاحية للوصول لهذا المستشفى'
  })
}
