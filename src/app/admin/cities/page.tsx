'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UniversalTable } from '@/components/ui/universal-table'
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react'

interface City {
  id: string
  name: string
  createdAt: string
  hospitals: { id: string; name: string }[]
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [newCityName, setNewCityName] = useState('')

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      console.log('Fetching cities from API...')
      const response = await fetch('/api/cities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data)) {
        setCities(data.data)
      } else if (Array.isArray(data)) {
        setCities(data)
      } else {
        console.error('خطأ في جلب المدن: البيانات المستلمة ليست مصفوفة', data)
        setCities([])
      }
    } catch (error) {
      console.error('خطأ في جلب المدن:', error)
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCityName.trim()) return

    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCityName })
      })

      if (response.ok) {
        setNewCityName('')
        setShowAddForm(false)
        fetchCities()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة المدينة')
      }
    } catch (error) {
      console.error('خطأ في إضافة المدينة:', error)
      alert('فشل في إضافة المدينة')
    }
  }

  const handleEditCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCity || !newCityName.trim()) return

    try {
      const response = await fetch(`/api/cities/${editingCity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCityName })
      })

      if (response.ok) {
        setNewCityName('')
        setEditingCity(null)
        setShowAddForm(false)
        fetchCities()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث المدينة')
      }
    } catch (error) {
      console.error('خطأ في تحديث المدينة:', error)
      alert('فشل في تحديث المدينة')
    }
  }

  const handleDeleteCity = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المدينة؟')) return

    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCities()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف المدينة')
      }
    } catch (error) {
      console.error('خطأ في حذف المدينة:', error)
      alert('فشل في حذف المدينة')
    }
  }

  const handleEdit = (city: City) => {
    setEditingCity(city)
    setNewCityName(city.name)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setEditingCity(null)
    setNewCityName('')
    setShowAddForm(false)
  }

  const filteredCities = Array.isArray(cities) ? cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

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
      label: 'اسم المدينة',
      sortable: true,
      searchable: true,
      render: (value: string, city: City) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <MapPin className="h-5 w-5 text-hospital-blue" />
          <span className="font-semibold">{city.name}</span>
        </div>
      )
    },
    {
      key: 'hospitals',
      label: 'عدد المستشفيات',
      sortable: true,
      render: (value: any[], city: City) => (
        <Badge variant="outline">
          {city.hospitals.length} مستشفى
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
      key: 'hospitals',
      label: 'عدد المستشفيات',
      type: 'select' as const,
      options: [
        { value: '0', label: 'بدون مستشفيات' },
        { value: '1-5', label: '1-5 مستشفيات' },
        { value: '6-10', label: '6-10 مستشفيات' },
        { value: '10+', label: 'أكثر من 10 مستشفيات' }
      ]
    }
  ]

  return (
    <div className="w-full space-y-6">
      <UniversalTable
        title="إدارة المدن"
        data={cities}
        columns={columns}
        searchFields={['name']}
        filters={filters}
        onAdd={() => setShowAddForm(true)}
        onEdit={handleEdit}
        onDelete={(city: City) => handleDeleteCity(city.id)}
        addButtonText="إضافة مدينة جديدة"
        emptyMessage="لا توجد مدن مسجلة"
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />

      {/* Add/Edit City Form Modal */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCity ? 'تعديل المدينة' : 'إضافة مدينة جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCity ? handleEditCity : handleAddCity} className="flex gap-4">
              <Input
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="اسم المدينة"
                className="flex-1"
                required
              />
              <Button type="submit" className="bg-hospital-blue hover:bg-hospital-darkBlue">
                {editingCity ? 'تحديث' : 'إضافة'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
