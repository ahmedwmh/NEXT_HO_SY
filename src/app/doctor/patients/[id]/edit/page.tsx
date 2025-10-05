'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'
import { ArrowRight, User, Save, X } from 'lucide-react'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  gender: string
  nationality: string | null
  idNumber: string | null
  passportNumber: string | null
  phone: string | null
  email: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  bloodType: string | null
  allergies: string | null
  medicalHistory: string | null
  profilePhoto: string | null
  insuranceNumber: string | null
  insuranceCompany: string | null
  maritalStatus: string | null
  occupation: string | null
  notes: string | null
  hospital: {
    id: string
    name: string
  }
  city: {
    id: string
    name: string
  }
}

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const { hospitalId, getDefaultFormValues, hospital, city } = useDoctorDataFilter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    idNumber: '',
    passportNumber: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    profilePhoto: '',
    insuranceNumber: '',
    insuranceCompany: '',
    maritalStatus: '',
    occupation: '',
    notes: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchPatient()
    }
  }, [params.id])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/patients/${params.id}`)
      
      if (!response.ok) {
        throw new Error(`خطأ في الخادم: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const patientData = data.data
        setPatient(patientData)
        
        // Populate form with patient data
        setFormData({
          firstName: patientData.firstName || '',
          lastName: patientData.lastName || '',
          middleName: patientData.middleName || '',
          dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: patientData.gender || '',
          nationality: patientData.nationality || '',
          idNumber: patientData.idNumber || '',
          passportNumber: patientData.passportNumber || '',
          phone: patientData.phone || '',
          email: patientData.email || '',
          address: patientData.address || '',
          emergencyContact: patientData.emergencyContact || '',
          emergencyPhone: patientData.emergencyPhone || '',
          bloodType: patientData.bloodType || '',
          allergies: patientData.allergies || '',
          medicalHistory: patientData.medicalHistory || '',
          profilePhoto: patientData.profilePhoto || '',
          insuranceNumber: patientData.insuranceNumber || '',
          insuranceCompany: patientData.insuranceCompany || '',
          maritalStatus: patientData.maritalStatus || '',
          occupation: patientData.occupation || '',
          notes: patientData.notes || ''
        })
      } else {
        setError('لم يتم العثور على المريض')
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المريض:', error)
      setError(error instanceof Error ? error.message : 'حدث خطأ في جلب بيانات المريض')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth || !formData.gender) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (!patient) {
      alert('خطأ: بيانات المريض غير متوفرة')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: new Date(formData.dateOfBirth).toISOString()
        })
      })

      if (response.ok) {
        alert('تم تحديث بيانات المريض بنجاح')
        router.push('/doctor/patients')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث بيانات المريض')
      }
    } catch (error) {
      console.error('خطأ في تحديث المريض:', error)
      alert('فشل في تحديث بيانات المريض')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/doctor/patients')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3">جاري تحميل بيانات المريض...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/doctor/patients')}>
            العودة إلى قائمة المرضى
          </Button>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">لم يتم العثور على المريض</p>
          <Button onClick={() => router.push('/doctor/patients')}>
            العودة إلى قائمة المرضى
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تعديل بيانات المريض</h1>
          <p className="text-gray-600">تعديل بيانات المريض: {patient.firstName} {patient.lastName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 ml-2" />
            بيانات المريض
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            رقم المريض: {patient.patientNumber}
          </p>
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
                <label className="block text-sm font-medium mb-2">الجنسية</label>
                <Input
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="الجنسية"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">رقم الهوية</label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="رقم الهوية الوطنية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رقم جواز السفر</label>
                <Input
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  placeholder="رقم جواز السفر"
                />
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
                <label className="block text-sm font-medium mb-2">المدينة</label>
                <Input 
                  value={city?.name || ''} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">المدينة محددة تلقائياً حسب مستشفاك</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المستشفى</label>
                <Input 
                  value={hospital?.name || ''} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">المستشفى محددة تلقائياً حسب حسابك</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان"
              />
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
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">المعلومات الطبية</h3>
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
            </div>

            {/* Insurance Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">معلومات التأمين</h3>
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
            </div>

            {/* Additional Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">معلومات شخصية إضافية</h3>
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
            </div>

            {/* Additional Notes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">ملاحظات إضافية</h3>
              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية"
                  rows={4}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={saving} 
                className="bg-hospital-blue hover:bg-hospital-darkBlue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
