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
  TestTube, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit,
  Save,
  X,
  Plus,
  Loader2
} from 'lucide-react'

interface Test {
  id: string
  name: string
  description: string
  status: string
  results?: string
  scheduledAt: string
  notes?: string
  images?: string[]
  doctor?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface TestsManagementProps {
  patientId: string
  visitId?: string
  isOpen: boolean
  onClose: () => void
}

export default function TestsManagement({ 
  patientId, 
  visitId, 
  isOpen, 
  onClose 
}: TestsManagementProps) {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingTest, setEditingTest] = useState<string | null>(null)
  const [showAddTest, setShowAddTest] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    scheduledAt: '',
    notes: ''
  })
  const [editTest, setEditTest] = useState({
    name: '',
    description: '',
    status: '',
    results: '',
    scheduledAt: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen && patientId) {
      fetchTests()
    }
  }, [isOpen, patientId, visitId])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests?patientId=${patientId}${visitId ? `&visitId=${visitId}` : ''}`)
      const data = await response.json()
      
      if (data.success) {
        setTests(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateTest = (test: any) => {
    const errors: Record<string, string> = {}
    
    if (!test.name.trim()) {
      errors.name = 'اسم الفحص مطلوب'
    }
    
    if (!test.scheduledAt) {
      errors.scheduledAt = 'تاريخ الفحص مطلوب'
    } else {
      const scheduledDate = new Date(test.scheduledAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (scheduledDate < today) {
        errors.scheduledAt = 'تاريخ الفحص لا يمكن أن يكون في الماضي'
      }
    }
    
    if (test.status === 'COMPLETED' && !test.results?.trim()) {
      errors.results = 'نتائج الفحص مطلوبة عند اكتمال الفحص'
    }
    
    return errors
  }

  const addTest = async () => {
    try {
      const errors = validateTest(newTest)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      setSaving(true)
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          visitId,
          ...newTest,
          status: 'SCHEDULED'
        })
      })
      
      if (response.ok) {
        setValidationErrors({})
        setNewTest({ name: '', description: '', scheduledAt: '', notes: '' })
        setShowAddTest(false)
        fetchTests()
      }
    } catch (error) {
      console.error('Error adding test:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateTest = async (testId: string) => {
    try {
      const errors = validateTest(editTest)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      setSaving(true)
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTest)
      })
      
      if (response.ok) {
        setValidationErrors({})
        setEditingTest(null)
        fetchTests()
      }
    } catch (error) {
      console.error('Error updating test:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteTest = async (testId: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchTests()
      }
    } catch (error) {
      console.error('Error deleting test:', error)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (test: Test) => {
    setEditTest({
      name: test.name,
      description: test.description,
      status: test.status,
      results: test.results || '',
      scheduledAt: test.scheduledAt.split('T')[0],
      notes: test.notes || ''
    })
    setEditingTest(test.id)
    setValidationErrors({})
  }

  const cancelEditing = () => {
    setEditingTest(null)
    setValidationErrors({})
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'مجدول'
      case 'IN_PROGRESS': return 'جاري'
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <TestTube className="h-6 w-6 text-hospital-blue" />
            <h2 className="text-2xl font-bold text-gray-900">إدارة الفحوصات الطبية</h2>
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
              <Loader2 className="h-8 w-8 animate-spin text-hospital-blue" />
              <span className="mr-3 text-gray-600">جاري التحميل...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Test Button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  إدارة الفحوصات الطبية للمريض
                </p>
                <Button
                  onClick={() => {
                    setShowAddTest(true)
                    setValidationErrors({})
                  }}
                  className="bg-hospital-blue hover:bg-hospital-darkBlue"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 ml-2" />
                  )}
                  إضافة فحص جديد
                </Button>
              </div>

              {/* Add Test Form */}
              {showAddTest && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">إضافة فحص جديد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="testName">اسم الفحص *</Label>
                        <Input
                          id="testName"
                          value={newTest.name}
                          onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                          className={validationErrors.name ? 'border-red-500' : ''}
                          placeholder="مثال: تحليل الدم الشامل"
                        />
                        {validationErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="testDate">تاريخ الفحص *</Label>
                        <Input
                          id="testDate"
                          type="date"
                          value={newTest.scheduledAt}
                          onChange={(e) => setNewTest({...newTest, scheduledAt: e.target.value})}
                          className={validationErrors.scheduledAt ? 'border-red-500' : ''}
                        />
                        {validationErrors.scheduledAt && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledAt}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="testDescription">وصف الفحص</Label>
                        <Textarea
                          id="testDescription"
                          value={newTest.description}
                          onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                          placeholder="وصف تفصيلي للفحص..."
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="testNotes">ملاحظات</Label>
                        <Textarea
                          id="testNotes"
                          value={newTest.notes}
                          onChange={(e) => setNewTest({...newTest, notes: e.target.value})}
                          placeholder="ملاحظات إضافية..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4">
                      <Button
                        onClick={addTest}
                        disabled={saving || !newTest.name || !newTest.scheduledAt}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 ml-1" />
                        )}
                        {saving ? 'جاري الحفظ...' : 'حفظ الفحص'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddTest(false)
                          setNewTest({ name: '', description: '', scheduledAt: '', notes: '' })
                          setValidationErrors({})
                        }}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 ml-1" />
                        إلغاء
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tests List */}
              {tests.length === 0 ? (
                <div className="text-center py-12">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">لا توجد فحوصات مسجلة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test) => (
                    <Card key={test.id}>
                      <CardContent className="p-4">
                        {editingTest === test.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>اسم الفحص *</Label>
                                <Input
                                  value={editTest.name}
                                  onChange={(e) => setEditTest({...editTest, name: e.target.value})}
                                  className={validationErrors.name ? 'border-red-500' : ''}
                                />
                                {validationErrors.name && (
                                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                                )}
                              </div>
                              <div>
                                <Label>تاريخ الفحص *</Label>
                                <Input
                                  type="date"
                                  value={editTest.scheduledAt}
                                  onChange={(e) => setEditTest({...editTest, scheduledAt: e.target.value})}
                                  className={validationErrors.scheduledAt ? 'border-red-500' : ''}
                                />
                                {validationErrors.scheduledAt && (
                                  <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledAt}</p>
                                )}
                              </div>
                              <div>
                                <Label>حالة الفحص</Label>
                                <Select value={editTest.status} onValueChange={(value) => setEditTest({...editTest, status: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SCHEDULED">مجدول</SelectItem>
                                    <SelectItem value="IN_PROGRESS">جاري</SelectItem>
                                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>النتائج</Label>
                                <Input
                                  value={editTest.results}
                                  onChange={(e) => setEditTest({...editTest, results: e.target.value})}
                                  placeholder="نتائج الفحص..."
                                  className={validationErrors.results ? 'border-red-500' : ''}
                                />
                                {validationErrors.results && (
                                  <p className="text-red-500 text-xs mt-1">{validationErrors.results}</p>
                                )}
                              </div>
                              <div className="md:col-span-2">
                                <Label>الوصف</Label>
                                <Textarea
                                  value={editTest.description}
                                  onChange={(e) => setEditTest({...editTest, description: e.target.value})}
                                  rows={2}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>ملاحظات</Label>
                                <Textarea
                                  value={editTest.notes}
                                  onChange={(e) => setEditTest({...editTest, notes: e.target.value})}
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Button
                                onClick={() => updateTest(test.id)}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {saving ? (
                                  <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 ml-1" />
                                )}
                                {saving ? 'جاري التحديث...' : 'حفظ التعديلات'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={saving}
                              >
                                <X className="h-4 w-4 ml-1" />
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <h3 className="font-semibold text-lg">{test.name}</h3>
                                <Badge className={getStatusColor(test.status)}>
                                  {getStatusText(test.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditing(test)}
                                  disabled={saving}
                                >
                                  <Edit className="h-4 w-4 ml-1" />
                                  تعديل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteTest(test.id)}
                                  disabled={saving}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {saving ? (
                                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 ml-1" />
                                  )}
                                  حذف
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">تاريخ الفحص:</span>
                                <p className="font-medium">{formatDate(test.scheduledAt)}</p>
                              </div>
                              {test.results && (
                                <div>
                                  <span className="text-gray-500">النتائج:</span>
                                  <p className="font-medium">{test.results}</p>
                                </div>
                              )}
                            </div>
                            
                            {test.description && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">الوصف:</span>
                                <p className="text-sm text-gray-700 mt-1">{test.description}</p>
                              </div>
                            )}
                            
                            {test.notes && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">ملاحظات:</span>
                                <p className="text-sm text-gray-700 mt-1">{test.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" disabled={saving}>
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  )
}
