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
import { Plus, Search, Edit, Trash2, TestTube, MapPin, Building } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  city: City
}

interface Test {
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

interface TestForm {
  name: string
  description: string
  category: string
  duration: string
  cost: number
}

export default function TestsManagementPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [newTest, setNewTest] = useState<TestForm>({
    name: '',
    description: '',
    category: '',
    duration: '',
    cost: 0
  })

  useEffect(() => {
    fetchTests()
    fetchCities()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-tests')
      if (!response.ok) throw new Error('Failed to fetch tests')
      const data = await response.json()
      setTests(data.data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
      setTests([])
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

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/hospital-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTest,
          hospitalId: selectedHospitalId
        })
      })
      if (!response.ok) throw new Error('Failed to add test')
      await fetchTests()
      handleCancel()
    } catch (error) {
      console.error('Error adding test:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTest) return
    try {
      setSaving(true)
      const response = await fetch(`/api/hospital-tests/${editingTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTest,
          hospitalId: selectedHospitalId
        })
      })
      if (!response.ok) throw new Error('Failed to update test')
      await fetchTests()
      handleCancel()
    } catch (error) {
      console.error('Error updating test:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفحص؟')) return
    try {
      const response = await fetch(`/api/hospital-tests/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete test')
      await fetchTests()
    } catch (error) {
      console.error('Error deleting test:', error)
    }
  }

  const handleEdit = (test: Test) => {
    setEditingTest(test)
    setNewTest({
      name: test.name,
      description: test.description,
      category: test.category,
      duration: test.duration,
      cost: test.cost
    })
    setSelectedCityId(test.hospital.city.id)
    setSelectedHospitalId(test.hospital.id)
    setHospitals([test.hospital])
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingTest(null)
    setNewTest({ name: '', description: '', category: '', duration: '', cost: 0 })
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
      label: 'اسم الفحص',
      sortable: true,
      searchable: true,
      render: (value: string, test: Test) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <TestTube className="h-5 w-5 text-blue-500" />
          <span className="font-semibold">{test.name}</span>
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
      render: (value: any, test: Test) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{test.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 ml-1" />
              {test.hospital.city.name}
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
        { value: 'مخبرية', label: 'مخبرية' },
        { value: 'أشعة', label: 'أشعة' },
        { value: 'قلبية', label: 'قلبية' },
        { value: 'تنظير', label: 'تنظير' },
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
        title="إدارة الفحوصات"
        data={tests}
        columns={columns}
        searchFields={['name', 'description', 'category']}
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
              {/* City and Hospital Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={selectedCityId}
                    onValueChange={handleCityChange}
                    disabled={!!editingTest || loadingCities}
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
                    disabled={!selectedCityId || !!editingTest || loadingHospitals}
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

              {/* Test Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الفحص</Label>
                  <Input
                    id="name"
                    value={newTest.name}
                    onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                    placeholder="مثال: فحص الدم الشامل"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Select
                    value={newTest.category}
                    onValueChange={(value) => setNewTest({...newTest, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مخبرية">مخبرية</SelectItem>
                      <SelectItem value="أشعة">أشعة</SelectItem>
                      <SelectItem value="قلبية">قلبية</SelectItem>
                      <SelectItem value="تنظير">تنظير</SelectItem>
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
                    value={newTest.duration}
                    onChange={(e) => setNewTest({...newTest, duration: e.target.value})}
                    placeholder="مثال: 30 دقيقة"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">التكلفة (دينار)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newTest.cost}
                    onChange={(e) => setNewTest({...newTest, cost: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newTest.description}
                  onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                  placeholder="وصف تفصيلي للفحص"
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
                  {saving ? 'جاري الحفظ...' : (editingTest ? 'حفظ التعديلات' : 'إضافة الفحص')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}