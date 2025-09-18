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
import { Plus, Search, Edit, Trash2, Heart, MapPin, Building } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  city: City
}

interface Disease {
  id: string
  name: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
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

interface DiseaseForm {
  name: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function DiseasesManagementPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCities, setLoadingCities] = useState(true)
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [newDisease, setNewDisease] = useState<DiseaseForm>({
    name: '',
    description: '',
    category: '',
    severity: 'medium'
  })

  useEffect(() => {
    fetchDiseases()
    fetchCities()
  }, [])

  const fetchDiseases = async () => {
    try {
      const response = await fetch('/api/hospital-diseases')
      if (!response.ok) throw new Error('Failed to fetch diseases')
      const data = await response.json()
      setDiseases(data.data || [])
    } catch (error) {
      console.error('Error fetching diseases:', error)
      setDiseases([])
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

  const handleAddDisease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHospitalId || !newDisease.name.trim()) return

    try {
      setSaving(true)
      const response = await fetch('/api/hospital-diseases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: selectedHospitalId,
          diseases: [newDisease]
        })
      })

      if (response.ok) {
        setNewDisease({ name: '', description: '', category: '', severity: 'medium' })
        setSelectedCityId('')
        setSelectedHospitalId('')
        setHospitals([])
        setShowAddForm(false)
        fetchDiseases()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة المرض')
      }
    } catch (error) {
      console.error('Error adding disease:', error)
      alert('فشل في إضافة المرض')
    } finally {
      setSaving(false)
    }
  }

  const handleEditDisease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDisease || !newDisease.name.trim()) return

    try {
      setSaving(true)
      const response = await fetch(`/api/hospital-diseases/${editingDisease.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDisease)
      })

      if (response.ok) {
        setNewDisease({ name: '', description: '', category: '', severity: 'medium' })
        setEditingDisease(null)
        setShowAddForm(false)
        fetchDiseases()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث المرض')
      }
    } catch (error) {
      console.error('Error updating disease:', error)
      alert('فشل في تحديث المرض')
    } finally {
      setSaving(false)
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
      console.error('Error deleting disease:', error)
      alert('فشل في حذف المرض')
    }
  }

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    setNewDisease({
      name: disease.name,
      description: disease.description,
      category: disease.category,
      severity: disease.severity
    })
    setSelectedCityId(disease.hospital.city.id)
    setSelectedHospitalId(disease.hospital.id)
    setHospitals([disease.hospital])
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingDisease(null)
    setNewDisease({ name: '', description: '', category: '', severity: 'medium' })
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'خفيف'
      case 'medium': return 'متوسط'
      case 'high': return 'عالي'
      case 'critical': return 'حرج'
      default: return 'غير محدد'
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
          <Heart className="h-5 w-5 text-red-500" />
          <span className="font-semibold">{disease.name}</span>
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
      key: 'severity',
      label: 'الخطورة',
      sortable: true,
      render: (value: string) => (
        <Badge className={getSeverityColor(value)}>
          {getSeverityText(value)}
        </Badge>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      sortable: true,
      render: (value: any, disease: Disease) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{disease.hospital.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 ml-1" />
              {disease.hospital.city.name}
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
        { value: 'مزمن', label: 'مزمن' },
        { value: 'حاد', label: 'حاد' },
        { value: 'وراثي', label: 'وراثي' },
        { value: 'معدي', label: 'معدي' },
        { value: 'أخرى', label: 'أخرى' }
      ]
    },
    {
      key: 'severity',
      label: 'الخطورة',
      type: 'select' as const,
      options: [
        { value: 'low', label: 'خفيف' },
        { value: 'medium', label: 'متوسط' },
        { value: 'high', label: 'عالي' },
        { value: 'critical', label: 'حرج' }
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
        title="إدارة الأمراض"
        data={diseases}
        columns={columns}
        searchFields={['name', 'description', 'category']}
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
              {/* City and Hospital Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={selectedCityId}
                    onValueChange={handleCityChange}
                    disabled={!!editingDisease || loadingCities}
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
                    disabled={!selectedCityId || !!editingDisease || loadingHospitals}
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

              {/* Disease Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم المرض</Label>
                  <Input
                    id="name"
                    value={newDisease.name}
                    onChange={(e) => setNewDisease({...newDisease, name: e.target.value})}
                    placeholder="اسم المرض"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Input
                    id="category"
                    value={newDisease.category}
                    onChange={(e) => setNewDisease({...newDisease, category: e.target.value})}
                    placeholder="مثال: مزمن"
                  />
                </div>
                <div>
                  <Label htmlFor="severity">الخطورة</Label>
                  <Select
                    value={newDisease.severity}
                    onValueChange={(value: any) => setNewDisease({...newDisease, severity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الخطورة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">خفيف</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                      <SelectItem value="critical">حرج</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newDisease.description}
                  onChange={(e) => setNewDisease({...newDisease, description: e.target.value})}
                  placeholder="وصف المرض..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="bg-hospital-blue hover:bg-hospital-darkBlue"
                  disabled={saving}
                >
                  {saving ? 'جاري الحفظ...' : (editingDisease ? 'تحديث' : 'إضافة')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={saving}
                >
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
