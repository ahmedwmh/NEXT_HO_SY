'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, UserCheck, Phone, Mail, GraduationCap, Building } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  cityId: string
  city: {
    id: string
    name: string
  }
}

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialization: string
  phone: string | null
  licenseNumber: string
  hospitalId: string
  hospital: Hospital
  user: {
    email: string
  }
  createdAt: string
}

const specializations = [
  'أمراض القلب',
  'أمراض الأعصاب',
  'العظام',
  'طب الأطفال',
  'أمراض النساء',
  'الأمراض الجلدية',
  'أمراض العيون',
  'أنف وأذن وحنجرة',
  'الجراحة العامة',
  'الطب الباطني',
  'الطوارئ',
  'التخدير',
  'الأشعة',
  'الطب الشرعي',
  'الطب النفسي'
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    phone: '',
    licenseNumber: '',
    hospitalId: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [doctorsRes, citiesRes, hospitalsRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/cities'),
        fetch('/api/hospitals')
      ])
      
      const doctorsData = await doctorsRes.json()
      const citiesData = await citiesRes.json()
      const hospitalsData = await hospitalsRes.json()
      
      setDoctors(doctorsData.data || doctorsData || [])
      setCities(citiesData.data || citiesData || [])
      setHospitals(hospitalsData.data || hospitalsData || [])
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const [selectedCityId, setSelectedCityId] = useState('')

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId)
    setFormData({ ...formData, hospitalId: '' })
    const cityHospitals = hospitals.filter(hospital => hospital.cityId === cityId)
    setFilteredHospitals(cityHospitals)
  }

  const handleOpenForm = () => {
    setFormData({ firstName: '', lastName: '', specialization: '', phone: '', licenseNumber: '', hospitalId: '', email: '', password: '' })
    setSelectedCityId('')
    setFilteredHospitals([])
    setShowAddForm(true)
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.specialization || !selectedCityId || !formData.hospitalId || !formData.email.trim() || !formData.password.trim()) return

    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ firstName: '', lastName: '', specialization: '', phone: '', licenseNumber: '', hospitalId: '', email: '', password: '' })
        setSelectedCityId('')
        setFilteredHospitals([])
        setShowAddForm(false)
        fetchData()
      }
    } catch (error) {
      console.error('خطأ في إضافة الطبيب:', error)
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return

    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('خطأ في حذف الطبيب:', error)
    }
  }

  const filteredDoctors = Array.isArray(doctors) ? doctors.filter(doctor =>
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

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
        <h1 className="text-3xl font-bold text-gray-900">إدارة الأطباء</h1>
        <Button onClick={handleOpenForm} className="bg-hospital-blue hover:bg-hospital-darkBlue">
          <Plus className="ml-2 h-4 w-4" />
          إضافة طبيب جديد
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة طبيب جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الأول *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="الاسم الأول"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الأخير *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="الاسم الأخير"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">التخصص *</label>
                  <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المدينة *</label>
                  <Select value={selectedCityId} onValueChange={handleCityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة أولاً" />
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
                  <label className="block text-sm font-medium mb-2">المستشفى *</label>
                  <Select 
                    value={formData.hospitalId} 
                    onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}
                    disabled={!selectedCityId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCityId ? "اختر المستشفى" : "اختر المدينة أولاً"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredHospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <label className="block text-sm font-medium mb-2">رقم الترخيص</label>
                  <Input
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="رقم الترخيص"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="كلمة المرور"
                    required
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
            <CardTitle>قائمة الأطباء</CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الأطباء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <UserCheck className="h-5 w-5 text-hospital-blue" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          د. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <GraduationCap className="h-4 w-4 ml-1" />
                          {doctor.specialization}
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
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Building className="h-4 w-4 ml-1" />
                      {doctor.hospital.name} - {doctor.hospital.city.name}
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center text-gray-500">
                        <Phone className="h-4 w-4 ml-1" />
                        {doctor.phone}
                      </div>
                    )}
                    <div className="flex items-center text-gray-500">
                      <Mail className="h-4 w-4 ml-1" />
                      {doctor.user.email}
                    </div>
                    {doctor.licenseNumber && (
                      <div className="text-gray-500">
                        <strong>رقم الترخيص:</strong> {doctor.licenseNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredDoctors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'لم يتم العثور على أطباء يطابقون البحث' : 'لا توجد أطباء مسجلين'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
