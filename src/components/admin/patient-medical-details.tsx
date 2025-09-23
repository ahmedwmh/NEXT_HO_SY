'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Heart, 
  TestTube, 
  Activity, 
  Pill, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface PatientMedicalDetailsProps {
  patientId: string
}

interface Disease {
  id: string
  name: string
  description: string
  diagnosedAt: string
  severity: string
  status: string
  notes: string
}

interface TreatmentCourse {
  id: string
  courseName: string
  description: string
  totalQuantity: number
  deliveredQuantity: number
  remainingQuantity: number
  status: string
  startDate: string
  endDate: string
  hospitalTreatment: {
    name: string
    category: string
  }
}

interface Test {
  id: string
  name: string
  description: string
  status: string
  results: string
  scheduledAt: string
  notes: string
}

interface Operation {
  id: string
  name: string
  description: string
  status: string
  scheduledAt: string
  notes: string
}

export default function PatientMedicalDetails({ patientId }: PatientMedicalDetailsProps) {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [treatmentCourses, setTreatmentCourses] = useState<TreatmentCourse[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [treatmentsLookup, setTreatmentsLookup] = useState<any[]>([])
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)
  const [treatmentsSearch, setTreatmentsSearch] = useState('')
  const [openTreatmentPickerIndex, setOpenTreatmentPickerIndex] = useState<number | null>(null)
  const [patientHospitalId, setPatientHospitalId] = useState<string>('')
  const [defaultDoctorId, setDefaultDoctorId] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<{
    type: 'disease' | 'test' | 'operation' | 'treatment-course' | null
    data?: any
  }>({ type: null })
  
  // Treatments list inside the treatment course form
  interface CourseTreatmentItem {
    hospitalTreatmentId: string
    quantity: string
    frequency: string
    dose: string
    notes: string
  }
  const [courseTreatments, setCourseTreatments] = useState<CourseTreatmentItem[]>([
    { hospitalTreatmentId: '', quantity: '', frequency: '', dose: '', notes: '' }
  ])
  const addCourseTreatmentRow = () => {
    setCourseTreatments((prev) => ([
      ...prev,
      { hospitalTreatmentId: '', quantity: '', frequency: '', dose: '', notes: '' }
    ]))
  }
  const updateCourseTreatmentRow = (index: number, field: keyof CourseTreatmentItem, value: string) => {
    setCourseTreatments((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }
  const removeCourseTreatmentRow = (index: number) => {
    setCourseTreatments((prev) => prev.filter((_, i) => i !== index))
  }

  // Fetch all medical data
  const fetchMedicalData = async () => {
    try {
      setLoading(true)
      const [diseasesRes, coursesRes, testsRes, operationsRes] = await Promise.all([
        fetch(`/api/diseases?patientId=${patientId}`),
        fetch(`/api/treatment-courses?patientId=${patientId}&limit=1000`),
        fetch(`/api/tests?patientId=${patientId}`),
        fetch(`/api/operations?patientId=${patientId}`)
      ])

      const [diseasesData, coursesData, testsData, operationsData] = await Promise.all([
        diseasesRes.json(),
        coursesRes.json(),
        testsRes.json(),
        operationsRes.json()
      ])

      setDiseases(diseasesData.success ? diseasesData.data : [])
      setTreatmentCourses(coursesData.success ? coursesData.data : [])
      setTests(testsData.success ? testsData.data : [])
      setOperations(operationsData.success ? operationsData.data : [])
    } catch (error) {
      console.error('Error fetching medical data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchMedicalData()
    }
  }, [patientId])

  // Fetch patient to determine hospitalId for filtering treatments
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}`)
        const data = await res.json()
        if (data?.success && (data?.data?.hospital?.id || data?.data?.hospitalId)) {
          // Prefer relational hospital.id; fall back to hospitalId if necessary
          setPatientHospitalId(data.data.hospital?.id || data.data.hospitalId)
        }
      } catch (e) {
        console.error('Error fetching patient for hospitalId', e)
      }
    }
    if (patientId) fetchPatient()
  }, [patientId])

  // Fetch default doctor for patient's hospital
  useEffect(() => {
    const fetchDefaultDoctor = async () => {
      if (!patientHospitalId) return
      try {
        const res = await fetch(`/api/doctors?hospitalId=${patientHospitalId}&limit=1`)
        const data = await res.json()
        const first = Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : null
        if (first?.id) setDefaultDoctorId(first.id)
      } catch (e) {
        console.error('Error fetching default doctor', e)
      }
    }
    fetchDefaultDoctor()
  }, [patientHospitalId])

  // Fetch hospital treatments (optionally filter by name)
  const fetchHospitalTreatments = async () => {
    try {
      setIsLoadingTreatments(true)
      const params = new URLSearchParams({ isActive: 'true', limit: '200' })
      if (patientHospitalId) params.set('hospitalId', patientHospitalId)
      const res = await fetch(`/api/hospital-treatments?${params.toString()}`)
      const data = await res.json()
      let list = data.success ? data.data : []
      if (list.length === 0) {
        const resAll = await fetch(`/api/hospital-treatments?isActive=true&limit=200`)
        const dataAll = await resAll.json()
        list = dataAll.success ? dataAll.data : []
      }
      setTreatmentsLookup(list)
    } catch (error) {
      console.error('Error loading hospital treatments:', error)
    } finally {
      setIsLoadingTreatments(false)
    }
  }

  useEffect(() => {
    fetchHospitalTreatments()
  }, [patientHospitalId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />
      case 'Completed':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'Cancelled':
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صحيح'
      }
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'تاريخ غير صحيح'
    }
  }

  const handleAddDisease = async (formData: any) => {
    try {
      const response = await fetch('/api/diseases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId
        })
      })
      
      if (response.ok) {
        fetchMedicalData()
        setShowAddForm({ type: null })
      }
    } catch (error) {
      console.error('Error adding disease:', error)
    }
  }

  // Edit handlers (simple prompt-based) and delete handlers
  const handleEditDisease = async (d: Disease) => {
    try {
      const name = window.prompt('تعديل اسم المرض', d.name) || d.name
      const description = window.prompt('تعديل الوصف', d.description || '') || d.description
      const diagnosedAt = window.prompt('تاريخ التشخيص (YYYY-MM-DD)', d.diagnosedAt.split('T')[0]) || d.diagnosedAt
      const severity = window.prompt('الخطورة (Low/Medium/High/Critical)', d.severity) || d.severity
      const status = window.prompt('الحالة (Active/Inactive/Recovered)', d.status) || d.status
      await fetch(`/api/diseases/${d.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, diagnosedAt, severity, status })
      })
      await fetchMedicalData()
    } catch (e) {
      console.error('Edit disease failed', e)
    }
  }

  const handleDeleteDisease = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المرض؟')) return
    try {
      await fetch(`/api/diseases/${id}`, { method: 'DELETE' })
      await fetchMedicalData()
    } catch (e) {
      console.error('Delete disease failed', e)
    }
  }

  const handleEditTest = async (t: Test) => {
    try {
      const name = window.prompt('تعديل اسم الفحص', t.name) || t.name
      const description = window.prompt('تعديل الوصف', t.description || '') || t.description
      const scheduledAt = window.prompt('موعد الفحص (YYYY-MM-DDTHH:MM)', t.scheduledAt?.slice(0,16)) || t.scheduledAt
      const status = window.prompt('الحالة (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED)', t.status) || t.status
      const results = window.prompt('النتائج', t.results || '') || t.results
      const notes = window.prompt('ملاحظات', t.notes || '') || t.notes
      await fetch(`/api/tests/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, scheduledAt, status, results, notes })
      })
      await fetchMedicalData()
    } catch (e) {
      console.error('Edit test failed', e)
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفحص؟')) return
    try {
      await fetch(`/api/tests/${id}`, { method: 'DELETE' })
      await fetchMedicalData()
    } catch (e) {
      console.error('Delete test failed', e)
    }
  }

  const handleEditOperation = async (o: Operation) => {
    try {
      const name = window.prompt('تعديل اسم العملية', o.name) || o.name
      const description = window.prompt('تعديل الوصف', o.description || '') || o.description
      const scheduledAt = window.prompt('موعد العملية (YYYY-MM-DDTHH:MM)', o.scheduledAt?.slice(0,16)) || o.scheduledAt
      const status = window.prompt('الحالة (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED)', o.status) || o.status
      const notes = window.prompt('ملاحظات', o.notes || '') || o.notes
      await fetch(`/api/operations/${o.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, scheduledAt, status, notes })
      })
      await fetchMedicalData()
    } catch (e) {
      console.error('Edit operation failed', e)
    }
  }

  const handleDeleteOperation = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟')) return
    try {
      await fetch(`/api/operations/${id}`, { method: 'DELETE' })
      await fetchMedicalData()
    } catch (e) {
      console.error('Delete operation failed', e)
    }
  }

  const handleAddTest = async (formData: any) => {
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId
        })
      })
      
      if (response.ok) {
        fetchMedicalData()
        setShowAddForm({ type: null })
      }
    } catch (error) {
      console.error('Error adding test:', error)
    }
  }

  const handleAddOperation = async (formData: any) => {
    try {
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId
        })
      })
      
      if (response.ok) {
        fetchMedicalData()
        setShowAddForm({ type: null })
      }
    } catch (error) {
      console.error('Error adding operation:', error)
    }
  }

  const handleAddTreatmentCourse = async (formData: any) => {
    try {
      if (!patientHospitalId || !defaultDoctorId) {
        console.error('Missing hospital/doctor context')
        return
      }
      const courseName = (formData.courseName as string) || 'كورس علاجي'
      const description = (formData.description as string) || ''
      const startDate = formData.startDate
      const endDate = formData.endDate || null
      const status = formData.status || 'CREATED'
      const instructions = formData.instructions || ''
      const notes = formData.notes || ''
      const isReserved = (formData.isReserved === 'on' || formData.isReserved === 'true')
      const isDelivered = (formData.isDelivered === 'on' || formData.isDelivered === 'true')

      const rows = courseTreatments.filter(t => t.hospitalTreatmentId)
      for (const row of rows) {
        const payload = {
          patientId,
          doctorId: defaultDoctorId,
          hospitalId: patientHospitalId,
          hospitalTreatmentId: row.hospitalTreatmentId,
          courseName,
          description,
          totalQuantity: parseInt(row.quantity || '0', 10) || 0,
          startDate,
          endDate,
          status,
          isReserved,
          isDelivered,
          instructions,
          notes,
        }
        const res = await fetch('/api/treatment-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('Create course failed', err)
        }
      }

      await fetchMedicalData()
        setShowAddForm({ type: null })
        setCourseTreatments([{ hospitalTreatmentId: '', quantity: '', frequency: '', dose: '', notes: '' }])
    } catch (error) {
      console.error('Error adding treatment course:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات الطبية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Diseases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              الأمراض المشخصة ({diseases.length})
            </CardTitle>
            {/* CRUD disabled for diseases */}
          </div>
        </CardHeader>
        <CardContent>
          {diseases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد أمراض مسجلة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2">اسم المرض</th>
                    <th className="text-right py-2">التاريخ</th>
                    <th className="text-right py-2">الخطورة</th>
                    <th className="text-right py-2">الحالة</th>
                    <th className="text-right py-2">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {diseases.map((disease) => (
                    <tr key={disease.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{disease.name}</td>
                      <td className="py-2 text-sm text-gray-600">{formatDate(disease.diagnosedAt)}</td>
                      <td className="py-2">
                        <Badge variant="outline">{disease.severity}</Badge>
                      </td>
                      <td className="py-2">
                        <Badge className={getStatusColor(disease.status)}>
                          {disease.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-sm text-gray-600 max-w-xs truncate">
                        {disease.description}
                      </td>
                      {/* Actions removed - read-only */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Treatment Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Pill className="w-5 h-5 mr-2 text-blue-600" />
              الكورسات العلاجية ({treatmentCourses.length})
            </CardTitle>
          {/* عرض فقط، مع إمكانية تعديل حالة التسليم/الحجز */}
          </div>
        </CardHeader>
        <CardContent>
          {treatmentCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد كورسات علاجية
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2">اسم الكورس</th>
                    <th className="text-right py-2">العلاج</th>
                    <th className="text-right py-2">الكمية</th>
                    <th className="text-right py-2">المسلمة</th>
                    <th className="text-right py-2">المحجوزة</th>
                    <th className="text-right py-2">الحالة</th>
                    <th className="text-right py-2">التواريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{course.courseName}</td>
                      <td className="py-2 text-sm text-gray-600">{course.hospitalTreatment.name}</td>
                      <td className="py-2">{course.totalQuantity}</td>
                      <td className="py-2 text-green-600">{course.deliveredQuantity}</td>
                      <td className="py-2 text-orange-600">{(course as any).reservedQuantity ?? 0}</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                          <button
                            className="text-xs underline text-blue-600"
                            onClick={async () => {
                              try {
                                const targetStatus = course.status === 'DELIVERED' ? 'RESERVED' : 'DELIVERED'
                                await fetch(`/api/treatment-courses/${course.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    status: targetStatus,
                                    isReserved: targetStatus === 'RESERVED',
                                    isDelivered: targetStatus === 'DELIVERED',
                                  })
                                })
                                fetchMedicalData()
                              } catch (e) {
                                console.error('Failed to update course status', e)
                              }
                            }}
                          >
                            {course.status === 'DELIVERED' ? 'إرجاع إلى محجوز' : 'تعيين كـ مسلّم'}
                          </button>
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-600">
                        <div>
                          <div>من: {formatDate(course.startDate)}</div>
                          {course.endDate && (
                            <div>إلى: {formatDate(course.endDate)}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TestTube className="w-5 h-5 mr-2 text-green-600" />
              الفحوصات ({tests.length})
            </CardTitle>
            {/* CRUD disabled for tests */}
          </div>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد فحوصات مسجلة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2">اسم الفحص</th>
                    <th className="text-right py-2">التاريخ</th>
                    <th className="text-right py-2">الحالة</th>
                    <th className="text-right py-2">النتائج</th>
                    <th className="text-right py-2">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{test.name}</td>
                      <td className="py-2 text-sm text-gray-600">{formatDate(test.scheduledAt)}</td>
                      <td className="py-2">
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-sm text-gray-600 max-w-xs truncate">
                        {test.results || 'لم تظهر النتائج بعد'}
                      </td>
                      <td className="py-2 text-sm text-gray-600 max-w-xs truncate">
                        {test.description}
                      </td>
                      {/* Actions removed - read-only */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-600" />
              العمليات ({operations.length})
            </CardTitle>
            {/* CRUD disabled for operations */}
          </div>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد عمليات مسجلة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2">اسم العملية</th>
                    <th className="text-right py-2">التاريخ</th>
                    <th className="text-right py-2">الحالة</th>
                    <th className="text-right py-2">الوصف</th>
                    <th className="text-right py-2">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((operation) => (
                    <tr key={operation.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{operation.name}</td>
                      <td className="py-2 text-sm text-gray-600">{formatDate(operation.scheduledAt)}</td>
                      <td className="py-2">
                        <Badge className={getStatusColor(operation.status)}>
                          {operation.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-sm text-gray-600 max-w-xs truncate">
                        {operation.description}
                      </td>
                      <td className="py-2 text-sm text-gray-600 max-w-xs truncate">
                        {operation.notes}
                      </td>
                      {/* Actions removed - read-only */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CRUD modal removed - read-only page except visits/drafts elsewhere */}
    </div>
  )
}
