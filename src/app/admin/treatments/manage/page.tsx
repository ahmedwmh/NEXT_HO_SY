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
import { Plus, Search, Edit, Trash2, Pill, MapPin, Building } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  city: City
}

interface Treatment {
  id: string
  name: string
  description: string
  category: string
  duration: string
  quantity?: number
  expiredate?: string
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

interface TreatmentForm {
  name: string
  description: string
  category: string
  duration: string
  quantity?: number
  expiredate?: string
}

export default function TreatmentsManagementPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [newTreatment, setNewTreatment] = useState<TreatmentForm>({
    name: '',
    description: '',
    category: '',
    duration: '',
    quantity: undefined,
    expiredate: ''
  })

  useEffect(() => {
    fetchTreatments()
    fetchCities()
  }, [])

  const fetchTreatments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-treatments')
      if (!response.ok) throw new Error('Failed to fetch treatments')
      const data = await response.json()
      setTreatments(data.data || [])
    } catch (error) {
      console.error('Error fetching treatments:', error)
      setTreatments([])
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
      setHospitals(data.data || [])  // Fixed: Use data.data instead of data
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setHospitals([])
    } finally {
      setLoadingHospitals(false)
    }
  }

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/hospital-treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTreatment,
          hospitalId: selectedHospitalId
        })
      })
      if (!response.ok) throw new Error('Failed to add treatment')
      await fetchTreatments()
      handleCancel()
    } catch (error) {
      console.error('Error adding treatment:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditTreatment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTreatment) return
    try {
      setSaving(true)
      const response = await fetch(`/api/hospital-treatments/${editingTreatment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTreatment,
          hospitalId: selectedHospitalId
        })
      })
      if (!response.ok) throw new Error('Failed to update treatment')
      await fetchTreatments()
      handleCancel()
    } catch (error) {
      console.error('Error updating treatment:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTreatment = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العلاج؟')) return
    try {
      const response = await fetch(`/api/hospital-treatments/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete treatment')
      await fetchTreatments()
    } catch (error) {
      console.error('Error deleting treatment:', error)
    }
  }

  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment)
    setNewTreatment({
      name: treatment.name,
      description: treatment.description,
      category: treatment.category,
      duration: treatment.duration,
      quantity: treatment.quantity,
      expiredate: treatment.expiredate ? new Date(treatment.expiredate).toISOString().split('T')[0] : ''
    })
    setSelectedCityId(treatment.hospital.city.id)
    setSelectedHospitalId(treatment.hospital.id)
    setHospitals([treatment.hospital])
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingTreatment(null)
    setNewTreatment({ name: '', description: '', category: '', duration: '', quantity: undefined, expiredate: '' })
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
      label: 'اسم العلاج',
      sortable: true,
      searchable: true,
      render: (value: string, treatment: Treatment) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Pill className="h-5 w-5 text-green-500" />
          <span className="font-semibold">{treatment.name}</span>
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
      key: 'quantity',
      label: 'الكمية',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm text-gray-600">{value || 'غير محدد'}</span>
      )
    },
    {
      key: 'expiredate',
      label: 'تاريخ الانتهاء',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString('ar-IQ') : 'غير محدد'}
        </span>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      sortable: true,
      render: (value: any, treatment: Treatment) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{treatment.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 ml-1" />
              {treatment.hospital.city.name}
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
        { value: 'فيزيائي', label: 'فيزيائي' },
        { value: 'دوائي', label: 'دوائي' },
        { value: 'نفسي', label: 'نفسي' },
        { value: 'تنفسي', label: 'تنفسي' },
        { value: 'إشعاعي', label: 'إشعاعي' },
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
        title="إدارة العلاجات"
        data={treatments}
        columns={columns}
        searchFields={['name', 'description', 'category']}
        filters={filters}
        onAdd={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={(treatment: Treatment) => handleDeleteTreatment(treatment.id)}
        addButtonText="إضافة علاج جديد"
        emptyMessage="لا توجد علاجات مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {/* Add/Edit Treatment Form Modal */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTreatment ? 'تعديل العلاج' : 'إضافة علاج جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingTreatment ? handleEditTreatment : handleAddTreatment} className="space-y-4">
              {/* City and Hospital Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={selectedCityId}
                    onValueChange={handleCityChange}
                    disabled={!!editingTreatment || loadingCities}
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
                    disabled={!selectedCityId || !!editingTreatment || loadingHospitals}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingHospitals ? "جاري التحميل..." :
                        !selectedCityId ? "اختر المدينة أولاً" :
                        "اختر المستشفى"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(hospitals) && hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name} - {hospital.city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Treatment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم العلاج</Label>
                  <Input
                    id="name"
                    value={newTreatment.name}
                    onChange={(e) => setNewTreatment({...newTreatment, name: e.target.value})}
                    placeholder="مثال: العلاج الطبيعي"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Select
                    value={newTreatment.category}
                    onValueChange={(value) => setNewTreatment({...newTreatment, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="فيزيائي">فيزيائي</SelectItem>
                      <SelectItem value="دوائي">دوائي</SelectItem>
                      <SelectItem value="نفسي">نفسي</SelectItem>
                      <SelectItem value="تنفسي">تنفسي</SelectItem>
                      <SelectItem value="إشعاعي">إشعاعي</SelectItem>
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
                    value={newTreatment.duration}
                    onChange={(e) => setNewTreatment({...newTreatment, duration: e.target.value})}
                    placeholder="مثال: 6-8 أسابيع"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={newTreatment.quantity || ''}
                    onChange={(e) => setNewTreatment({...newTreatment, quantity: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="مثال: 100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiredate">تاريخ انتهاء الصلاحية</Label>
                <Input
                  id="expiredate"
                  type="date"
                  value={newTreatment.expiredate || ''}
                  onChange={(e) => setNewTreatment({...newTreatment, expiredate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({...newTreatment, description: e.target.value})}
                  placeholder="وصف تفصيلي للعلاج"
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
                  {saving ? 'جاري الحفظ...' : (editingTreatment ? 'حفظ التعديلات' : 'إضافة العلاج')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}