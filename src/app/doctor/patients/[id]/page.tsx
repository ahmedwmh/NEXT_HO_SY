'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Calendar, 
  TestTube, 
  Heart, 
  Pill, 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  Plus,
  Edit,
  Eye,
  ArrowLeft
} from 'lucide-react'
import ComprehensiveVisitSystem from '@/components/admin/comprehensive-visit-system'
import VisitDetailsModal from '@/components/admin/visit-details-modal'
import TreatmentCoursesManagement from '@/components/admin/treatment-courses-management'
import TestsManagement from '@/components/admin/tests-management'
import OperationsManagement from '@/components/admin/operations-management'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  email: string | null
  address: string | null
  bloodType: string | null
  idNumber: string | null
  nationality: string | null
  passportNumber: string | null
  profilePhoto: string | null
  insuranceNumber: string | null
  insuranceCompany: string | null
  maritalStatus: string | null
  occupation: string | null
  notes: string | null
  hospital: {
    id: string
    name: string
  }
  city: {
    id: string
    name: string
  }
  createdAt: string
}

interface PatientImage {
  id: string
  imageUrl: string
  title: string
  description: string
  type: string
  isActive: boolean
  createdAt: string
}

interface Visit {
  id: string
  scheduledAt: string
  status: string
  symptoms: string | null
  diagnosis: string | null
  notes: string | null
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialization: string
  }
  tests: Array<{
    id: string
    name: string
    description: string
    status: string
    results: string | null
    scheduledAt: string
  }>
  treatments: Array<{
    id: string
    name: string
    description: string
    status: string
    scheduledAt: string
  }>
  operations: Array<{
    id: string
    name: string
    description: string
    status: string
    scheduledAt: string
  }>
  medications: Array<{
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
  diseases: Array<{
    id: string
    name: string
    description: string
    diagnosedAt: string
    severity: string
    status: string
  }>
}

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const { hospitalId, cityId } = useDoctorDataFilter()
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patientImages, setPatientImages] = useState<PatientImage[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [showVisitDetails, setShowVisitDetails] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [showTreatmentCourses, setShowTreatmentCourses] = useState(false)
  const [selectedCourseVisitId, setSelectedCourseVisitId] = useState<string | null>(null)
  const [showTestsManagement, setShowTestsManagement] = useState(false)
  const [showOperationsManagement, setShowOperationsManagement] = useState(false)
  const [selectedTestVisitId, setSelectedTestVisitId] = useState<string | null>(null)
  const [selectedOperationVisitId, setSelectedOperationVisitId] = useState<string | null>(null)

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      
      // Fetch patient details
      const patientResponse = await fetch(`/api/patients/${patientId}`)
      const patientData = await patientResponse.json()
      
      if (patientData.success) {
        setPatient(patientData.data)
      }

      // Fetch patient images
      const imagesResponse = await fetch(`/api/patients/${patientId}/images`)
      const imagesData = await imagesResponse.json()
      
      console.log('🖼️ Images response:', imagesData)
      
      if (imagesData.success) {
        setPatientImages(imagesData.data || [])
        console.log('🖼️ Patient images set:', imagesData.data)
      }

      // Fetch patient visits
      const visitsResponse = await fetch(`/api/visits?patientId=${patientId}`)
      const visitsData = await visitsResponse.json()
      
      if (visitsData.success) {
        setVisits(visitsData.data || [])
      }

    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVisitsOnly = async () => {
    try {
      // Only fetch visits data without loading state
      const visitsResponse = await fetch(`/api/visits?patientId=${patientId}`)
      const visitsData = await visitsResponse.json()
      
      if (visitsData.success) {
        setVisits(visitsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching visits data:', error)
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3">جاري التحميل...</span>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">المريض غير موجود</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600">#{patient.patientNumber}</p>
          </div>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => setShowVisitForm(true)}
            className="bg-hospital-blue hover:bg-hospital-darkBlue"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة زيارة جديدة
          </Button>
        </div>
      </div>

      {/* Patient Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 ml-2" />
            البيانات الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                <p className="text-lg font-semibold">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">رقم المريض</label>
                <p className="text-lg font-mono">{patient.patientNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">تاريخ الميلاد</label>
                <p className="text-lg">{formatDate(patient.dateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">الجنس</label>
                <p className="text-lg">{patient.gender === 'MALE' ? 'ذكر' : 'أنثى'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">فصيلة الدم</label>
                <p className="text-lg">{patient.bloodType || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">رقم الهوية</label>
                <p className="text-lg font-mono">{patient.idNumber || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">الجنسية</label>
                <p className="text-lg">{patient.nationality || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">الحالة الاجتماعية</label>
                <p className="text-lg">{patient.maritalStatus || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">المهنة</label>
                <p className="text-lg">{patient.occupation || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">رقم التأمين</label>
                <p className="text-lg">{patient.insuranceNumber || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">شركة التأمين</label>
                <p className="text-lg">{patient.insuranceCompany || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">تاريخ التسجيل</label>
                <p className="text-lg">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 ml-2" />
            معلومات الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                <p className="text-lg">{patient.phone || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                <p className="text-lg">{patient.email || 'غير محدد'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">العنوان</label>
                <p className="text-lg">{patient.address || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">المستشفى</label>
                <p className="text-lg">{patient.hospital.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 ml-2" />
            صور المريض
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patientImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(image.imageUrl, '_blank')}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{image.title}</p>
                    <p className="text-xs text-gray-500">{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد صور للمريض</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical History Tabs */}
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visits">الزيارات</TabsTrigger>
          <TabsTrigger value="tests">الفحوصات</TabsTrigger>
          <TabsTrigger value="treatments">العلاجات</TabsTrigger>
          <TabsTrigger value="operations">العمليات</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 ml-2" />
                تاريخ الزيارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد زيارات مسجلة
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div 
                      key={visit.id} 
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedVisitId(visit.id)
                        setShowVisitDetails(true)
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          زيارة - {formatDate(visit.scheduledAt)}
                        </h3>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVisitId(visit.id)
                              setShowVisitDetails(true)
                            }}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                      {visit.doctor && (
                        <p className="text-sm text-gray-600 mb-2">
                          الطبيب: د. {visit.doctor.firstName} {visit.doctor.lastName} - {visit.doctor.specialization}
                        </p>
                      )}
                      {visit.symptoms && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>الأعراض:</strong> {visit.symptoms}
                        </p>
                      )}
                      {visit.diagnosis && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>التشخيص:</strong> {visit.diagnosis}
                        </p>
                      )}
                      {visit.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>ملاحظات:</strong> {visit.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="w-5 h-5 ml-2" />
                الفحوصات الطبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  إدارة الفحوصات الطبية للمريض
                </p>
                <Button
                  onClick={() => {
                    setSelectedTestVisitId(null)
                    setShowTestsManagement(true)
                  }}
                  className="bg-hospital-blue hover:bg-hospital-darkBlue"
                >
                  <TestTube className="h-4 w-4 ml-2" />
                  إدارة الفحوصات
                </Button>
              </div>
              
              {visits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد فحوصات متاحة
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          فحوصات زيارة - {formatDate(visit.scheduledAt)}
                        </h3>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTestVisitId(visit.id)
                              setShowTestsManagement(true)
                            }}
                          >
                            <TestTube className="h-4 w-4 ml-1" />
                            إدارة الفحوصات
                          </Button>
                        </div>
                      </div>
                      {visit.tests && visit.tests.length > 0 ? (
                        <div className="space-y-2">
                          {visit.tests.map((test, index) => (
                            <div key={test.id || index} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{test.name}</h4>
                                <Badge className={getStatusColor(test.status)}>
                                  {test.status}
                                </Badge>
                              </div>
                              {test.description && (
                                <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                              )}
                              {test.results && (
                                <p className="text-sm text-gray-800 mt-1">
                                  <strong>النتائج:</strong> {test.results}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">لا توجد فحوصات في هذه الزيارة</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 ml-2" />
                العلاجات والكورسات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  إدارة الكورسات العلاجية للمريض
                </p>
                <Button
                  onClick={() => {
                    setSelectedCourseVisitId(null)
                    setShowTreatmentCourses(true)
                  }}
                  className="bg-hospital-blue hover:bg-hospital-darkBlue"
                >
                  <Pill className="h-4 w-4 ml-2" />
                  إدارة الكورسات العلاجية
                </Button>
              </div>
              
              {visits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد علاجات متاحة
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          علاجات زيارة - {formatDate(visit.scheduledAt)}
                        </h3>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCourseVisitId(visit.id)
                              setShowTreatmentCourses(true)
                            }}
                          >
                            <Pill className="h-4 w-4 ml-1" />
                            إدارة الكورسات
                          </Button>
                        </div>
                      </div>
                      {visit.treatments && visit.treatments.length > 0 ? (
                        <div className="space-y-2">
                          {visit.treatments.map((treatment, index) => (
                            <div key={treatment.id || index} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{treatment.name}</h4>
                                <Badge className={getStatusColor(treatment.status)}>
                                  {treatment.status}
                                </Badge>
                              </div>
                              {treatment.description && (
                                <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">لا توجد علاجات في هذه الزيارة</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 ml-2" />
                العمليات الجراحية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  إدارة العمليات الجراحية للمريض
                </p>
                <Button
                  onClick={() => {
                    setSelectedOperationVisitId(null)
                    setShowOperationsManagement(true)
                  }}
                  className="bg-hospital-blue hover:bg-hospital-darkBlue"
                >
                  <Heart className="h-4 w-4 ml-2" />
                  إدارة العمليات
                </Button>
              </div>
              
              {visits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد عمليات متاحة
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          عمليات زيارة - {formatDate(visit.scheduledAt)}
                        </h3>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOperationVisitId(visit.id)
                              setShowOperationsManagement(true)
                            }}
                          >
                            <Heart className="h-4 w-4 ml-1" />
                            إدارة العمليات
                          </Button>
                        </div>
                      </div>
                      {visit.operations && visit.operations.length > 0 ? (
                        <div className="space-y-2">
                          {visit.operations.map((operation, index) => (
                            <div key={operation.id || index} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{operation.name}</h4>
                                <Badge className={getStatusColor(operation.status)}>
                                  {operation.status}
                                </Badge>
                              </div>
                              {operation.description && (
                                <p className="text-sm text-gray-600 mt-1">{operation.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">لا توجد عمليات في هذه الزيارة</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visit Form Modal */}
      {showVisitForm && (
        <ComprehensiveVisitSystem
          patientId={patientId}
          isOpen={showVisitForm}
          onClose={() => {
            setShowVisitForm(false)
            // Refresh patient data when visit form is closed
            fetchPatientData()
          }}
          defaultHospitalId={hospitalId}
          defaultCityId={cityId}
        />
      )}

      {/* Visit Details Modal */}
      {showVisitDetails && selectedVisitId && (
        <VisitDetailsModal
          isOpen={showVisitDetails}
          onClose={() => {
            setShowVisitDetails(false)
            setSelectedVisitId(null)
          }}
          visitId={selectedVisitId}
        />
      )}

      {/* Treatment Courses Management Modal */}
      {showTreatmentCourses && (
        <TreatmentCoursesManagement
          patientId={patientId}
          visitId={selectedCourseVisitId || undefined}
          isOpen={showTreatmentCourses}
          onClose={() => {
            setShowTreatmentCourses(false)
            setSelectedCourseVisitId(null)
            // Only refresh visits data, not the entire page
            fetchVisitsOnly()
          }}
        />
      )}

      {/* Tests Management Modal */}
      {showTestsManagement && (
        <TestsManagement
          patientId={patientId}
          visitId={selectedTestVisitId || undefined}
          isOpen={showTestsManagement}
          onClose={() => {
            setShowTestsManagement(false)
            setSelectedTestVisitId(null)
            // Only refresh visits data, not the entire page
            fetchVisitsOnly()
          }}
        />
      )}

      {/* Operations Management Modal */}
      {showOperationsManagement && (
        <OperationsManagement
          patientId={patientId}
          visitId={selectedOperationVisitId || undefined}
          isOpen={showOperationsManagement}
          onClose={() => {
            setShowOperationsManagement(false)
            setSelectedOperationVisitId(null)
            // Only refresh visits data, not the entire page
            fetchVisitsOnly()
          }}
        />
      )}
    </div>
  )
}
