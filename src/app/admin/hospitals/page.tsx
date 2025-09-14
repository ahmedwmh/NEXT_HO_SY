'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
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
      
      setHospitals(hospitalsData)
      setCities(citiesData)
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
      }
    } catch (error) {
      console.error('خطأ في إضافة المستشفى:', error)
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
      }
    } catch (error) {
      console.error('خطأ في حذف المستشفى:', error)
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المستشفيات</h1>
        <Button onClick={() => setShowAddForm(true)} className="bg-hospital-blue hover:bg-hospital-darkBlue">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستشفى جديد
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة مستشفى جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHospital} className="space-y-4">
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
                  إضافة
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة المستشفيات</CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المستشفيات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Building className="h-5 w-5 text-hospital-blue" />
                      <div>
                        <h3 className="font-semibold text-lg">{hospital.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 ml-1" />
                          {hospital.city.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteHospital(hospital.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">{hospital.address}</p>
                    {hospital.phone && (
                      <div className="flex items-center text-gray-500">
                        <Phone className="h-4 w-4 ml-1" />
                        {hospital.phone}
                      </div>
                    )}
                    {hospital.email && (
                      <div className="flex items-center text-gray-500">
                        <Mail className="h-4 w-4 ml-1" />
                        {hospital.email}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <div className="flex space-x-4 rtl:space-x-reverse">
                        <span className="text-gray-500">
                          <strong className="text-hospital-blue">{hospital.doctors.length}</strong> أطباء
                        </span>
                        <span className="text-gray-500">
                          <strong className="text-hospital-blue">{hospital.staff.length}</strong> موظفين
                        </span>
                        <span className="text-gray-500">
                          <strong className="text-hospital-blue">{hospital.patients.length}</strong> مرضى
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredHospitals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'لم يتم العثور على مستشفيات تطابق البحث' : 'لا توجد مستشفيات مسجلة'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}