'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/use-permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, ArrowLeft } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredPermission?: {
    resource: 'USERS' | 'HOSPITALS' | 'CITIES' | 'SETTINGS'
    action: 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
  }
}

/**
 * حماية الصفحات الإدارية - يمنع الوصول للدكاترة والموظفين
 */
export function AdminGuard({ 
  children, 
  fallback,
  requiredPermission = {
    resource: 'USERS',
    action: 'MANAGE'
  }
}: AdminGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  // التحقق من صلاحية الإدمن
  const { hasPermission, loading, error } = usePermissions(requiredPermission)

  useEffect(() => {
    // جلب معلومات المستخدم من localStorage أو context
    const checkUserRole = () => {
      try {
        // في التطبيق الحقيقي، يجب جلب هذه المعلومات من context المصادقة
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserRole(user.role)
        } else {
          // للاختبار - يمكن تغيير هذا
          setUserRole('ADMIN') // أو 'DOCTOR' للاختبار
        }
      } catch (error) {
        console.error('خطأ في جلب معلومات المستخدم:', error)
        setUserRole(null)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserRole()
  }, [])

  // عرض التحميل
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحقق من الصلاحيات...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // عرض خطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في النظام</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // التحقق من دور المستخدم
  if (userRole && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {userRole === 'DOCTOR' ? 'صفحة مخصصة للإدمن' : 'وصول مرفوض'}
              </h3>
              <p className="text-gray-600 mb-4">
                {userRole === 'DOCTOR' 
                  ? 'هذه الصفحة مخصصة للإدمن فقط. يرجى العودة إلى لوحة تحكم الطبيب.'
                  : 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'
                }
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/doctor')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة إلى لوحة الطبيب
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  العودة إلى الصفحة الرئيسية
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // التحقق من الصلاحية المحددة
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">صلاحية مطلوبة</h3>
              <p className="text-gray-600 mb-4">
                ليس لديك الصلاحية المطلوبة للوصول إلى هذه الصفحة.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/admin')}
                  className="w-full"
                >
                  العودة إلى لوحة الإدمن
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  العودة إلى الصفحة الرئيسية
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // عرض المحتوى المحمي
  return <>{children}</>
}

/**
 * حماية مخصصة للصفحات الحساسة
 */
export function SensitiveAdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard
      requiredPermission={{
        resource: 'USERS',
        action: 'MANAGE'
      }}
    >
      {children}
    </AdminGuard>
  )
}

/**
 * حماية للصفحات التي تحتاج صلاحية إدارة المستشفيات
 */
export function HospitalManagementGuard({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard
      requiredPermission={{
        resource: 'HOSPITALS',
        action: 'MANAGE'
      }}
    >
      {children}
    </AdminGuard>
  )
}

/**
 * حماية للصفحات التي تحتاج صلاحية إدارة المدن
 */
export function CityManagementGuard({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard
      requiredPermission={{
        resource: 'CITIES',
        action: 'MANAGE'
      }}
    >
      {children}
    </AdminGuard>
  )
}
