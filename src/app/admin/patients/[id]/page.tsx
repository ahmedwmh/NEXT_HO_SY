'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageGallery } from '@/components/ui/image-gallery'
import { ComprehensiveVisitForm } from '@/components/admin/comprehensive-visit-form'
import { TestForm } from '@/components/admin/test-form'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Activity, 
  TestTube, 
  Heart, 
  Pill,
  FileText,
  Plus,
  Edit,
  Eye
} from 'lucide-react'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: string
  nationality?: string
  phone?: string
  email?: string
  address?: string
  emergencyContact?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  city: {
    id: string
    name: string
  }
  hospital: {
    id: string
    name: string
  }
  visits: Array<{
    id: string
    scheduledAt: string
    status: string
    diagnosis?: string
    doctor: {
      firstName: string
      lastName: string
      specialization: string
    }
  }>
  tests: Array<{
    id: string
    name: string
    scheduledAt: string
    status: string
    results?: string
    doctor: {
      firstName: string
      lastName: string
    }
  }>
  treatments: Array<{
    id: string
    name: string
    scheduledAt: string
    status: string
    doctor: {
      firstName: string
      lastName: string
    }
  }>
  operations: Array<{
    id: string
    name: string
    scheduledAt: string
    status: string
    doctor: {
      firstName: string
      lastName: string
    }
  }>
  medications: Array<{
    id: string
    name: string
    dosage?: string
    frequency?: string
    duration?: string
    startDate: string
    endDate?: string
    status: string
    doctor: {
      firstName: string
      lastName: string
    }
  }>
  diseases: Array<{
    id: string
    name: string
    diagnosedAt: string
    severity?: string
    status?: string
  }>
  images: Array<{
    id: string
    imageUrl: string
    title?: string
    description?: string
    type?: string
  }>
}

export default function PatientProfilePage() {
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [showTestForm, setShowTestForm] = useState(false)
  const [showTreatmentForm, setShowTreatmentForm] = useState(false)
  const [showDiseaseForm, setShowDiseaseForm] = useState(false)
  const [showOperationForm, setShowOperationForm] = useState(false)

  useEffect(() => {
    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      const data = await response.json()
      setPatient(data)
    } catch (error) {
      console.error('خطأ في جلب بيانات المريض:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Cured': return 'bg-blue-100 text-blue-800'
      case 'Chronic': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'مكتمل'
      case 'SCHEDULED': return 'مجدول'
      case 'IN_PROGRESS': return 'قيد التنفيذ'
      case 'CANCELLED': return 'ملغي'
      case 'Active': return 'نشط'
      case 'Cured': return 'شفاء'
      case 'Chronic': return 'مزمن'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">المريض غير موجود</div>
      </div>
    )
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-gray-600">
                  رقم المريض: <span className="font-mono font-semibold">{patient.patientNumber}</span>
                </p>
              </div>
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button variant="outline">
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              <Button onClick={() => setShowVisitForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                زيارة جديدة
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">المعلومات الشخصية</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">العمر:</span> {age} سنة</p>
                <p><span className="font-medium">الجنس:</span> {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                <p><span className="font-medium">فصيلة الدم:</span> {patient.bloodType || 'غير محدد'}</p>
                <p><span className="font-medium">الجنسية:</span> {patient.nationality || 'غير محدد'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">معلومات الاتصال</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {patient.phone && (
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 ml-1" />
                    {patient.phone}
                  </p>
                )}
                {patient.email && (
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 ml-1" />
                    {patient.email}
                  </p>
                )}
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 ml-1" />
                  {patient.city.name}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">المعلومات الطبية</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">المستشفى:</span> {patient.hospital.name}</p>
                <p><span className="font-medium">الحساسيات:</span> {patient.allergies || 'لا توجد'}</p>
                <p><span className="font-medium">التاريخ المرضي:</span> {patient.medicalHistory || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Data Tabs */}
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="visits">الزيارات</TabsTrigger>
          <TabsTrigger value="tests">الفحوصات</TabsTrigger>
          <TabsTrigger value="treatments">العلاجات</TabsTrigger>
          <TabsTrigger value="operations">العمليات</TabsTrigger>
          <TabsTrigger value="medications">الأدوية</TabsTrigger>
          <TabsTrigger value="diseases">الأمراض</TabsTrigger>
          <TabsTrigger value="images">الصور</TabsTrigger>
        </TabsList>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 ml-2" />
                  الزيارات الطبية
                </CardTitle>
                <Button size="sm" onClick={() => setShowVisitForm(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  زيارة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.visits.map((visit) => (
                  <div key={visit.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          د. {visit.doctor.firstName} {visit.doctor.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{visit.doctor.specialization}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(visit.scheduledAt).toLocaleDateString('ar-IQ')}
                        </p>
                        {visit.diagnosis && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">التشخيص:</span> {visit.diagnosis}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(visit.status)}>
                          {getStatusText(visit.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {patient.visits.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد زيارات مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 ml-2" />
                  الفحوصات الطبية
                </CardTitle>
                <Button size="sm" onClick={() => setShowTestForm(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  فحص جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.tests.map((test) => (
                  <div key={test.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{test.name}</h4>
                        <p className="text-sm text-gray-600">
                          د. {test.doctor.firstName} {test.doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(test.scheduledAt).toLocaleDateString('ar-IQ')}
                        </p>
                        {test.results && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">النتائج:</span> {test.results}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(test.status)}>
                          {getStatusText(test.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {patient.tests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد فحوصات مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 ml-2" />
                  العلاجات الطبية
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  علاج جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.treatments.map((treatment) => (
                  <div key={treatment.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{treatment.name}</h4>
                        <p className="text-sm text-gray-600">
                          د. {treatment.doctor.firstName} {treatment.doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(treatment.scheduledAt).toLocaleDateString('ar-IQ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(treatment.status)}>
                          {getStatusText(treatment.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {patient.treatments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد علاجات مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 ml-2" />
                  العمليات الجراحية
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  عملية جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.operations.map((operation) => (
                  <div key={operation.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{operation.name}</h4>
                        <p className="text-sm text-gray-600">
                          د. {operation.doctor.firstName} {operation.doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(operation.scheduledAt).toLocaleDateString('ar-IQ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusText(operation.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {patient.operations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد عمليات مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 ml-2" />
                  الأدوية الموصوفة
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  دواء جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.medications.map((medication) => (
                  <div key={medication.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          د. {medication.doctor.firstName} {medication.doctor.lastName}
                        </p>
                        <div className="text-sm text-gray-500 mt-1">
                          <p>الجرعة: {medication.dosage || 'غير محدد'}</p>
                          <p>التكرار: {medication.frequency || 'غير محدد'}</p>
                          <p>المدة: {medication.duration || 'غير محدد'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(medication.status)}>
                          {getStatusText(medication.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {patient.medications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد أدوية مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diseases Tab */}
        <TabsContent value="diseases" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 ml-2" />
                  الأمراض المسجلة
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  مرض جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.diseases.map((disease) => (
                  <div key={disease.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{disease.name}</h4>
                        <p className="text-sm text-gray-500">
                          تاريخ التشخيص: {new Date(disease.diagnosedAt).toLocaleDateString('ar-IQ')}
                        </p>
                        {disease.severity && (
                          <p className="text-sm text-gray-600">
                            الشدة: {disease.severity}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(disease.status || '')}>
                          {getStatusText(disease.status || '')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {patient.diseases.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد أمراض مسجلة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 ml-2" />
                  صور المريض
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة صور
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={patient.images || []}
                onEdit={(index) => {
                  // Handle edit image
                  console.log('Edit image:', index)
                }}
                onDelete={(index) => {
                  // Handle delete image
                  console.log('Delete image:', index)
                }}
                onAdd={() => {
                  // Handle add image
                  console.log('Add image')
                }}
                maxImages={20}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {patient && (
        <>
          <ComprehensiveVisitForm
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            isOpen={showVisitForm}
            onClose={() => setShowVisitForm(false)}
            onSuccess={() => {
              setShowVisitForm(false)
              fetchPatient() // Refresh patient data
            }}
          />
          
          <TestForm
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            isOpen={showTestForm}
            onClose={() => setShowTestForm(false)}
            onSuccess={() => {
              setShowTestForm(false)
              fetchPatient() // Refresh patient data
            }}
          />
        </>
      )}
    </div>
  )
}