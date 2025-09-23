'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Simplified layout: remove Tabs for clearer UX
import ComprehensiveVisitSystem from '@/components/admin/comprehensive-visit-system'
import PatientMedicalDetails from '@/components/admin/patient-medical-details'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Activity, 
  TestTube, 
  Heart, 
  Stethoscope,
  Eye,
  Edit,
  Trash2,
  Pill,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  patientNumber: string
  dateOfBirth: string
  gender: string
  bloodType: string
  nationality: string
  phone: string
  email: string
  address: string
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  allergies: string
  medicalHistory: string
}

interface Visit {
  id: string
  scheduledAt: string
  status: 'DRAFT' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  symptoms: string
  notes: string
  diagnosis: string
  currentStep: number
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialization: string
  }
  hospital?: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  tests?: Array<{
    id: string
    name: string
    description: string
    status: string
  }>
  diseases?: Array<{
    id: string
    name: string
    description: string
  }>
  treatments?: Array<{
    id: string
    name: string
    description: string
  }>
  operations?: Array<{
    id: string
    name: string
    description: string
  }>
  medications?: Array<{
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
}

export default function SimplePatientPage() {
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set())

  // Fetch patient data
  const fetchPatient = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching patient data for ID:', patientId)
      const response = await fetch(`/api/patients/${patientId}`)
      const result = await response.json()
      console.log('📋 Patient API response:', result)
      
              if (result.success && result.data) {
                setPatient(result.data)
                console.log('✅ Patient loaded successfully:', result.data.firstName, result.data.lastName)
                console.log('🏥 Hospital data:', result.data.hospital)
                console.log('🏙️ City data:', result.data.city)
                console.log('🏥 Hospital city:', result.data.hospital?.city)
              } else {
                console.error('❌ Failed to load patient:', result.error)
                setPatient(null)
              }
    } catch (error) {
      console.error('خطأ في جلب بيانات المريض:', error)
      setPatient(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch visits (including drafts)
  const fetchVisits = async () => {
    try {
      const response = await fetch(`/api/visits?patientId=${patientId}`)
      const result = await response.json()
      console.log('📋 Visits API response:', result)
      if (result.data) {
        setVisits(result.data)
        console.log('✅ Visits loaded:', result.data.length)
        
        // Log detailed visit data for debugging
        result.data.forEach((visit: any, index: number) => {
          console.log(`🔍 Visit ${index + 1} (${visit.id}):`, {
            status: visit.status,
            tests: visit.tests?.length || 0,
            diseases: visit.diseases?.length || 0,
            treatments: visit.treatments?.length || 0,
            operations: visit.operations?.length || 0,
            medications: visit.medications?.length || 0,
            testsData: visit.tests,
            diseasesData: visit.diseases,
            treatmentsData: visit.treatments,
            operationsData: visit.operations,
            medicationsData: visit.medications
          })
        })
      }
    } catch (error) {
      console.error('خطأ في جلب الزيارات:', error)
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchPatient()
      fetchVisits()
    }
  }, [patientId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'DRAFT': return 'bg-orange-100 text-orange-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'مكتملة'
      case 'SCHEDULED': return 'مجدولة'
      case 'DRAFT': return 'مسودة'
      case 'CANCELLED': return 'ملغية'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEditVisit = (visitId: string) => {
    setEditingVisitId(visitId)
    setShowVisitForm(true)
  }

  const toggleVisitExpansion = (visitId: string) => {
    console.log('🔄 Toggling visit expansion for:', visitId)
    console.log('🔄 Current expanded visits:', Array.from(expandedVisits))
    
    const newExpanded = new Set(expandedVisits)
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId)
      console.log('🔄 Collapsing visit:', visitId)
    } else {
      newExpanded.add(visitId)
      console.log('🔄 Expanding visit:', visitId)
    }
    setExpandedVisits(newExpanded)
    console.log('🔄 New expanded visits:', Array.from(newExpanded))
  }

  const handleNewVisit = () => {
    setEditingVisitId(null)
    setShowVisitForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات المريض...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-500 text-lg">المريض غير موجود</p>
            <p className="text-gray-400 text-sm mt-2">تأكد من صحة معرف المريض</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Separate visits and drafts
  const completedVisits = visits.filter(v => v.status === 'COMPLETED')
  const draftVisits = visits.filter(v => v.status === 'DRAFT')

  // Debug logging
  console.log('🔍 Current patient state:', patient)
  console.log('🔍 Hospital data:', patient?.hospital)
  // console.log('🔍 City data:', patient?.city) // City is accessed through hospital
  console.log('🔍 Hospital city:', patient?.hospital?.city)
  console.log('🔍 Visits data:', visits)
  console.log('🔍 Completed visits:', completedVisits)
  if (completedVisits.length > 0) {
    console.log('🔍 First visit details:', completedVisits[0])
    console.log('🔍 First visit tests:', completedVisits[0]?.tests)
    console.log('🔍 First visit diseases:', completedVisits[0]?.diseases)
    console.log('🔍 First visit medications:', completedVisits[0]?.medications)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">نظام إدارة المستشفى الذكي</h1>
              <p className="text-sm text-gray-600">لوحة الإدارة</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">admin@hospital.com</span>
              <Button variant="outline" size="sm">تسجيل الخروج</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-gray-600">رقم المريض: {patient.patientNumber}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                تعديل
              </Button>
              <Button onClick={handleNewVisit} size="sm">
                + زيارة جديدة
              </Button>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">المعلومات الشخصية</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>العمر: {calculateAge(patient.dateOfBirth)} سنة</p>
                <p>الجنس: {patient.gender}</p>
                <p>فصيلة الدم: {patient.bloodType}</p>
                <p>الجنسية: {patient.nationality || 'غير محدد'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">معلومات الاتصال</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone || 'غير محدد'}
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {patient.email || 'غير محدد'}
                </p>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {patient.address || 'غير محدد'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">المعلومات الطبية</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>المستشفى: {patient.hospital?.name || 'غير محدد'}</p>
                <p>المدينة: {patient.hospital?.city?.name || 'غير محدد'}</p>
                <p>الحساسيات: {patient.allergies || 'لا توجد'}</p>
                <p>التاريخ المرضي: {patient.medicalHistory || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Single-page sections for clarity */}
        <div className="space-y-6">
          {/* Completed Visits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  الزيارات المكتملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد زيارات مكتملة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedVisits.map((visit) => {
                      const isExpanded = expandedVisits.has(visit.id)
                      return (
                        <div key={visit.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <h4 className="font-semibold">
                                  {visit.doctor ? (
                                    <>
                                      د. {visit.doctor.firstName} {visit.doctor.lastName}
                                      <span className="text-sm text-gray-500 mr-2">
                                        - {visit.doctor.specialization}
                                      </span>
                                    </>
                                  ) : (
                                    'لم يتم اختيار طبيب'
                                  )}
                                </h4>
                                <Badge className={getStatusColor(visit.status)}>
                                  {getStatusText(visit.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {formatDate(visit.scheduledAt)}
                              </p>
                              {visit.symptoms && (
                                <p className="text-sm text-gray-600">
                                  الأعراض: {visit.symptoms}
                                </p>
                              )}
                              {visit.diagnosis && (
                                <p className="text-sm text-gray-600">
                                  التشخيص: {visit.diagnosis}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleVisitExpansion(visit.id)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVisit(visit.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {(() => {
                                console.log('🔍 Rendering expanded details for visit:', visit.id)
                                console.log('🔍 Visit tests:', visit.tests)
                                console.log('🔍 Visit diseases:', visit.diseases)
                                console.log('🔍 Visit medications:', visit.medications)
                                return null
                              })()}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Debug Info */}
                                {(() => {
                                  console.log('🔍 Rendering expanded details for visit:', visit.id)
                                  console.log('🔍 Visit tests:', visit.tests)
                                  console.log('🔍 Visit diseases:', visit.diseases)
                                  console.log('🔍 Visit treatments:', visit.treatments)
                                  console.log('🔍 Visit operations:', visit.operations)
                                  console.log('🔍 Visit medications:', visit.medications)
                                  console.log('🔍 Visit treatmentCourses:', (visit as any).treatmentCourses)
                                  return null
                                })()}
                                {/* Tests */}
                                {visit.tests && visit.tests.length > 0 && (
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                                      <TestTube className="w-4 h-4 mr-1" />
                                      الفحوصات ({visit.tests.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {visit.tests.map((test, index) => (
                                        <div key={index} className="text-sm text-blue-700 bg-white p-2 rounded border">
                                          <div className="font-medium">{test.name}</div>
                                          {test.description && (
                                            <div className="text-gray-600">الوصف: {test.description}</div>
                                          )}
                                          {test.status && (
                                            <div className="text-gray-600">الحالة: {test.status}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Diseases */}
                                {visit.diseases && visit.diseases.length > 0 && (
                                  <div className="bg-red-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-red-800 mb-2 flex items-center">
                                      <Heart className="w-4 h-4 mr-1" />
                                      الأمراض المشخصة ({visit.diseases.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {visit.diseases.map((disease, index) => (
                                        <div key={index} className="text-sm text-red-700 bg-white p-2 rounded border">
                                          <div className="font-medium">{disease.name}</div>
                                          {disease.description && (
                                            <div className="text-gray-600">الوصف: {disease.description}</div>
                                          )}
                                          {(disease as any).severity && (
                                            <div className="text-gray-600">الشدة: {(disease as any).severity}</div>
                                          )}
                                          {(disease as any).status && (
                                            <div className="text-gray-600">الحالة: {(disease as any).status}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Treatments */}
                                {visit.treatments && visit.treatments.length > 0 && (
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                                      <Stethoscope className="w-4 h-4 mr-1" />
                                      العلاجات ({visit.treatments.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {visit.treatments.map((treatment, index) => (
                                        <div key={index} className="text-sm text-green-700 bg-white p-2 rounded border">
                                          <div className="font-medium">{treatment.name}</div>
                                          {treatment.description && (
                                            <div className="text-gray-600">الوصف: {treatment.description}</div>
                                          )}
                                          {(treatment as any).status && (
                                            <div className="text-gray-600">الحالة: {(treatment as any).status}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Operations */}
                                {visit.operations && visit.operations.length > 0 && (
                                  <div className="bg-orange-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-orange-800 mb-2 flex items-center">
                                      <Activity className="w-4 h-4 mr-1" />
                                      العمليات ({visit.operations.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {visit.operations.map((operation, index) => (
                                        <div key={index} className="text-sm text-orange-700 bg-white p-2 rounded border">
                                          <div className="font-medium">{operation.name}</div>
                                          {operation.description && (
                                            <div className="text-gray-600">الوصف: {operation.description}</div>
                                          )}
                                          {(operation as any).status && (
                                            <div className="text-gray-600">الحالة: {(operation as any).status}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Medications */}
                                {visit.medications && visit.medications.length > 0 && (
                                  <div className="bg-purple-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-purple-800 mb-2 flex items-center">
                                      <Pill className="w-4 h-4 mr-1" />
                                      الأدوية الموصوفة ({visit.medications.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {visit.medications.map((medication, index) => (
                                        <div key={index} className="text-sm text-purple-700 bg-white p-2 rounded border">
                                          <div className="font-medium">{medication.name}</div>
                                          {medication.dosage && (
                                            <div className="text-gray-600">الجرعة: {medication.dosage}</div>
                                          )}
                                          {medication.frequency && (
                                            <div className="text-gray-600">التكرار: {medication.frequency}</div>
                                          )}
                                          {medication.duration && (
                                            <div className="text-gray-600">المدة: {medication.duration}</div>
                                          )}
                                          {medication.instructions && (
                                            <div className="text-gray-600">التعليمات: {medication.instructions}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Treatment Courses */}
                                {(visit as any).treatmentCourses && (visit as any).treatmentCourses.length > 0 && (
                                  <div className="bg-teal-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-teal-800 mb-2 flex items-center">
                                      <Stethoscope className="w-4 h-4 mr-1" />
                                      الكورسات العلاجية ({(visit as any).treatmentCourses.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {(visit as any).treatmentCourses.map((course: any, index: number) => (
                                        <div key={index} className="text-sm text-teal-700 bg-white p-2 rounded border">
                                          <div className="font-medium">{course.courseName || course.name}</div>
                                          {course.description && (
                                            <div className="text-gray-600">الوصف: {course.description}</div>
                                          )}
                                          {course.totalQuantity && (
                                            <div className="text-gray-600">الكمية الإجمالية: {course.totalQuantity}</div>
                                          )}
                                          {course.status && (
                                            <div className="text-gray-600">الحالة: {course.status}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {visit.notes && (
                                  <div className="bg-gray-50 p-3 rounded-lg md:col-span-2 lg:col-span-3">
                                    <h5 className="font-semibold text-gray-800 mb-2">ملاحظات إضافية</h5>
                                    <p className="text-sm text-gray-700">{visit.notes}</p>
                                  </div>
                                )}
                                {/* No details fallback */}
                                {!(
                                  (visit.tests && visit.tests.length > 0) ||
                                  (visit.diseases && visit.diseases.length > 0) ||
                                  (visit.treatments && visit.treatments.length > 0) ||
                                  (visit.operations && visit.operations.length > 0) ||
                                  (visit.medications && visit.medications.length > 0) ||
                                  ((visit as any).treatmentCourses && (visit as any).treatmentCourses.length > 0) ||
                                  visit.notes
                                ) && (
                                  <div className="bg-white border rounded-lg p-4 md:col-span-2 lg:col-span-3 text-center text-gray-600">
                                    لا توجد تفاصيل إضافية لهذه الزيارة
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          {/* Draft Visits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 mr-2" />
                  المسودات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {draftVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد مسودات محفوظة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {draftVisits.map((visit) => (
                      <div key={visit.id} className="p-4 border rounded-lg hover:bg-gray-50 bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h4 className="font-semibold">
                                {visit.doctor ? (
                                  <>
                                    د. {visit.doctor.firstName} {visit.doctor.lastName}
                                    <span className="text-sm text-gray-500 mr-2">
                                      - {visit.doctor.specialization}
                                    </span>
                                  </>
                                ) : (
                                  'لم يتم اختيار طبيب بعد'
                                )}
                              </h4>
                              <Badge className="bg-orange-100 text-orange-800">
                                مسودة - الخطوة {visit.currentStep} من 5
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatDate(visit.scheduledAt)}
                            </p>
                            {visit.symptoms && (
                              <p className="text-sm text-gray-600">
                                الأعراض: {visit.symptoms}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              آخر تحديث: {formatDate(visit.scheduledAt)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEditVisit(visit.id)}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              إكمال
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          {/* Medical Details */}
            <PatientMedicalDetails patientId={patientId} />
        </div>

        {/* Comprehensive Visit System Modal */}
        {showVisitForm && (
          <ComprehensiveVisitSystem
            patientId={patientId}
            isOpen={showVisitForm}
            onClose={() => {
              setShowVisitForm(false)
              setEditingVisitId(null)
              fetchVisits() // Refresh visits
            }}
            visitId={editingVisitId || undefined}
          />
        )}
      </div>
    </div>
  )
}