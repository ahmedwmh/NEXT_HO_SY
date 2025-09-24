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
  Activity, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit,
  Save,
  X,
  Plus,
  Loader2,
  User
} from 'lucide-react'

interface Operation {
  id: string
  name: string
  description: string
  status: string
  scheduledAt: string
  notes?: string
  images?: string[]
  doctor?: {
    id: string
    firstName: string
    lastName: string
  }
  surgeon?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface OperationsManagementProps {
  patientId: string
  visitId?: string
  isOpen: boolean
  onClose: () => void
}

export default function OperationsManagement({ 
  patientId, 
  visitId, 
  isOpen, 
  onClose 
}: OperationsManagementProps) {
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingOperation, setEditingOperation] = useState<string | null>(null)
  const [showAddOperation, setShowAddOperation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newOperation, setNewOperation] = useState({
    name: '',
    description: '',
    scheduledAt: '',
    notes: ''
  })
  const [editOperation, setEditOperation] = useState({
    name: '',
    description: '',
    status: '',
    scheduledAt: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen && patientId) {
      fetchOperations()
    }
  }, [isOpen, patientId, visitId])

  const fetchOperations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/operations?patientId=${patientId}${visitId ? `&visitId=${visitId}` : ''}`)
      const data = await response.json()
      
      if (data.success) {
        setOperations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching operations:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateOperation = (operation: any) => {
    const errors: Record<string, string> = {}
    
    if (!operation.name.trim()) {
      errors.name = 'اسم العملية مطلوب'
    }
    
    if (!operation.scheduledAt) {
      errors.scheduledAt = 'تاريخ العملية مطلوب'
    } else {
      const scheduledDate = new Date(operation.scheduledAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (scheduledDate < today) {
        errors.scheduledAt = 'تاريخ العملية لا يمكن أن يكون في الماضي'
      }
    }
    
    return errors
  }

  const addOperation = async () => {
    try {
      const errors = validateOperation(newOperation)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      setSaving(true)
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          visitId,
          ...newOperation,
          status: 'SCHEDULED'
        })
      })
      
      if (response.ok) {
        setValidationErrors({})
        setNewOperation({ name: '', description: '', scheduledAt: '', notes: '' })
        setShowAddOperation(false)
        fetchOperations()
      }
    } catch (error) {
      console.error('Error adding operation:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateOperation = async (operationId: string) => {
    try {
      const errors = validateOperation(editOperation)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      setSaving(true)
      const response = await fetch(`/api/operations/${operationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOperation)
      })
      
      if (response.ok) {
        setValidationErrors({})
        setEditingOperation(null)
        fetchOperations()
      }
    } catch (error) {
      console.error('Error updating operation:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteOperation = async (operationId: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/operations/${operationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchOperations()
      }
    } catch (error) {
      console.error('Error deleting operation:', error)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (operation: Operation) => {
    setEditOperation({
      name: operation.name,
      description: operation.description,
      status: operation.status,
      scheduledAt: operation.scheduledAt.split('T')[0],
      notes: operation.notes || ''
    })
    setEditingOperation(operation.id)
    setValidationErrors({})
  }

  const cancelEditing = () => {
    setEditingOperation(null)
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
      case 'SCHEDULED': return 'مجدولة'
      case 'IN_PROGRESS': return 'جارية'
      case 'COMPLETED': return 'مكتملة'
      case 'CANCELLED': return 'ملغية'
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
            <Activity className="h-6 w-6 text-hospital-blue" />
            <h2 className="text-2xl font-bold text-gray-900">إدارة العمليات الجراحية</h2>
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
              {/* Add Operation Button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  إدارة العمليات الجراحية للمريض
                </p>
                <Button
                  onClick={() => {
                    setShowAddOperation(true)
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
                  إضافة عملية جديدة
                </Button>
              </div>

              {/* Add Operation Form */}
              {showAddOperation && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">إضافة عملية جديدة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="operationName">اسم العملية *</Label>
                        <Input
                          id="operationName"
                          value={newOperation.name}
                          onChange={(e) => setNewOperation({...newOperation, name: e.target.value})}
                          className={validationErrors.name ? 'border-red-500' : ''}
                          placeholder="مثال: استئصال الزائدة الدودية"
                        />
                        {validationErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="operationDate">تاريخ العملية *</Label>
                        <Input
                          id="operationDate"
                          type="date"
                          value={newOperation.scheduledAt}
                          onChange={(e) => setNewOperation({...newOperation, scheduledAt: e.target.value})}
                          className={validationErrors.scheduledAt ? 'border-red-500' : ''}
                        />
                        {validationErrors.scheduledAt && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledAt}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="operationDescription">وصف العملية</Label>
                        <Textarea
                          id="operationDescription"
                          value={newOperation.description}
                          onChange={(e) => setNewOperation({...newOperation, description: e.target.value})}
                          placeholder="وصف تفصيلي للعملية..."
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="operationNotes">ملاحظات</Label>
                        <Textarea
                          id="operationNotes"
                          value={newOperation.notes}
                          onChange={(e) => setNewOperation({...newOperation, notes: e.target.value})}
                          placeholder="ملاحظات إضافية..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4">
                      <Button
                        onClick={addOperation}
                        disabled={saving || !newOperation.name || !newOperation.scheduledAt}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 ml-1" />
                        )}
                        {saving ? 'جاري الحفظ...' : 'حفظ العملية'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddOperation(false)
                          setNewOperation({ name: '', description: '', scheduledAt: '', notes: '' })
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

              {/* Operations List */}
              {operations.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">لا توجد عمليات مسجلة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {operations.map((operation) => (
                    <Card key={operation.id}>
                      <CardContent className="p-4">
                        {editingOperation === operation.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>اسم العملية *</Label>
                                <Input
                                  value={editOperation.name}
                                  onChange={(e) => setEditOperation({...editOperation, name: e.target.value})}
                                  className={validationErrors.name ? 'border-red-500' : ''}
                                />
                                {validationErrors.name && (
                                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                                )}
                              </div>
                              <div>
                                <Label>تاريخ العملية *</Label>
                                <Input
                                  type="date"
                                  value={editOperation.scheduledAt}
                                  onChange={(e) => setEditOperation({...editOperation, scheduledAt: e.target.value})}
                                  className={validationErrors.scheduledAt ? 'border-red-500' : ''}
                                />
                                {validationErrors.scheduledAt && (
                                  <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledAt}</p>
                                )}
                              </div>
                              <div>
                                <Label>حالة العملية</Label>
                                <Select value={editOperation.status} onValueChange={(value) => setEditOperation({...editOperation, status: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SCHEDULED">مجدولة</SelectItem>
                                    <SelectItem value="IN_PROGRESS">جارية</SelectItem>
                                    <SelectItem value="COMPLETED">مكتملة</SelectItem>
                                    <SelectItem value="CANCELLED">ملغية</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2">
                                <Label>الوصف</Label>
                                <Textarea
                                  value={editOperation.description}
                                  onChange={(e) => setEditOperation({...editOperation, description: e.target.value})}
                                  rows={2}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>ملاحظات</Label>
                                <Textarea
                                  value={editOperation.notes}
                                  onChange={(e) => setEditOperation({...editOperation, notes: e.target.value})}
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Button
                                onClick={() => updateOperation(operation.id)}
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
                                <h3 className="font-semibold text-lg">{operation.name}</h3>
                                <Badge className={getStatusColor(operation.status)}>
                                  {getStatusText(operation.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditing(operation)}
                                  disabled={saving}
                                >
                                  <Edit className="h-4 w-4 ml-1" />
                                  تعديل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteOperation(operation.id)}
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
                                <span className="text-gray-500">تاريخ العملية:</span>
                                <p className="font-medium">{formatDate(operation.scheduledAt)}</p>
                              </div>
                              {operation.surgeon && (
                                <div>
                                  <span className="text-gray-500">الجراح:</span>
                                  <p className="font-medium">
                                    د. {operation.surgeon.firstName} {operation.surgeon.lastName}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {operation.description && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">الوصف:</span>
                                <p className="text-sm text-gray-700 mt-1">{operation.description}</p>
                              </div>
                            )}
                            
                            {operation.notes && (
                              <div className="mt-3">
                                <span className="text-gray-500 text-sm">ملاحظات:</span>
                                <p className="text-sm text-gray-700 mt-1">{operation.notes}</p>
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
