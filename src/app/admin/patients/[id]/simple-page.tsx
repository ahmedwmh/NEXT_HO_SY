'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SimpleVisitForm from '@/components/admin/simple-visit-form'
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
  Trash2
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  patientNumber: string
  age: number
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
}

export default function SimplePatientPage() {
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)

  // Fetch patient data
  const fetchPatient = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${patientId}`)
      const result = await response.json()
      if (result.success) {
        setPatient(result.data)
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المريض:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch visits (including drafts)
  const fetchVisits = async () => {
    try {
      const response = await fetch(`/api/visits?patientId=${patientId}`)
      const result = await response.json()
      if (result.data) {
        setVisits(result.data)
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

  const handleNewVisit = () => {
    setEditingVisitId(null)
    setShowVisitForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">المريض غير موجود</p>
      </div>
    )
  }

  // Separate visits and drafts
  const completedVisits = visits.filter(v => v.status === 'COMPLETED')
  const draftVisits = visits.filter(v => v.status === 'DRAFT')

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
                <p>العمر: {patient.age} سنة</p>
                <p>الجنس: {patient.gender}</p>
                <p>فصيلة الدم: {patient.bloodType}</p>
                <p>الجنسية: {patient.nationality}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">معلومات الاتصال</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone}
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {patient.email}
                </p>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {patient.address}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">المعلومات الطبية</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>المستشفى: {patient.hospital.name}</p>
                <p>المدينة: {patient.hospital.city.name}</p>
                <p>الحساسيات: {patient.allergies}</p>
                <p>التاريخ المرضي: {patient.medicalHistory}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visits">الزيارات المكتملة</TabsTrigger>
            <TabsTrigger value="drafts">المسودات</TabsTrigger>
          </TabsList>

          {/* Completed Visits */}
          <TabsContent value="visits" className="space-y-4">
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
                    {completedVisits.map((visit) => (
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
                              onClick={() => handleEditVisit(visit.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Draft Visits */}
          <TabsContent value="drafts" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        {/* Visit Form Modal */}
        {showVisitForm && (
          <SimpleVisitForm
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
