'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UniversalTable } from '@/components/ui/universal-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Calendar, Pill, User, Building, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  patientNumber: string
}

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialization: string
}

interface Hospital {
  id: string
  name: string
}

interface HospitalTreatment {
  id: string
  name: string
  category: string
  quantity: number | null
  expiredate: string | null
}

interface TreatmentCourse {
  id: string
  courseName: string
  description: string
  totalQuantity: number
  reservedQuantity: number
  deliveredQuantity: number
  remainingQuantity: number
  startDate: string
  endDate: string | null
  status: string
  instructions: string | null
  notes: string | null
  patient: Patient
  doctor: Doctor
  hospital: Hospital
  hospitalTreatment: HospitalTreatment
  doses: TreatmentDose[]
  createdAt: string
}

interface TreatmentDose {
  id: string
  doseNumber: number
  scheduledDate: string
  scheduledTime: string | null
  actualDate: string | null
  actualTime: string | null
  quantity: number
  status: string
  notes: string | null
  takenBy: string | null
  takenAt: string | null
}

interface CourseForm {
  courseName: string
  description: string
  totalQuantity: number
  startDate: string
  endDate: string
  instructions: string
  notes: string
  hospitalTreatmentId: string
  doctorId: string
}

export default function TreatmentCoursesPage() {
  const params = useParams()
  const patientId = params.id as string

  const [courses, setCourses] = useState<TreatmentCourse[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [hospitalTreatments, setHospitalTreatments] = useState<HospitalTreatment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<TreatmentCourse | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('')
  const [newCourse, setNewCourse] = useState<CourseForm>({
    courseName: '',
    description: '',
    totalQuantity: 0,
    startDate: '',
    endDate: '',
    instructions: '',
    notes: '',
    hospitalTreatmentId: '',
    doctorId: ''
  })

  useEffect(() => {
    fetchCourses()
    fetchDoctors()
    fetchHospitalTreatments()
  }, [patientId])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/treatment-courses?patientId=${patientId}`)
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data.data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
      if (!response.ok) throw new Error('Failed to fetch doctors')
      const data = await response.json()
      setDoctors(data.data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setDoctors([])
    }
  }

  const fetchHospitalTreatments = async () => {
    try {
      const response = await fetch('/api/hospital-treatments')
      if (!response.ok) throw new Error('Failed to fetch treatments')
      const data = await response.json()
      setHospitalTreatments(data.data || [])
    } catch (error) {
      console.error('Error fetching treatments:', error)
      setHospitalTreatments([])
    }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/treatment-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourse,
          patientId,
          hospitalId: hospitalTreatments.find(t => t.id === newCourse.hospitalTreatmentId)?.hospitalId || '',
          hospitalTreatmentId: newCourse.hospitalTreatmentId,
          doctorId: newCourse.doctorId
        })
      })
      if (!response.ok) throw new Error('Failed to add course')
      await fetchCourses()
      handleCancel()
    } catch (error) {
      console.error('Error adding course:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return
    try {
      setSaving(true)
      const response = await fetch(`/api/treatment-courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      })
      if (!response.ok) throw new Error('Failed to update course')
      await fetchCourses()
      handleCancel()
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس العلاجي؟')) return
    try {
      const response = await fetch(`/api/treatment-courses/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete course')
      await fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleEdit = (course: TreatmentCourse) => {
    setEditingCourse(course)
    setNewCourse({
      courseName: course.courseName,
      description: course.description,
      totalQuantity: course.totalQuantity,
      startDate: course.startDate.split('T')[0],
      endDate: course.endDate ? course.endDate.split('T')[0] : '',
      instructions: course.instructions || '',
      notes: course.notes || '',
      hospitalTreatmentId: course.hospitalTreatment.id,
      doctorId: course.doctor.id
    })
    setSelectedDoctorId(course.doctor.id)
    setSelectedTreatmentId(course.hospitalTreatment.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingCourse(null)
    setNewCourse({
      courseName: '',
      description: '',
      totalQuantity: 0,
      startDate: '',
      endDate: '',
      instructions: '',
      notes: '',
      hospitalTreatmentId: '',
      doctorId: ''
    })
    setSelectedDoctorId('')
    setSelectedTreatmentId('')
    setShowAddForm(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CREATED: { label: 'تم إنشاء الكورس', variant: 'outline' as const, icon: Plus },
      RESERVED: { label: 'تم حجز العلاج', variant: 'secondary' as const, icon: Calendar },
      DELIVERED: { label: 'تم تسليم العلاج', variant: 'default' as const, icon: CheckCircle },
      IN_PROGRESS: { label: 'جاري العلاج', variant: 'default' as const, icon: Clock },
      COMPLETED: { label: 'تم إكمال الكورس', variant: 'default' as const, icon: CheckCircle },
      CANCELLED: { label: 'تم إلغاء الكورس', variant: 'destructive' as const, icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CREATED
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const columns = [
    {
      key: 'courseName',
      label: 'اسم الكورس',
      sortable: true,
      searchable: true,
      render: (value: string, course: TreatmentCourse) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Pill className="h-5 w-5 text-blue-500" />
          <div>
            <div className="font-semibold">{course.courseName}</div>
            <div className="text-sm text-gray-500">{course.hospitalTreatment.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'quantities',
      label: 'الكميات',
      sortable: false,
      render: (value: any, course: TreatmentCourse) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span>المطلوب:</span>
            <span className="font-medium">{course.totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>المحجوز:</span>
            <span className="font-medium text-blue-600">{course.reservedQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>المسلم:</span>
            <span className="font-medium text-green-600">{course.deliveredQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>المتبقي:</span>
            <span className="font-medium text-orange-600">{course.remainingQuantity}</span>
          </div>
        </div>
      )
    },
    {
      key: 'doctor',
      label: 'الطبيب',
      sortable: true,
      render: (value: any, course: TreatmentCourse) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{course.doctor.firstName} {course.doctor.lastName}</div>
            <div className="text-sm text-gray-500">{course.doctor.specialization}</div>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'التواريخ',
      sortable: true,
      render: (value: any, course: TreatmentCourse) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span>البداية:</span>
            <span>{new Date(course.startDate).toLocaleDateString('ar-IQ')}</span>
          </div>
          {course.endDate && (
            <div className="flex justify-between">
              <span>النهاية:</span>
              <span>{new Date(course.endDate).toLocaleDateString('ar-IQ')}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'doses',
      label: 'الجرعات',
      sortable: false,
      render: (value: any, course: TreatmentCourse) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span>المجموع:</span>
            <span className="font-medium">{course.doses.length}</span>
          </div>
          <div className="flex justify-between">
            <span>المأخوذة:</span>
            <span className="font-medium text-green-600">
              {course.doses.filter(d => d.status === 'TAKEN').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>المفقودة:</span>
            <span className="font-medium text-red-600">
              {course.doses.filter(d => d.status === 'MISSED').length}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('ar-IQ')
    }
  ]

  const filters = [
    {
      key: 'status',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'CREATED', label: 'تم إنشاء الكورس' },
        { value: 'RESERVED', label: 'تم حجز العلاج' },
        { value: 'DELIVERED', label: 'تم تسليم العلاج' },
        { value: 'IN_PROGRESS', label: 'جاري العلاج' },
        { value: 'COMPLETED', label: 'تم إكمال الكورس' },
        { value: 'CANCELLED', label: 'تم إلغاء الكورس' }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الكورس العلاجي</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة كورس علاجي جديد
        </Button>
      </div>

      <UniversalTable
        title="قائمة الكورسات العلاجية"
        data={courses}
        columns={columns}
        searchFields={['courseName', 'description', 'hospitalTreatment.name']}
        filters={filters}
        onEdit={handleEdit}
        onDelete={(course: TreatmentCourse) => handleDeleteCourse(course.id)}
        emptyMessage="لا توجد كورسات علاجية مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {/* Add/Edit Course Form Modal */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? 'تعديل الكورس العلاجي' : 'إضافة كورس علاجي جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCourse ? handleEditCourse : handleAddCourse} className="space-y-4">
              {/* Course Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseName">اسم الكورس العلاجي</Label>
                  <Input
                    id="courseName"
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                    placeholder="مثال: كورس العلاج الطبيعي للركبة"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalQuantity">الكمية الإجمالية</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    min="1"
                    value={newCourse.totalQuantity}
                    onChange={(e) => setNewCourse({...newCourse, totalQuantity: parseInt(e.target.value) || 0})}
                    placeholder="مثال: 30"
                    required
                  />
                </div>
              </div>

              {/* Doctor and Treatment Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctor">الطبيب</Label>
                  <Select
                    value={selectedDoctorId}
                    onValueChange={(value) => {
                      setSelectedDoctorId(value)
                      setNewCourse({...newCourse, doctorId: value})
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطبيب" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="treatment">العلاج من المخزون</Label>
                  <Select
                    value={selectedTreatmentId}
                    onValueChange={(value) => {
                      setSelectedTreatmentId(value)
                      setNewCourse({...newCourse, hospitalTreatmentId: value})
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العلاج" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitalTreatments.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                          {treatment.name} - {treatment.category} (متوفر: {treatment.quantity || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse({...newCourse, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">تاريخ النهاية المتوقع</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse({...newCourse, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Description and Instructions */}
              <div>
                <Label htmlFor="description">وصف الكورس</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="وصف تفصيلي للكورس العلاجي"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="instructions">التعليمات</Label>
                <Textarea
                  id="instructions"
                  value={newCourse.instructions}
                  onChange={(e) => setNewCourse({...newCourse, instructions: e.target.value})}
                  placeholder="تعليمات خاصة للمريض"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newCourse.notes}
                  onChange={(e) => setNewCourse({...newCourse, notes: e.target.value})}
                  placeholder="ملاحظات إضافية"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'جاري الحفظ...' : (editingCourse ? 'حفظ التعديلات' : 'إضافة الكورس')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
