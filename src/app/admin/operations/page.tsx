'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UniversalTable } from '@/components/ui/universal-table'
import { Plus, Search, Edit, Trash2, Activity, Building, MapPin } from 'lucide-react'

interface Operation {
  id: string
  name: string
  description: string
  category: string
  duration: string
  cost: number
  isActive: boolean
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  city: City
}

export default function OperationsPage() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: '',
    cost: 0,
    hospitalId: '',
    cityId: ''
  })

  useEffect(() => {
    fetchOperations()
    fetchCities()
  }, [])

  const fetchOperations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-operations')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setOperations(data)
      } else {
        console.error('Error fetching operations:', data)
        setOperations([])
      }
    } catch (error) {
      console.error('Error fetching operations:', error)
      setOperations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      setCities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching cities:', error)
      setCities([])
    }
  }

  const fetchHospitals = async (cityId: string) => {
    if (!cityId) {
      setHospitals([])
      return
    }
    try {
      const response = await fetch(`/api/hospitals?cityId=${cityId}`)
      const data = await response.json()
      setHospitals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setHospitals([])
    }
  }

  const handleAddOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.hospitalId) return

    try {
      const response = await fetch('/api/hospital-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: formData.hospitalId,
          operations: [formData]
        })
      })

      if (response.ok) {
        resetForm()
        setShowAddForm(false)
        fetchOperations()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة العملية')
      }
    } catch (error) {
      console.error('خطأ في إضافة العملية:', error)
      alert('فشل في إضافة العملية')
    }
  }

  const handleEditOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOperation || !formData.name.trim()) return

    try {
      const response = await fetch(`/api/hospital-operations/${editingOperation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        resetForm()
        setEditingOperation(null)
        setShowAddForm(false)
        fetchOperations()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث العملية')
      }
    } catch (error) {
      console.error('خطأ في تحديث العملية:', error)
      alert('فشل في تحديث العملية')
    }
  }

  const handleDeleteOperation = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العملية؟')) return

    try {
      const response = await fetch(`/api/hospital-operations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchOperations()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف العملية')
      }
    } catch (error) {
      console.error('خطأ في حذف العملية:', error)
      alert('فشل في حذف العملية')
    }
  }

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation)
    setFormData({
      name: operation.name,
      description: operation.description,
      category: operation.category,
      duration: operation.duration,
      cost: operation.cost,
      hospitalId: operation.hospital.id,
      cityId: operation.hospital.city.id
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    resetForm()
    setEditingOperation(null)
    setShowAddForm(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      duration: '',
      cost: 0,
      hospitalId: '',
      cityId: ''
    })
    setHospitals([])
  }

  const handleCityChange = (cityId: string) => {
    setFormData(prev => ({ ...prev, cityId, hospitalId: '' }))
    fetchHospitals(cityId)
  }

  const columns = [
    {
      key: 'name',
      label: 'اسم العملية',
      sortable: true,
      searchable: true,
      render: (value: string, operation: Operation) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Activity className="h-5 w-5 text-red-600" />
          <div>
            <div className="font-semibold">{operation.name}</div>
            {operation.description && (
              <div className="text-sm text-gray-500 max-w-xs truncate">
                {operation.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      sortable: true,
      searchable: true,
      render: (value: any, operation: Operation) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{operation.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {operation.hospital.city.name}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'الفئة',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'duration',
      label: 'المدة',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'cost',
      label: 'التكلفة',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-red-600">
          {value.toLocaleString()} دينار
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'نشط' : 'غير نشط'}
        </Badge>
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
      key: 'isActive',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    },
    {
      key: 'category',
      label: 'الفئة',
      type: 'select' as const,
      options: [
        { value: 'قلبية', label: 'قلبية' },
        { value: 'عصبية', label: 'عصبية' },
        { value: 'عظام', label: 'عظام' },
        { value: 'تجميلية', label: 'تجميلية' },
        { value: 'أورام', label: 'أورام' }
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
      <UniversalTable
        title="إدارة العمليات الجراحية"
        data={operations}
        columns={columns}
        searchFields={['name', 'description', 'hospital.name', 'hospital.city.name', 'category']}
        filters={filters}
        onAdd={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={(operation: Operation) => handleDeleteOperation(operation.id)}
        addButtonText="إضافة عملية جديدة"
        emptyMessage="لا توجد عمليات مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {/* Add/Edit Operation Form Modal */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingOperation ? 'تعديل العملية' : 'إضافة عملية جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingOperation ? handleEditOperation : handleAddOperation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={formData.cityId}
                    onValueChange={handleCityChange}
                    required
                  >
                    <option value="">اختر المدينة</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hospital">المستشفى</Label>
                  <Select
                    value={formData.hospitalId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, hospitalId: value }))}
                    required
                    disabled={!formData.cityId}
                  >
                    <option value="">اختر المستشفى</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم العملية</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم العملية"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="مثال: قلبية"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">المدة</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="مثال: 3 ساعات"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">التكلفة (دينار)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف العملية..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingOperation ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}