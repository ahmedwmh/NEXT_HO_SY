'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Stethoscope, Users, ArrowRight, AlertTriangle } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: ('ADMIN' | 'DOCTOR' | 'STAFF')[]
  redirectTo?: string
}

/**
 * حماية الصفحات حسب دور المستخدم
 */
export function RoleGuard({ 
  children, 
  allowedRoles = ['ADMIN', 'DOCTOR', 'STAFF'],
  redirectTo
}: RoleGuardProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          setUser(user)
          
          // التحقق من الدور المسموح
          if (!allowedRoles.includes(user.role)) {
            if (redirectTo) {
              router.push(redirectTo)
            } else {
              // توجيه حسب الدور
              switch (user.role) {
                case 'ADMIN':
                  router.push('/admin')
                  break
                case 'DOCTOR':
                  router.push('/doctor')
                  break
                case 'STAFF':
                  router.push('/employee')
                  break
                default:
                  router.push('/')
              }
            }
          }
        } else {
          // لا يوجد مستخدم مسجل دخول
          router.push('/')
        }
      } catch (error) {
        console.error('خطأ في التحقق من دور المستخدم:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [allowedRoles, redirectTo, router])

  if (loading) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">غير مصرح لك بالوصول</h3>
              <p className="text-gray-600 mb-4">يجب تسجيل الدخول أولاً</p>
              <Button onClick={() => router.push('/')}>
                العودة إلى الصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                {user.role === 'ADMIN' && <Shield className="h-12 w-12 text-blue-500 mx-auto" />}
                {user.role === 'DOCTOR' && <Stethoscope className="h-12 w-12 text-green-500 mx-auto" />}
                {user.role === 'STAFF' && <Users className="h-12 w-12 text-purple-500 mx-auto" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user.role === 'ADMIN' && 'صفحة مخصصة للإدمن'}
                {user.role === 'DOCTOR' && 'صفحة مخصصة للطبيب'}
                {user.role === 'STAFF' && 'صفحة مخصصة للموظف'}
              </h3>
              <p className="text-gray-600 mb-4">
                هذه الصفحة مخصصة لـ {allowedRoles.join(' أو ')} فقط
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    switch (user.role) {
                      case 'ADMIN':
                        router.push('/admin')
                        break
                      case 'DOCTOR':
                        router.push('/doctor')
                        break
                      case 'STAFF':
                        router.push('/employee')
                        break
                      default:
                        router.push('/')
                    }
                  }}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  الذهاب إلى لوحة التحكم المناسبة
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

  return <>{children}</>
}

/**
 * حماية خاصة بصفحات الإدمن
 */
export function AdminOnlyGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      {children}
    </RoleGuard>
  )
}

/**
 * حماية خاصة بصفحات الطبيب
 */
export function DoctorOnlyGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['DOCTOR']}>
      {children}
    </RoleGuard>
  )
}

/**
 * حماية خاصة بصفحات الموظف
 */
export function StaffOnlyGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['STAFF']}>
      {children}
    </RoleGuard>
  )
}

/**
 * حماية للطبيب والإدمن
 */
export function DoctorAndAdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}>
      {children}
    </RoleGuard>
  )
}

/**
 * حماية لجميع المستخدمين المسجلين
 */
export function AuthenticatedGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'DOCTOR', 'STAFF']}>
      {children}
    </RoleGuard>
  )
}
