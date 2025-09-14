'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Activity,
  TestTube,
  Stethoscope,
  Heart,
  AlertTriangle,
  Edit,
  Plus
} from 'lucide-react'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: string
  phone: string
  email?: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies?: string[]
  medicalHistory?: string
  nationality?: string
  idNumber?: string
  passportNumber?: string
  city?: string
  insuranceNumber?: string
  insuranceCompany?: string
  maritalStatus?: string
  occupation?: string
  notes?: string
  isActive: boolean
  hospitalId: string
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  createdAt: string
  profilePhoto?: string
}

interface Visit {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  diagnosis?: string
  prescription?: string
  symptoms?: string
  vitalSigns?: string
  temperature?: string
  bloodPressure?: string
  heartRate?: string
  weight?: string
  height?: string
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialization: string
  }
  hospital: {
    id: string
    name: string
  }
  createdAt: string
}

interface Test {
  id: string
  name: string
  description?: string
  scheduledAt: string
  status: string
  results?: string
  notes?: string
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialization: string
  }
  hospital: {
    id: string
    name: string
  }
  createdAt: string
}

export default function PatientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient')
      }
      
      return response.json()
    },
    enabled: !!patientId,
  })

  // Fetch patient visits
  const { data: visits, isLoading: visitsLoading } = useQuery({
    queryKey: ['patient-visits', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}/visits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch visits')
      }
      
      return response.json()
    },
    enabled: !!patientId,
  })

  // Fetch patient tests
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['patient-tests', patientId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}/tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch tests')
      }
      
      return response.json()
    },
    enabled: !!patientId,
  })

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Patient not found</h3>
        <p className="text-gray-600 mb-4">The patient you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'SCHEDULED': { variant: 'outline' as const, label: 'مجدولة' },
      'IN_PROGRESS': { variant: 'default' as const, label: 'جارية' },
      'COMPLETED': { variant: 'secondary' as const, label: 'مكتملة' },
      'CANCELLED': { variant: 'destructive' as const, label: 'ملغية' },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600">رقم المريض: {patient.patientNumber}</p>
          </div>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            تعديل
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            زيارة جديدة
          </Button>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">العمر</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} سنة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">الزيارات</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <TestTube className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">الفحوصات</p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">فصيلة الدم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patient.bloodType || 'غير محدد'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">المعلومات الشخصية</TabsTrigger>
          <TabsTrigger value="visits">الزيارات</TabsTrigger>
          <TabsTrigger value="tests">الفحوصات</TabsTrigger>
          <TabsTrigger value="medical">التاريخ الطبي</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="h-5 w-5" />
                  <span>المعلومات الأساسية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">الاسم الكامل</p>
                    <p className="text-gray-900">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">تاريخ الميلاد</p>
                    <p className="text-gray-900">{formatDate(patient.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">الجنس</p>
                    <p className="text-gray-900">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">الجنسية</p>
                    <p className="text-gray-900">{patient.nationality || 'غير محدد'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Phone className="h-5 w-5" />
                  <span>معلومات الاتصال</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.phone || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.email || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.address || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.emergencyContact || 'غير محدد'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <MapPin className="h-5 w-5" />
                  <span>المستشفى</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">المستشفى</p>
                  <p className="text-gray-900">{patient.hospital.name}</p>
                  <p className="text-sm text-gray-600">{patient.hospital.city.name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Medical Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Stethoscope className="h-5 w-5" />
                  <span>المعلومات الطبية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">فصيلة الدم</p>
                    <p className="text-gray-900">{patient.bloodType || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">الحساسية</p>
                    <p className="text-gray-900">
                      {patient.allergies?.length ? patient.allergies.join(', ') : 'لا توجد'}
                    </p>
                  </div>
                </div>
                {patient.medicalHistory && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">التاريخ الطبي</p>
                    <p className="text-gray-900 text-sm">{patient.medicalHistory}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Activity className="h-5 w-5" />
                <span>زيارات المريض</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading visits...</p>
                </div>
              ) : visits?.data?.length ? (
                <div className="space-y-4">
                  {visits.data.map((visit: Visit) => (
                    <div key={visit.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDateTime(visit.scheduledAt)}
                            </p>
                            <p className="text-sm text-gray-600">
                              د. {visit.doctor.firstName} {visit.doctor.lastName} - {visit.doctor.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {getStatusBadge(visit.status)}
                        </div>
                      </div>
                      {visit.diagnosis && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600">التشخيص</p>
                          <p className="text-sm text-gray-900">{visit.diagnosis}</p>
                        </div>
                      )}
                      {visit.notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600">ملاحظات</p>
                          <p className="text-sm text-gray-900">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد زيارات مسجلة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <TestTube className="h-5 w-5" />
                <span>فحوصات المريض</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading tests...</p>
                </div>
              ) : tests?.data?.length ? (
                <div className="space-y-4">
                  {tests.data.map((test: Test) => (
                    <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <TestTube className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{test.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(test.scheduledAt)} - د. {test.doctor.firstName} {test.doctor.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {getStatusBadge(test.status)}
                        </div>
                      </div>
                      {test.description && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600">الوصف</p>
                          <p className="text-sm text-gray-900">{test.description}</p>
                        </div>
                      )}
                      {test.results && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600">النتائج</p>
                          <p className="text-sm text-gray-900">{test.results}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد فحوصات مسجلة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <FileText className="h-5 w-5" />
                <span>التاريخ الطبي</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">التاريخ الطبي السابق</h4>
                  <p className="text-gray-600">
                    {patient.medicalHistory || 'لا يوجد تاريخ طبي مسجل'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">الحساسية</h4>
                  <p className="text-gray-600">
                    {patient.allergies?.length ? patient.allergies.join(', ') : 'لا توجد حساسية مسجلة'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات إضافية</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">رقم الهوية</p>
                      <p className="text-gray-900">{patient.idNumber || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">رقم جواز السفر</p>
                      <p className="text-gray-900">{patient.passportNumber || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">رقم التأمين</p>
                      <p className="text-gray-900">{patient.insuranceNumber || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">شركة التأمين</p>
                      <p className="text-gray-900">{patient.insuranceCompany || 'غير محدد'}</p>
                    </div>
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