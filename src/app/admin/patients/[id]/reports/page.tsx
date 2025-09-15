'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar,
  Activity,
  TestTube,
  Stethoscope,
  Heart,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodType: string
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
}

interface Visit {
  id: string
  scheduledAt: string
  status: string
  diagnosis?: string
  symptoms?: string
  vitalSigns?: string
  temperature?: string
  bloodPressure?: string
  heartRate?: string
  weight?: string
  height?: string
  doctor: {
    firstName: string
    lastName: string
    specialization: string
  }
  hospital: {
    name: string
  }
}

interface Test {
  id: string
  name: string
  scheduledAt: string
  status: string
  results?: string
  doctor: {
    firstName: string
    lastName: string
    specialization: string
  }
  hospital: {
    name: string
  }
}

export default function PatientReportsPage() {
  const params = useParams()
  const patientId = params.id as string

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      return response.json()
    },
    enabled: !!patientId,
  })

  // Fetch visits
  const { data: visits } = useQuery({
    queryKey: ['patient-visits', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}/visits`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      return response.json()
    },
    enabled: !!patientId,
  })

  // Fetch tests
  const { data: tests } = useQuery({
    queryKey: ['patient-tests', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}/tests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      return response.json()
    },
    enabled: !!patientId,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generateVisitReport = () => {
    if (!visits?.data?.length) return 'لا توجد زيارات مسجلة'

    let report = `تقرير زيارات المريض: ${patient.firstName} ${patient.lastName}\n`
    report += `رقم المريض: ${patient.patientNumber}\n`
    report += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}\n\n`

    visits.data.forEach((visit: Visit, index: number) => {
      report += `الزيارة ${index + 1}:\n`
      report += `- التاريخ: ${formatDateTime(visit.scheduledAt)}\n`
      report += `- الطبيب: د. ${visit.doctor.firstName} ${visit.doctor.lastName} - ${visit.doctor.specialization}\n`
      report += `- المستشفى: ${visit.hospital.name}\n`
      report += `- الحالة: ${visit.status}\n`
      if (visit.diagnosis) report += `- التشخيص: ${visit.diagnosis}\n`
      if (visit.symptoms) report += `- الأعراض: ${visit.symptoms}\n`
      if (visit.vitalSigns) report += `- العلامات الحيوية: ${visit.vitalSigns}\n`
      report += '\n'
    })

    return report
  }

  const generateTestReport = () => {
    if (!tests?.data?.length) return 'لا توجد فحوصات مسجلة'

    let report = `تقرير فحوصات المريض: ${patient.firstName} ${patient.lastName}\n`
    report += `رقم المريض: ${patient.patientNumber}\n`
    report += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}\n\n`

    tests.data.forEach((test: Test, index: number) => {
      report += `الفحص ${index + 1}:\n`
      report += `- نوع الفحص: ${test.name}\n`
      report += `- التاريخ: ${formatDateTime(test.scheduledAt)}\n`
      report += `- الطبيب: د. ${test.doctor.firstName} ${test.doctor.lastName} - ${test.doctor.specialization}\n`
      report += `- المستشفى: ${test.hospital.name}\n`
      report += `- الحالة: ${test.status}\n`
      if (test.results) report += `- النتائج: ${test.results}\n`
      report += '\n'
    })

    return report
  }

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Patient not found</h3>
        <p className="text-gray-600">The patient you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              تقارير المريض - {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600">رقم المريض: {patient.patientNumber}</p>
          </div>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => downloadReport(generateVisitReport(), `visits-${patient.patientNumber}.txt`)}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            تحميل تقرير الزيارات
          </Button>
          <Button
            onClick={() => downloadReport(generateTestReport(), `tests-${patient.patientNumber}.txt`)}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            تحميل تقرير الفحوصات
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الزيارات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits?.data?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-green-100 rounded-lg">
                <TestTube className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الفحوصات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests?.data?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">الزيارات المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits?.data?.filter((v: Visit) => v.status === 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">الفحوصات المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests?.data?.filter((t: Test) => t.status === 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="visits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visits">تقرير الزيارات</TabsTrigger>
          <TabsTrigger value="tests">تقرير الفحوصات</TabsTrigger>
          <TabsTrigger value="summary">ملخص شامل</TabsTrigger>
        </TabsList>

        {/* Visits Report */}
        <TabsContent value="visits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Activity className="h-5 w-5" />
                <span>تقرير الزيارات التفصيلي</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generateVisitReport()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Report */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <TestTube className="h-5 w-5" />
                <span>تقرير الفحوصات التفصيلي</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generateTestReport()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Report */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <PieChart className="h-5 w-5" />
                <span>ملخص شامل للمريض</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">المعلومات الشخصية</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">الاسم:</span> {patient.firstName} {patient.lastName}</p>
                      <p><span className="font-medium">رقم المريض:</span> {patient.patientNumber}</p>
                      <p><span className="font-medium">العمر:</span> {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} سنة</p>
                      <p><span className="font-medium">الجنس:</span> {patient.gender}</p>
                      <p><span className="font-medium">فصيلة الدم:</span> {patient.bloodType || 'غير محدد'}</p>
                      <p><span className="font-medium">المستشفى:</span> {patient.hospital.name}</p>
                      <p><span className="font-medium">المدينة:</span> {patient.hospital.city.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">إحصائيات طبية</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">إجمالي الزيارات:</span> {visits?.data?.length || 0}</p>
                      <p><span className="font-medium">الزيارات المكتملة:</span> {visits?.data?.filter((v: Visit) => v.status === 'COMPLETED').length || 0}</p>
                      <p><span className="font-medium">الزيارات المجدولة:</span> {visits?.data?.filter((v: Visit) => v.status === 'SCHEDULED').length || 0}</p>
                      <p><span className="font-medium">إجمالي الفحوصات:</span> {tests?.data?.length || 0}</p>
                      <p><span className="font-medium">الفحوصات المكتملة:</span> {tests?.data?.filter((t: Test) => t.status === 'COMPLETED').length || 0}</p>
                      <p><span className="font-medium">الفحوصات المجدولة:</span> {tests?.data?.filter((t: Test) => t.status === 'SCHEDULED').length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">آخر الأنشطة</h4>
                  <div className="space-y-2 text-sm">
                    {visits?.data?.slice(0, 3).map((visit: Visit, index: number) => (
                      <div key={visit.id} className="flex items-center space-x-3 rtl:space-x-reverse p-2 bg-gray-50 rounded">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>زيارة مع د. {visit.doctor.firstName} {visit.doctor.lastName} - {formatDate(visit.scheduledAt)}</span>
                      </div>
                    ))}
                    {tests?.data?.slice(0, 3).map((test: Test, index: number) => (
                      <div key={test.id} className="flex items-center space-x-3 rtl:space-x-reverse p-2 bg-gray-50 rounded">
                        <TestTube className="h-4 w-4 text-green-600" />
                        <span>فحص {test.name} - {formatDate(test.scheduledAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

