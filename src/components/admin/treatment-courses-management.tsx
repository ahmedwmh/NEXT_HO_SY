'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Pill, 
  Calendar, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Edit,
  Save,
  Loader2,
  X,
  Plus
} from 'lucide-react'

interface TreatmentCourse {
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
}

interface TreatmentCoursesManagementProps {
  patientId: string
  visitId?: string
  isOpen: boolean
  onClose: () => void
}

export default function TreatmentCoursesManagement({ 
  patientId, 
  visitId, 
  isOpen, 
  onClose 
}: TreatmentCoursesManagementProps) {
  const [courses, setCourses] = useState<TreatmentCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [editingDose, setEditingDose] = useState<string | null>(null)
  const [showAddDose, setShowAddDose] = useState<string | null>(null)
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newDose, setNewDose] = useState({
    scheduledDate: '',
    scheduledTime: '',
    quantity: 0,
    notes: ''
  })
  const [quantityEdit, setQuantityEdit] = useState({
    totalQuantity: 0,
    reservedQuantity: 0,
    deliveredQuantity: 0
  })

  useEffect(() => {
    if (isOpen && patientId) {
      fetchTreatmentCourses()
    }
  }, [isOpen, patientId, visitId])

  const fetchTreatmentCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/treatment-courses?patientId=${patientId}${visitId ? `&visitId=${visitId}` : ''}`)
      const data = await response.json()
      
      if (data.success) {
        setCourses(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching treatment courses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Validation functions
  const validateQuantity = (course: TreatmentCourse, newValues: any) => {
    const errors: Record<string, string> = {}
    
    // Check if total quantity is not less than delivered + reserved
    if (newValues.totalQuantity < (course.deliveredQuantity + course.reservedQuantity)) {
      errors.totalQuantity = 'الكمية الإجمالية لا يمكن أن تكون أقل من (المسلمة + المحجوزة)'
    }
    
    // Check if reserved quantity is not greater than total
    if (newValues.reservedQuantity > newValues.totalQuantity) {
      errors.reservedQuantity = 'الكمية المحجوزة لا يمكن أن تكون أكبر من الإجمالية'
    }
    
    // Check if delivered quantity is not greater than total
    if (newValues.deliveredQuantity > newValues.totalQuantity) {
      errors.deliveredQuantity = 'الكمية المسلمة لا يمكن أن تكون أكبر من الإجمالية'
    }
    
    // Check if delivered + reserved is not greater than total
    if ((newValues.deliveredQuantity + newValues.reservedQuantity) > newValues.totalQuantity) {
      errors.general = 'مجموع (المسلمة + المحجوزة) لا يمكن أن يكون أكبر من الإجمالية'
    }
    
    return errors
  }

  const validateDose = (dose: any) => {
    const errors: Record<string, string> = {}
    
    if (!dose.scheduledDate) {
      errors.scheduledDate = 'تاريخ الجرعة مطلوب'
    } else {
      const scheduledDate = new Date(dose.scheduledDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (scheduledDate < today) {
        errors.scheduledDate = 'تاريخ الجرعة لا يمكن أن يكون في الماضي'
      }
    }
    
    if (!dose.scheduledTime) {
      errors.scheduledTime = 'وقت الجرعة مطلوب'
    }
    
    if (!dose.quantity || dose.quantity <= 0) {
      errors.quantity = 'كمية الجرعة يجب أن تكون أكبر من صفر'
    }
    
    return errors
  }

  const validateStatusTransition = (currentStatus: string, newStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      'CREATED': ['RESERVED', 'CANCELLED'],
      'RESERVED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  const updateCourseStatus = async (courseId: string, status: string) => {
    try {
      const course = courses.find(c => c.id === courseId)
      if (!course) return
      
      if (!validateStatusTransition(course.status, status)) {
        setValidationErrors({ status: 'انتقال الحالة غير صحيح' })
        return
      }
      
      setUpdating(courseId)
      const response = await fetch(`/api/treatment-courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        setValidationErrors({})
        fetchTreatmentCourses()
      }
    } catch (error) {
      console.error('Error updating course status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const updateCourseQuantities = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId)
      if (!course) return
      
      const errors = validateQuantity(course, quantityEdit)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      setSaving(true)
      const response = await fetch(`/api/treatment-courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalQuantity: quantityEdit.totalQuantity,
          reservedQuantity: quantityEdit.reservedQuantity,
          deliveredQuantity: quantityEdit.deliveredQuantity,
          remainingQuantity: quantityEdit.totalQuantity - quantityEdit.deliveredQuantity - quantityEdit.reservedQuantity
        })
      })
      
      if (response.ok) {
        setValidationErrors({})
        setEditingQuantity(null)
        fetchTreatmentCourses()
      }
    } catch (error) {
      console.error('Error updating course quantities:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateDoseStatus = async (doseId: string, status: string, takenAt?: string) => {
    try {
      const response = await fetch(`/api/treatment-doses/${doseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          takenAt: takenAt || new Date().toISOString(),
          isTaken: status === 'TAKEN'
        })
      })
      
      if (response.ok) {
        fetchTreatmentCourses()
      }
    } catch (error) {
      console.error('Error updating dose status:', error)
    }
  }

  const addDose = async (courseId: string) => {
    try {
      const errors = validateDose(newDose)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      setSaving(true)
      const response = await fetch(`/api/treatment-doses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          ...newDose,
          doseNumber: (courses.find(c => c.id === courseId)?.doses.length || 0) + 1
        })
      })
      
      if (response.ok) {
        setValidationErrors({})
        setNewDose({ scheduledDate: '', scheduledTime: '', quantity: 0, notes: '' })
        setShowAddDose(null)
        fetchTreatmentCourses()
      }
    } catch (error) {
      console.error('Error adding dose:', error)
    } finally {
      setSaving(false)
    }
  }

  const startEditingQuantity = (course: TreatmentCourse) => {
    setQuantityEdit({
      totalQuantity: course.totalQuantity,
      reservedQuantity: course.reservedQuantity,
      deliveredQuantity: course.deliveredQuantity
    })
    setEditingQuantity(course.id)
    setValidationErrors({})
  }

  const cancelEditingQuantity = () => {
    setEditingQuantity(null)
    setValidationErrors({})
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800'
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CREATED': return 'تم الإنشاء'
      case 'RESERVED': return 'محجوز'
      case 'DELIVERED': return 'تم التسليم'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELLED': return 'ملغي'
      default: return status
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Pill className="h-6 w-6 text-hospital-blue" />
            <h2 className="text-2xl font-bold text-gray-900">إدارة الكورسات العلاجية</h2>
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
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد كورسات علاجية</p>
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Pill className="h-5 w-5 ml-2" />
                          {course.courseName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.hospitalTreatment.name} - {course.hospitalTreatment.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getStatusColor(course.status)}>
                          {getStatusText(course.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCourse(editingCourse === course.id ? null : course.id)}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          {editingCourse === course.id ? 'إلغاء' : 'تعديل'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Course Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-sm text-gray-500">الكمية الإجمالية</Label>
                        {editingQuantity === course.id ? (
                          <div>
                            <Input
                              type="number"
                              value={quantityEdit.totalQuantity}
                              onChange={(e) => setQuantityEdit({...quantityEdit, totalQuantity: parseInt(e.target.value) || 0})}
                              className={validationErrors.totalQuantity ? 'border-red-500' : ''}
                            />
                            {validationErrors.totalQuantity && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors.totalQuantity}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-lg font-semibold">{course.totalQuantity}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">المحجوزة</Label>
                        {editingQuantity === course.id ? (
                          <div>
                            <Input
                              type="number"
                              value={quantityEdit.reservedQuantity}
                              onChange={(e) => setQuantityEdit({...quantityEdit, reservedQuantity: parseInt(e.target.value) || 0})}
                              className={validationErrors.reservedQuantity ? 'border-red-500' : ''}
                            />
                            {validationErrors.reservedQuantity && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors.reservedQuantity}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-lg font-semibold text-yellow-600">{course.reservedQuantity}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">المسلمة</Label>
                        {editingQuantity === course.id ? (
                          <div>
                            <Input
                              type="number"
                              value={quantityEdit.deliveredQuantity}
                              onChange={(e) => setQuantityEdit({...quantityEdit, deliveredQuantity: parseInt(e.target.value) || 0})}
                              className={validationErrors.deliveredQuantity ? 'border-red-500' : ''}
                            />
                            {validationErrors.deliveredQuantity && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors.deliveredQuantity}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-lg font-semibold text-green-600">{course.deliveredQuantity}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">المتبقية</Label>
                        <p className="text-lg font-semibold text-blue-600">
                          {editingQuantity === course.id 
                            ? quantityEdit.totalQuantity - quantityEdit.deliveredQuantity - quantityEdit.reservedQuantity
                            : course.remainingQuantity
                          }
                        </p>
                      </div>
                    </div>

                    {/* General validation errors */}
                    {validationErrors.general && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{validationErrors.general}</p>
                      </div>
                    )}

                    {course.description && (
                      <div className="mb-4">
                        <Label className="text-sm text-gray-500">الوصف</Label>
                        <p className="text-sm text-gray-700">{course.description}</p>
                      </div>
                    )}

                    {course.instructions && (
                      <div className="mb-4">
                        <Label className="text-sm text-gray-500">التعليمات</Label>
                        <p className="text-sm text-gray-700">{course.instructions}</p>
                      </div>
                    )}

                    {/* Course Actions */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">إدارة الكورس</h4>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {editingQuantity === course.id ? (
                            <>
                            <Button
                              size="sm"
                              onClick={() => updateCourseQuantities(course.id)}
                              disabled={saving}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 ml-1" />
                              )}
                              {saving ? 'جاري الحفظ...' : 'حفظ الكميات'}
                            </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditingQuantity}
                                disabled={saving}
                              >
                                <X className="h-4 w-4 ml-1" />
                                إلغاء
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingQuantity(course)}
                              disabled={saving}
                            >
                              <Edit className="h-4 w-4 ml-1" />
                              تعديل الكميات
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {editingCourse === course.id && (
                        <div className="mb-3">
                          <Label className="text-sm font-medium">تحديث حالة الكورس</Label>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                            <Select 
                              onValueChange={(value) => updateCourseStatus(course.id, value)}
                              disabled={updating === course.id}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CREATED">تم الإنشاء</SelectItem>
                                <SelectItem value="RESERVED">محجوز</SelectItem>
                                <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                                <SelectItem value="CANCELLED">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                            {updating === course.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            )}
                          </div>
                          {validationErrors.status && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Doses */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">الجرعات ({course.doses.length})</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddDose(showAddDose === course.id ? null : course.id)}
                        >
                          <Plus className="h-4 w-4 ml-1" />
                          إضافة جرعة
                        </Button>
                      </div>

                      {/* Add New Dose Form */}
                      {showAddDose === course.id && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium mb-3">إضافة جرعة جديدة</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="scheduledDate">تاريخ الجرعة *</Label>
                              <Input
                                id="scheduledDate"
                                type="date"
                                value={newDose.scheduledDate}
                                onChange={(e) => setNewDose({...newDose, scheduledDate: e.target.value})}
                                className={validationErrors.scheduledDate ? 'border-red-500' : ''}
                              />
                              {validationErrors.scheduledDate && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledDate}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="scheduledTime">وقت الجرعة *</Label>
                              <Input
                                id="scheduledTime"
                                type="time"
                                value={newDose.scheduledTime}
                                onChange={(e) => setNewDose({...newDose, scheduledTime: e.target.value})}
                                className={validationErrors.scheduledTime ? 'border-red-500' : ''}
                              />
                              {validationErrors.scheduledTime && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledTime}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="quantity">الكمية *</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={newDose.quantity}
                                onChange={(e) => setNewDose({...newDose, quantity: parseInt(e.target.value) || 0})}
                                className={validationErrors.quantity ? 'border-red-500' : ''}
                              />
                              {validationErrors.quantity && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="notes">ملاحظات</Label>
                              <Input
                                id="notes"
                                value={newDose.notes}
                                onChange={(e) => setNewDose({...newDose, notes: e.target.value})}
                                placeholder="ملاحظات إضافية (اختياري)"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3">
                            <Button
                              size="sm"
                              onClick={() => addDose(course.id)}
                              disabled={saving || !newDose.scheduledDate || !newDose.scheduledTime || newDose.quantity <= 0}
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 ml-1" />
                              )}
                              {saving ? 'جاري الحفظ...' : 'حفظ الجرعة'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowAddDose(null)
                                setNewDose({ scheduledDate: '', scheduledTime: '', quantity: 0, notes: '' })
                                setValidationErrors({})
                              }}
                              disabled={saving}
                            >
                              <X className="h-4 w-4 ml-1" />
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Doses List */}
                      <div className="space-y-2">
                        {course.doses.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            لا توجد جرعات مسجلة
                          </div>
                        ) : (
                          course.doses.map((dose, index) => (
                            <div key={dose.id || index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <span className="font-medium">الجرعة {dose.doseNumber}</span>
                                  <Badge className={getStatusColor(dose.status)}>
                                    {getStatusText(dose.status)}
                                  </Badge>
                                  {dose.isTaken && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {dose.isOnTime && dose.isTaken && (
                                    <Badge className="bg-green-100 text-green-800">
                                      في الوقت
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <span className="text-sm text-gray-500">الكمية: {dose.quantity}</span>
                                  {!dose.isTaken && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateDoseStatus(dose.id, 'TAKEN')}
                                      className="bg-green-50 hover:bg-green-100 border-green-200"
                                    >
                                      <CheckCircle className="h-4 w-4 ml-1" />
                                      تم التناول
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <Clock className="h-3 w-3 inline ml-1" />
                                  <strong>مجدولة:</strong> {formatDateTime(dose.scheduledDate)} - {dose.scheduledTime}
                                </div>
                                {dose.takenAt && (
                                  <div>
                                    <User className="h-3 w-3 inline ml-1" />
                                    <strong>تم التناول:</strong> {formatDateTime(dose.takenAt)}
                                  </div>
                                )}
                              </div>

                              {dose.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>ملاحظات:</strong> {dose.notes}
                                </p>
                              )}

                              {dose.sideEffects && (
                                <p className="text-sm text-red-600 mt-2">
                                  <strong>الآثار الجانبية:</strong> {dose.sideEffects}
                                </p>
                              )}

                              {dose.takenBy && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <strong>تم التناول بواسطة:</strong> {dose.takenBy}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
