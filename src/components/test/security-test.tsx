'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Stethoscope, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SecurityTestProps {
  userRole?: 'ADMIN' | 'DOCTOR' | 'STAFF'
}

export default function SecurityTest({ userRole = 'DOCTOR' }: SecurityTestProps) {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const testCases = [
    {
      id: 'admin-pages',
      name: 'صفحات الإدمن',
      description: 'محاولة الوصول لصفحات الإدمن',
      urls: ['/admin', '/admin/doctors', '/admin/staff', '/admin/permissions'],
      expectedResult: userRole === 'ADMIN'
    },
    {
      id: 'doctor-pages',
      name: 'صفحات الطبيب',
      description: 'الوصول لصفحات الطبيب',
      urls: ['/doctor', '/doctor/patients', '/doctor/tests'],
      expectedResult: userRole === 'DOCTOR' || userRole === 'ADMIN'
    },
    {
      id: 'staff-pages',
      name: 'صفحات الموظف',
      description: 'الوصول لصفحات الموظف',
      urls: ['/employee', '/employee/patients'],
      expectedResult: userRole === 'STAFF' || userRole === 'ADMIN'
    }
  ]

  const runSecurityTests = async () => {
    setIsLoading(true)
    const results: Record<string, boolean> = {}

    try {
      // محاكاة تسجيل دخول المستخدم
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        role: userRole,
        firstName: 'Test',
        lastName: 'User'
      }))

      for (const testCase of testCases) {
        let allPassed = true

        for (const url of testCase.urls) {
          try {
            // محاولة الوصول للصفحة
            const response = await fetch(url, {
              method: 'HEAD',
              headers: {
                'x-user-id': 'test-user',
                'x-user-role': userRole
              }
            })

            // التحقق من النتيجة المتوقعة
            const hasAccess = response.status !== 403 && response.status !== 401
            const expectedAccess = testCase.expectedResult

            if (hasAccess !== expectedAccess) {
              allPassed = false
              console.warn(`❌ فشل في ${url}: متوقع ${expectedAccess}, حصل على ${hasAccess}`)
            } else {
              console.log(`✅ نجح في ${url}`)
            }
          } catch (error) {
            console.error(`خطأ في اختبار ${url}:`, error)
            allPassed = false
          }
        }

        results[testCase.id] = allPassed
      }

      setTestResults(results)
    } catch (error) {
      console.error('خطأ في تشغيل الاختبارات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge className={passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {passed ? 'نجح' : 'فشل'}
      </Badge>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Shield className="h-6 w-6 text-blue-500" />
            <span>اختبار أمان النظام</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">اختبار الصلاحيات</h3>
                <p className="text-gray-600">
                  اختبار وصول المستخدم بدور <Badge variant="outline">{userRole}</Badge> للصفحات المختلفة
                </p>
              </div>
              <Button 
                onClick={runSecurityTests} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'جاري الاختبار...' : 'تشغيل الاختبارات'}
              </Button>
            </div>

            <div className="grid gap-4">
              {testCases.map((testCase) => (
                <Card key={testCase.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {testResults[testCase.id] !== undefined && getStatusIcon(testResults[testCase.id])}
                        <div>
                          <h4 className="font-semibold">{testCase.name}</h4>
                          <p className="text-sm text-gray-600">{testCase.description}</p>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              الصفحات: {testCase.urls.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {testResults[testCase.id] !== undefined && getStatusBadge(testResults[testCase.id])}
                        <Badge variant="outline">
                          متوقع: {testCase.expectedResult ? 'مسموح' : 'ممنوع'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {Object.keys(testResults).length > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">ملخص النتائج:</h4>
                  <div className="space-y-2">
                    {Object.entries(testResults).map(([testId, passed]) => {
                      const testCase = testCases.find(tc => tc.id === testId)
                      return (
                        <div key={testId} className="flex items-center justify-between">
                          <span className="text-sm">{testCase?.name}</span>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {getStatusIcon(passed)}
                            <span className="text-sm font-medium">
                              {passed ? 'نجح' : 'فشل'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">ملاحظة مهمة</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    هذا الاختبار يتحقق من الحماية الأساسية. في التطبيق الحقيقي، 
                    يجب اختبار جميع الصفحات والوظائف للتأكد من عدم وجود ثغرات أمنية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
