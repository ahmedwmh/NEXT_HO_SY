'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, UserPlus } from 'lucide-react'

interface City {
  id: string
  name: string
}

export default function AddPatientPage() {
  const router = useRouter()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    cityId: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    insuranceNumber: '',
    insuranceCompany: '',
    maritalStatus: '',
    occupation: '',
    notes: ''
  })

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      setCities(data.data || data || [])
    } catch (error) {
      console.error('خطأ في جلب المدن:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth || !formData.gender || !formData.cityId) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // In a real app, this would be the doctor's hospital ID
          hospitalId: 'hospital-1'
        })
      })

      if (response.ok) {
        alert('تم إضافة المريض بنجاح')
        router.push('/doctor/patients')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة المريض')
      }
    } catch (error) {
      console.error('خطأ في إضافة المريض:', error)
      alert('فشل في إضافة المريض')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/doctor/patients')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إضافة مريض جديد</h1>
          <p className="text-gray-600">إضافة مريض جديد إلى مستشفاك</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 ml-2" />
            بيانات المريض الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium mb-2">الاسم الأوسط</label>
                <Input
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="الاسم الأوسط"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">تاريخ الميلاد *</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الجنس *</label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">فصيلة الدم</label>
                <Select value={formData.bloodType} onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فصيلة الدم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium mb-2">العنوان</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="العنوان"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">جهة الاتصال في الطوارئ</label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="اسم جهة الاتصال"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رقم الطوارئ</label>
                <Input
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="رقم الهاتف"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الحساسيات</label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="اذكر أي حساسيات معروفة"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">التاريخ المرضي</label>
                <Textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="اذكر أي أمراض سابقة أو حالية"
                  rows={3}
                />
              </div>
            </div>

            {/* Insurance Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">رقم التأمين</label>
                <Input
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                  placeholder="رقم التأمين"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">شركة التأمين</label>
                <Input
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                  placeholder="اسم شركة التأمين"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الحالة الاجتماعية</label>
                <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة الاجتماعية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">أعزب</SelectItem>
                    <SelectItem value="married">متزوج</SelectItem>
                    <SelectItem value="divorced">مطلق</SelectItem>
                    <SelectItem value="widowed">أرمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المهنة</label>
                <Input
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="المهنة"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <Button type="button" variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading} className="bg-hospital-blue hover:bg-hospital-darkBlue">
                {loading ? 'جاري الحفظ...' : 'إضافة المريض'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
