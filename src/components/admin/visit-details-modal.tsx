'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Calendar, 
  User, 
  Building, 
  MapPin, 
  Stethoscope,
  TestTube,
  Heart,
  Pill,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface VisitDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  visitId: string
}

interface VisitDetails {
  id: string
  patientId: string
  doctorId?: string
  hospitalId?: string
  cityId?: string
  scheduledAt: string
  status: string
  currentStep: number
  notes?: string
  diagnosis?: string
  symptoms?: string
  vitalSigns?: string
  temperature?: string
  bloodPressure?: string
  heartRate?: string
  weight?: string
  height?: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    patientNumber: string
    profilePhoto?: string
  }
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
  city?: {
    id: string
    name: string
  }
  tests?: Array<{
    id: string
    name: string
    description: string
    status: string
    results?: string
    scheduledAt: string
    notes?: string
  }>
  treatments?: Array<{
    id: string
    name: string
    description: string
    status: string
    scheduledAt: string
    notes?: string
  }>
  operations?: Array<{
    id: string
    name: string
    description: string
    status: string
    scheduledAt: string
    notes?: string
  }>
  medications?: Array<{
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
    startDate: string
    endDate?: string
  }>
  diseases?: Array<{
    id: string
    name: string
    description: string
    diagnosedAt: string
    severity: string
    status: string
    notes?: string
  }>
  treatmentCourses?: Array<{
    id: string
    courseName: string
    description: string
    totalQuantity: number
    reservedQuantity: number
    deliveredQuantity: number
    remainingQuantity: number
    startDate: string
    endDate?: string
    status: string
    instructions: string
    notes: string
    hospitalTreatment: {
      id: string
      name: string
      category: string
    }
    doses: Array<{
      id: string
      doseNumber: number
      scheduledDate: string
      scheduledTime: string
      quantity: number
      status: string
      takenAt?: string
      takenDate?: string
      isTaken: boolean
      isOnTime: boolean
      notes: string
      sideEffects: string
      takenBy?: string
    }>
  }>
  createdAt: string
  updatedAt: string
}

export default function VisitDetailsModal({ isOpen, onClose, visitId }: VisitDetailsModalProps) {
  const [visit, setVisit] = useState<VisitDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && visitId) {
      fetchVisitDetails()
    }
  }, [isOpen, visitId])

  const fetchVisitDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/visits/${visitId}`)
      const data = await response.json()
      
      if (data.success) {
        setVisit(data.data)
      } else {
        setError(data.error || 'فشل في جلب تفاصيل الزيارة')
      }
    } catch (err) {
      console.error('Error fetching visit details:', err)
      setError('حدث خطأ في جلب تفاصيل الزيارة')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'مجدولة'
      case 'IN_PROGRESS': return 'جارية'
      case 'COMPLETED': return 'مكتملة'
      case 'CANCELLED': return 'ملغية'
      case 'DRAFT': return 'مسودة'
      default: return status
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <FileText className="h-6 w-6 text-hospital-blue" />
            <h2 className="text-2xl font-bold text-gray-900">تفاصيل الزيارة</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-blue"></div>
              <span className="mr-3 text-gray-600">جاري التحميل...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 text-lg">{error}</p>
              <Button onClick={fetchVisitDetails} className="mt-4">
                إعادة المحاولة
              </Button>
            </div>
          ) : visit ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 ml-2" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">تاريخ ووقت الزيارة</label>
                      <p className="text-lg font-semibold">{formatDateTime(visit.scheduledAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">الحالة</label>
                      <Badge className={getStatusColor(visit.status)}>
                        {getStatusText(visit.status)}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">الخطوة الحالية</label>
                      <p className="text-lg font-semibold">{visit.currentStep} من 5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Information */}
              {visit.patient && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 ml-2" />
                      معلومات المريض
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                        <p className="text-lg font-semibold">
                          {visit.patient.firstName} {visit.patient.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">رقم المريض</label>
                        <p className="text-lg font-mono">{visit.patient.patientNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Doctor Information */}
              {visit.doctor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="h-5 w-5 ml-2" />
                      معلومات الطبيب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">الاسم</label>
                        <p className="text-lg font-semibold">
                          د. {visit.doctor.firstName} {visit.doctor.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">التخصص</label>
                        <p className="text-lg">{visit.doctor.specialization}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hospital Information */}
              {visit.hospital && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 ml-2" />
                      معلومات المستشفى
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">اسم المستشفى</label>
                        <p className="text-lg font-semibold">{visit.hospital.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">المدينة</label>
                        <p className="text-lg">{visit.hospital.city.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Information */}
              {(visit.symptoms || visit.diagnosis || visit.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 ml-2" />
                      المعلومات الطبية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visit.symptoms && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">الأعراض</label>
                          <p className="text-lg">{visit.symptoms}</p>
                        </div>
                      )}
                      {visit.diagnosis && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">التشخيص</label>
                          <p className="text-lg">{visit.diagnosis}</p>
                        </div>
                      )}
                      {visit.notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">ملاحظات</label>
                          <p className="text-lg">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vital Signs */}
              {(visit.temperature || visit.bloodPressure || visit.heartRate || visit.weight || visit.height) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 ml-2" />
                      العلامات الحيوية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visit.temperature && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">درجة الحرارة</label>
                          <p className="text-lg font-semibold">{visit.temperature}</p>
                        </div>
                      )}
                      {visit.bloodPressure && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">ضغط الدم</label>
                          <p className="text-lg font-semibold">{visit.bloodPressure}</p>
                        </div>
                      )}
                      {visit.heartRate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">معدل النبض</label>
                          <p className="text-lg font-semibold">{visit.heartRate}</p>
                        </div>
                      )}
                      {visit.weight && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">الوزن</label>
                          <p className="text-lg font-semibold">{visit.weight}</p>
                        </div>
                      )}
                      {visit.height && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">الطول</label>
                          <p className="text-lg font-semibold">{visit.height}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tests */}
              {visit.tests && visit.tests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TestTube className="h-5 w-5 ml-2" />
                      الفحوصات ({visit.tests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {visit.tests.map((test, index) => (
                        <div key={test.id || index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{test.name}</h4>
                            <Badge className={getStatusColor(test.status)}>
                              {getStatusText(test.status)}
                            </Badge>
                          </div>
                          {test.description && (
                            <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                          )}
                          {test.results && (
                            <p className="text-sm text-gray-800 mb-2">
                              <strong>النتائج:</strong> {test.results}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline ml-1" />
                            {formatDateTime(test.scheduledAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Diseases */}
              {visit.diseases && visit.diseases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 ml-2" />
                      الأمراض ({visit.diseases.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {visit.diseases.map((disease, index) => (
                        <div key={disease.id || index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{disease.name}</h4>
                            <Badge className={getStatusColor(disease.status)}>
                              {getStatusText(disease.status)}
                            </Badge>
                          </div>
                          {disease.description && (
                            <p className="text-sm text-gray-600 mb-2">{disease.description}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">الشدة:</span> {disease.severity}
                            </div>
                            <div>
                              <span className="text-gray-500">تاريخ التشخيص:</span> {formatDate(disease.diagnosedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Treatments */}
              {visit.treatments && visit.treatments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Pill className="h-5 w-5 ml-2" />
                      العلاجات ({visit.treatments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {visit.treatments.map((treatment, index) => (
                        <div key={treatment.id || index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{treatment.name}</h4>
                            <Badge className={getStatusColor(treatment.status)}>
                              {getStatusText(treatment.status)}
                            </Badge>
                          </div>
                          {treatment.description && (
                            <p className="text-sm text-gray-600 mb-2">{treatment.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline ml-1" />
                            {formatDateTime(treatment.scheduledAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operations */}
              {visit.operations && visit.operations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 ml-2" />
                      العمليات ({visit.operations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {visit.operations.map((operation, index) => (
                        <div key={operation.id || index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{operation.name}</h4>
                            <Badge className={getStatusColor(operation.status)}>
                              {getStatusText(operation.status)}
                            </Badge>
                          </div>
                          {operation.description && (
                            <p className="text-sm text-gray-600 mb-2">{operation.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline ml-1" />
                            {formatDateTime(operation.scheduledAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medications */}
              {visit.medications && visit.medications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Pill className="h-5 w-5 ml-2" />
                      الأدوية ({visit.medications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {visit.medications.map((medication, index) => (
                        <div key={medication.id || index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{medication.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">الجرعة:</span> {medication.dosage}
                            </div>
                            <div>
                              <span className="text-gray-500">التكرار:</span> {medication.frequency}
                            </div>
                            <div>
                              <span className="text-gray-500">المدة:</span> {medication.duration}
                            </div>
                            <div>
                              <span className="text-gray-500">تاريخ البداية:</span> {formatDate(medication.startDate)}
                            </div>
                          </div>
                          {medication.instructions && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>التعليمات:</strong> {medication.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Treatment Courses */}
              {visit.treatmentCourses && visit.treatmentCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Pill className="h-5 w-5 ml-2" />
                      الكورسات العلاجية ({visit.treatmentCourses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visit.treatmentCourses.map((course, index) => (
                        <div key={course.id || index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{course.courseName}</h4>
                            <Badge className={getStatusColor(course.status)}>
                              {getStatusText(course.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-sm text-gray-500">العلاج:</span>
                              <p className="font-medium">{course.hospitalTreatment.name}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">الفئة:</span>
                              <p className="font-medium">{course.hospitalTreatment.category}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">الكمية الإجمالية:</span> {course.totalQuantity}
                            </div>
                            <div>
                              <span className="text-gray-500">المحجوزة:</span> {course.reservedQuantity}
                            </div>
                            <div>
                              <span className="text-gray-500">المسلمة:</span> {course.deliveredQuantity}
                            </div>
                            <div>
                              <span className="text-gray-500">المتبقية:</span> {course.remainingQuantity}
                            </div>
                          </div>

                          {course.description && (
                            <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                          )}

                          {course.instructions && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>التعليمات:</strong> {course.instructions}
                            </p>
                          )}

                          {course.doses && course.doses.length > 0 && (
                            <div className="mt-3">
                              <h5 className="font-medium mb-2">الجرعات ({course.doses.length})</h5>
                              <div className="space-y-2">
                                {course.doses.map((dose, doseIndex) => (
                                  <div key={dose.id || doseIndex} className="bg-gray-50 rounded p-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span>الجرعة {dose.doseNumber}</span>
                                      <Badge className={getStatusColor(dose.status)}>
                                        {getStatusText(dose.status)}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      <Clock className="h-3 w-3 inline ml-1" />
                                      {formatDateTime(dose.scheduledDate)} - {dose.scheduledTime}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  )
}
