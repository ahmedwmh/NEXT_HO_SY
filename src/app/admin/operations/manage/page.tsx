'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UniversalTable } from '@/components/ui/universal-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Edit, Trash2, Scissors, MapPin, Building } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  city: City
}

interface Operation {
  id: string
  name: string
  description: string
  category: string
  duration: string
  cost: number
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  createdAt: string
}

interface OperationForm {
  name: string
  description: string
  category: string
  duration: string
  cost: number
}

export default function OperationsManagementPage() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null)
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [newOperation, setNewOperation] = useState<OperationForm>({
    name: '',
    description: '',
    category: '',
    duration: '',
    cost: 0
  })

  useEffect(() => {
    fetchOperations()
    fetchCities()
  }, [])

  const fetchOperations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-operations')
      if (!response.ok) throw new Error('Failed to fetch operations')
      const data = await response.json()
      setOperations(data.data || [])
    } catch (error) {
      console.error('Error fetching operations:', error)
      setOperations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCities = async () => {
    try {
      setLoadingCities(true)
      const response = await fetch('/api/cities')
      if (!response.ok) throw new Error('Failed to fetch cities')
      const data = await response.json()
      setCities(data.data || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const fetchHospitals = async (cityId: string) => {
    try {
      setLoadingHospitals(true)
      const response = await fetch(`/api/hospitals?cityId=${cityId}`)
      if (!response.ok) throw new Error('Failed to fetch hospitals')
      const data = await response.json()
      setHospitals(data || [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setHospitals([])
    } finally {
      setLoadingHospitals(false)
    }
  }

  const handleAddOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/hospital-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOperation,
          hospitalId: selectedHospitalId
        })
      })
      if (!response.ok) throw new Error('Failed to add operation')
      await fetchOperations()
      handleCancel()
    } catch (error) {
      console.error('Error adding operation:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOperation) return
    try {
      setSaving(true)
      const response = await fetch(`/api/hospital-operations/${editingOperation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOperation,
          hospitalId: selectedHospitalId
        })
      })
      if (!response.ok) throw new Error('Failed to update operation')
      await fetchOperations()
      handleCancel()
    } catch (error) {
      console.error('Error updating operation:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteOperation = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العملية؟')) return
    try {
      const response = await fetch(`/api/hospital-operations/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete operation')
      await fetchOperations()
    } catch (error) {
      console.error('Error deleting operation:', error)
    }
  }

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation)
    setNewOperation({
      name: operation.name,
      description: operation.description,
      category: operation.category,
      duration: operation.duration,
      cost: operation.cost
    })
    setSelectedCityId(operation.hospital.city.id)
    setSelectedHospitalId(operation.hospital.id)
    setHospitals([operation.hospital])
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingOperation(null)
    setNewOperation({ name: '', description: '', category: '', duration: '', cost: 0 })
    setSelectedCityId('')
    setSelectedHospitalId('')
    setHospitals([])
    setShowAddForm(false)
  }

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId)
    setSelectedHospitalId('')
    if (cityId) {
      fetchHospitals(cityId)
    } else {
      setHospitals([])
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'اسم العملية',
      sortable: true,
      searchable: true,
      render: (value: string, operation: Operation) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Scissors className="h-5 w-5 text-blue-500" />
          <span className="font-semibold">{operation.name}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'الفئة',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">
          {value || 'غير محدد'}
        </Badge>
      )
    },
    {
      key: 'duration',
      label: 'المدة',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'غير محدد'}</span>
      )
    },
    {
      key: 'cost',
      label: 'التكلفة',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {value ? `${value.toLocaleString()} دينار` : 'غير محدد'}
        </span>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      sortable: true,
      render: (value: any, operation: Operation) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{operation.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 ml-1" />
              {operation.hospital.city.name}
            </div>
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
      key: 'category',
      label: 'الفئة',
      type: 'select' as const,
      options: [
        { value: 'قلبية', label: 'قلبية' },
        { value: 'باطنية', label: 'باطنية' },
        { value: 'عيون', label: 'عيون' },
        { value: 'عظمية', label: 'عظمية' },
        { value: 'عصبية', label: 'عصبية' },
        { value: 'أخرى', label: 'أخرى' }
      ]
    },
    {
      key: 'cityId',
      label: 'المدينة',
      type: 'select' as const,
      options: cities.map(city => ({
        value: city.id,
        label: city.name
      }))
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
        title="إدارة العمليات"
        data={operations}
        columns={columns}
        searchFields={['name', 'description', 'category']}
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
              {/* City and Hospital Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={selectedCityId}
                    onValueChange={handleCityChange}
                    disabled={!!editingOperation || loadingCities}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCities ? "جاري التحميل..." : "اختر المدينة"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hospital">المستشفى</Label>
                  <Select
                    value={selectedHospitalId}
                    onValueChange={(value) => setSelectedHospitalId(value)}
                    disabled={!selectedCityId || !!editingOperation || loadingHospitals}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingHospitals ? "جاري التحميل..." :
                        !selectedCityId ? "اختر المدينة أولاً" :
                        "اختر المستشفى"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name} - {hospital.city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Operation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم العملية</Label>
                  <Input
                    id="name"
                    value={newOperation.name}
                    onChange={(e) => setNewOperation({...newOperation, name: e.target.value})}
                    placeholder="مثال: جراحة القلب المفتوح"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Select
                    value={newOperation.category}
                    onValueChange={(value) => setNewOperation({...newOperation, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="قلبية">قلبية</SelectItem>
                      <SelectItem value="باطنية">باطنية</SelectItem>
                      <SelectItem value="عيون">عيون</SelectItem>
                      <SelectItem value="عظمية">عظمية</SelectItem>
                      <SelectItem value="عصبية">عصبية</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">المدة</Label>
                  <Input
                    id="duration"
                    value={newOperation.duration}
                    onChange={(e) => setNewOperation({...newOperation, duration: e.target.value})}
                    placeholder="مثال: 3-4 ساعات"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">التكلفة (دينار)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newOperation.cost}
                    onChange={(e) => setNewOperation({...newOperation, cost: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newOperation.description}
                  onChange={(e) => setNewOperation({...newOperation, description: e.target.value})}
                  placeholder="وصف تفصيلي للعملية"
                  rows={3}
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
                  {saving ? 'جاري الحفظ...' : (editingOperation ? 'حفظ التعديلات' : 'إضافة العملية')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}