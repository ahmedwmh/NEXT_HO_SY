'use client'

import { useState, useEffect } from 'react'
import { HospitalManagementGuard } from '@/lib/admin-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UniversalTable } from '@/components/ui/universal-table'
import { Plus, Search, Edit, Trash2, Building, MapPin, Phone, Mail } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  address: string
  phone: string | null
  email: string | null
  cityId: string
  city: City
  doctors: { id: string }[]
  staff: { id: string }[]
  patients: { id: string }[]
  createdAt: string
}

function HospitalsPageContent() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    cityId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [hospitalsRes, citiesRes] = await Promise.all([
        fetch('/api/hospitals'),
        fetch('/api/cities')
      ])
      
      const hospitalsData = await hospitalsRes.json()
      const citiesData = await citiesRes.json()
      
      setHospitals(hospitalsData.data || hospitalsData || [])
      setCities(citiesData.data || citiesData || [])
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.address.trim() || !formData.cityId) return

    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', address: '', phone: '', email: '', cityId: '' })
        setShowAddForm(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة المستشفى')
      }
    } catch (error) {
      console.error('خطأ في إضافة المستشفى:', error)
      alert('فشل في إضافة المستشفى')
    }
  }

  const handleEditHospital = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHospital || !formData.name.trim() || !formData.address.trim() || !formData.cityId) return

    try {
      const response = await fetch(`/api/hospitals/${editingHospital.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', address: '', phone: '', email: '', cityId: '' })
        setEditingHospital(null)
        setShowAddForm(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث المستشفى')
      }
    } catch (error) {
      console.error('خطأ في تحديث المستشفى:', error)
      alert('فشل في تحديث المستشفى')
    }
  }

  const handleDeleteHospital = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستشفى؟')) return

    try {
      const response = await fetch(`/api/hospitals/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف المستشفى')
      }
    } catch (error) {
      console.error('خطأ في حذف المستشفى:', error)
      alert('فشل في حذف المستشفى')
    }
  }

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital)
    setFormData({
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone || '',
      email: hospital.email || '',
      cityId: hospital.cityId
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingHospital(null)
    setFormData({ name: '', address: '', phone: '', email: '', cityId: '' })
    setShowAddForm(false)
  }

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  const columns = [
    {
      key: 'name',
      label: 'اسم المستشفى',
      sortable: true,
      searchable: true,
      render: (value: string, hospital: Hospital) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Building className="h-5 w-5 text-hospital-blue" />
          <span className="font-semibold">{hospital.name}</span>
        </div>
      )
    },
    {
      key: 'city',
      label: 'المدينة',
      sortable: true,
      render: (value: any, hospital: Hospital) => (
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 ml-1" />
          {hospital.city.name}
        </div>
      )
    },
    {
      key: 'address',
      label: 'العنوان',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'phone',
      label: 'الهاتف',
      sortable: true,
      render: (value: string | null) => (
        value ? (
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="h-4 w-4 ml-1" />
            {value}
          </div>
        ) : '-'
      )
    },
    {
      key: 'doctors',
      label: 'عدد الأطباء',
      sortable: true,
      render: (value: any[], hospital: Hospital) => (
        <Badge variant="outline">
          {hospital.doctors?.length || 0} طبيب
        </Badge>
      )
    },
    {
      key: 'patients',
      label: 'عدد المرضى',
      sortable: true,
      render: (value: any[], hospital: Hospital) => (
        <Badge variant="outline">
          {hospital.patients?.length || 0} مريض
        </Badge>
      )
    }
  ]

  const filters = [
    {
      key: 'city',
      label: 'المدينة',
      type: 'select' as const,
      options: cities.map(city => ({
        value: city.id,
        label: city.name
      }))
    }
  ]

  return (
    <div className="w-full space-y-6">
      <UniversalTable
        title="إدارة المستشفيات"
        data={hospitals}
        columns={columns}
        searchFields={['name', 'city.name']}
        filters={filters}
        onAdd={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={(hospital: Hospital) => handleDeleteHospital(hospital.id)}
        addButtonText="إضافة مستشفى جديد"
        emptyMessage="لا توجد مستشفيات مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingHospital ? 'تعديل المستشفى' : 'إضافة مستشفى جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingHospital ? handleEditHospital : handleAddHospital} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المستشفى *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم المستشفى"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المدينة *</label>
                  <Select value={formData.cityId} onValueChange={(value) => setFormData({ ...formData, cityId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">العنوان *</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="عنوان المستشفى"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-hospital-blue hover:bg-hospital-darkBlue">
                  {editingHospital ? 'تحديث' : 'إضافة'}
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

export default function HospitalsPage() {
  return (
    <HospitalManagementGuard>
      <HospitalsPageContent />
    </HospitalManagementGuard>
  )
}