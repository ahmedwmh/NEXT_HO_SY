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
import { Plus, Search, Edit, Trash2, TestTube, Building, MapPin } from 'lucide-react'

interface Test {
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

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  
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
    fetchTests()
    fetchCities()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-tests')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setTests(data)
      } else {
        console.error('Error fetching tests:', data)
        setTests([])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      setTests([])
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

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.hospitalId) return

    try {
      const response = await fetch('/api/hospital-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: formData.hospitalId,
          tests: [formData]
        })
      })

      if (response.ok) {
        resetForm()
        setShowAddForm(false)
        fetchTests()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة الفحص')
      }
    } catch (error) {
      console.error('خطأ في إضافة الفحص:', error)
      alert('فشل في إضافة الفحص')
    }
  }

  const handleEditTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTest || !formData.name.trim()) return

    try {
      const response = await fetch(`/api/hospital-tests/${editingTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        resetForm()
        setEditingTest(null)
        setShowAddForm(false)
        fetchTests()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث الفحص')
      }
    } catch (error) {
      console.error('خطأ في تحديث الفحص:', error)
      alert('فشل في تحديث الفحص')
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفحص؟')) return

    try {
      const response = await fetch(`/api/hospital-tests/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTests()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف الفحص')
      }
    } catch (error) {
      console.error('خطأ في حذف الفحص:', error)
      alert('فشل في حذف الفحص')
    }
  }

  const handleEdit = (test: Test) => {
    setEditingTest(test)
    setFormData({
      name: test.name,
      description: test.description,
      category: test.category,
      duration: test.duration,
      cost: test.cost,
      hospitalId: test.hospital.id,
      cityId: test.hospital.city.id
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    resetForm()
    setEditingTest(null)
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
      label: 'اسم الفحص',
      sortable: true,
      searchable: true,
      render: (value: string, test: Test) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <TestTube className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-semibold">{test.name}</div>
            {test.description && (
              <div className="text-sm text-gray-500 max-w-xs truncate">
                {test.description}
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
      render: (value: any, test: Test) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{test.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {test.hospital.city.name}
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
        <span className="font-medium text-blue-600">
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
        { value: 'مخبرية', label: 'مخبرية' },
        { value: 'أشعة', label: 'أشعة' },
        { value: 'قلبية', label: 'قلبية' },
        { value: 'تنظير', label: 'تنظير' }
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
        title="إدارة الفحوصات الطبية"
        data={tests}
        columns={columns}
        searchFields={['name', 'description', 'hospital.name', 'hospital.city.name', 'category']}
        filters={filters}
        onAdd={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={(test: Test) => handleDeleteTest(test.id)}
        addButtonText="إضافة فحص جديد"
        emptyMessage="لا توجد فحوصات مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {/* Add/Edit Test Form Modal */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTest ? 'تعديل الفحص' : 'إضافة فحص جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingTest ? handleEditTest : handleAddTest} className="space-y-4">
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
                  <Label htmlFor="name">اسم الفحص</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم الفحص"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="مثال: مخبرية"
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
                    placeholder="مثال: 30 دقيقة"
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
                  placeholder="وصف الفحص..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingTest ? 'تحديث' : 'إضافة'}
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