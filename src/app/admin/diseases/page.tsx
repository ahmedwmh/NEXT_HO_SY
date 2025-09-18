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
import { Plus, Search, Edit, Trash2, Heart, Building, MapPin } from 'lucide-react'

interface Disease {
  id: string
  name: string
  description: string
  category: string
  severity: string
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

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    severity: '',
    hospitalId: '',
    cityId: ''
  })

  useEffect(() => {
    fetchDiseases()
    fetchCities()
  }, [])

  const fetchDiseases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-diseases')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setDiseases(data)
      } else {
        console.error('Error fetching diseases:', data)
        setDiseases([])
      }
    } catch (error) {
      console.error('Error fetching diseases:', error)
      setDiseases([])
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

  const handleAddDisease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.hospitalId) return

    try {
      const response = await fetch('/api/hospital-diseases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: formData.hospitalId,
          diseases: [formData]
        })
      })

      if (response.ok) {
        resetForm()
        setShowAddForm(false)
        fetchDiseases()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة المرض')
      }
    } catch (error) {
      console.error('خطأ في إضافة المرض:', error)
      alert('فشل في إضافة المرض')
    }
  }

  const handleEditDisease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDisease || !formData.name.trim()) return

    try {
      const response = await fetch(`/api/hospital-diseases/${editingDisease.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        resetForm()
        setEditingDisease(null)
        setShowAddForm(false)
        fetchDiseases()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث المرض')
      }
    } catch (error) {
      console.error('خطأ في تحديث المرض:', error)
      alert('فشل في تحديث المرض')
    }
  }

  const handleDeleteDisease = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المرض؟')) return

    try {
      const response = await fetch(`/api/hospital-diseases/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDiseases()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف المرض')
      }
    } catch (error) {
      console.error('خطأ في حذف المرض:', error)
      alert('فشل في حذف المرض')
    }
  }

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    setFormData({
      name: disease.name,
      description: disease.description,
      category: disease.category,
      severity: disease.severity,
      hospitalId: disease.hospital.id,
      cityId: disease.hospital.city.id
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    resetForm()
    setEditingDisease(null)
    setShowAddForm(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      severity: '',
      hospitalId: '',
      cityId: ''
    })
    setHospitals([])
  }

  const handleCityChange = (cityId: string) => {
    setFormData(prev => ({ ...prev, cityId, hospitalId: '' }))
    fetchHospitals(cityId)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'منخفض': return 'bg-green-100 text-green-800'
      case 'متوسط': return 'bg-yellow-100 text-yellow-800'
      case 'عالي': return 'bg-red-100 text-red-800'
      case 'حرج': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'اسم المرض',
      sortable: true,
      searchable: true,
      render: (value: string, disease: Disease) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Heart className="h-5 w-5 text-red-600" />
          <div>
            <div className="font-semibold">{disease.name}</div>
            {disease.description && (
              <div className="text-sm text-gray-500 max-w-xs truncate">
                {disease.description}
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
      render: (value: any, disease: Disease) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{disease.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {disease.hospital.city.name}
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
      key: 'severity',
      label: 'الخطورة',
      sortable: true,
      render: (value: string) => (
        <Badge className={getSeverityColor(value)}>
          {value}
        </Badge>
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
        {value: 'تنفسية', label: 'تنفسية' },
        { value: 'هضمية', label: 'هضمية' },
        { value: 'جلدية', label: 'جلدية' }
      ]
    },
    {
      key: 'severity',
      label: 'الخطورة',
      type: 'select' as const,
      options: [
        { value: 'منخفض', label: 'منخفض' },
        { value: 'متوسط', label: 'متوسط' },
        { value: 'عالي', label: 'عالي' },
        { value: 'حرج', label: 'حرج' }
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
        title="إدارة الأمراض الطبية"
        data={diseases}
        columns={columns}
        searchFields={['name', 'description', 'hospital.name', 'hospital.city.name', 'category']}
        filters={filters}
        onAdd={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={(disease: Disease) => handleDeleteDisease(disease.id)}
        addButtonText="إضافة مرض جديد"
        emptyMessage="لا توجد أمراض مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {/* Add/Edit Disease Form Modal */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDisease ? 'تعديل المرض' : 'إضافة مرض جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingDisease ? handleEditDisease : handleAddDisease} className="space-y-4">
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
                  <Label htmlFor="name">اسم المرض</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم المرض"
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
                  <Label htmlFor="severity">مستوى الخطورة</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                    required
                  >
                    <option value="">اختر مستوى الخطورة</option>
                    <option value="منخفض">منخفض</option>
                    <option value="متوسط">متوسط</option>
                    <option value="عالي">عالي</option>
                    <option value="حرج">حرج</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="isActive">الحالة</Label>
                  <Select
                    value={formData.isActive ? 'true' : 'false'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                    required
                  >
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف المرض..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingDisease ? 'تحديث' : 'إضافة'}
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