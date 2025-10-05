'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'
import { ArrowRight, UserPlus, Upload, Camera, X, Plus } from 'lucide-react'

interface City {
  id: string
  name: string
}

export default function AddPatientPage() {
  const router = useRouter()
  const { hospitalId, cityId, getDefaultFormValues, filteredData, hospital, city } = useDoctorDataFilter()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [checkingId, setCheckingId] = useState(false)
  const [idExists, setIdExists] = useState(false)
  const [patientImages, setPatientImages] = useState<string[]>([])
  const [availableTests, setAvailableTests] = useState<any[]>([])
  const [selectedTests, setSelectedTests] = useState<any[]>([])
  const [loadingTests, setLoadingTests] = useState(false)
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
    cityId: '',
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
    // Set default values from doctor's data
    const defaults = getDefaultFormValues()
    setFormData(prev => ({
      ...prev,
      cityId: defaults.cityId,
      hospitalId: defaults.hospitalId
    }))
    
    // Load cities (only doctor's city)
    if (filteredData.cities && filteredData.cities.length > 0) {
      setCities(filteredData.cities)
    }
  }, [cityId, hospitalId, filteredData.cities])

  useEffect(() => {
    // Fetch available tests when hospital is loaded
    if (hospitalId) {
      fetchAvailableTests()
    }
  }, [hospitalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth || !formData.gender || !formData.cityId) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (!formData.idNumber?.trim()) {
      alert('رقم الهوية الوطنية مطلوب')
      return
    }

    if (idExists) {
      alert('رقم الهوية الوطنية مستخدم بالفعل. يرجى تغييره')
      return
    }

    if (!hospitalId) {
      alert('خطأ: لا يمكن تحديد المستشفى')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          hospitalId: hospitalId,
          patientImages: patientImages,
          selectedTests: selectedTests.map(test => ({
            hospitalTestId: test.id,
            name: test.name,
            description: test.description || '',
            category: test.category || '',
            status: 'SCHEDULED'
          }))
        })
      })

      if (response.ok) {
        const message = selectedTests.length > 0 
          ? `تم إضافة المريض بنجاح مع ${selectedTests.length} فحص مطلوب`
          : 'تم إضافة المريض بنجاح'
        alert(message)
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

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, profilePhoto: data.imageUrl }))
        console.log('✅ تم رفع الصورة بنجاح')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في رفع الصورة')
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error)
      alert('فشل في رفع الصورة')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const checkIdNumber = async (idNumber: string) => {
    if (!idNumber.trim()) {
      setIdExists(false)
      return
    }

    setCheckingId(true)
    try {
      const response = await fetch(`/api/patients?idNumber=${encodeURIComponent(idNumber.trim())}`)
      const data = await response.json()
      
      if (data.exists) {
        setIdExists(true)
        // لا نعرض alert هنا، فقط نعرض الرسالة في الواجهة
      } else {
        setIdExists(false)
      }
    } catch (error) {
      console.error('خطأ في التحقق من رقم الهوية:', error)
    } finally {
      setCheckingId(false)
    }
  }

  const handleMultiplePhotoUpload = async (files: FileList) => {
    setUploadingPhoto(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          return data.imageUrl
        } else {
          throw new Error('فشل في رفع الصورة')
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setPatientImages(prev => [...prev, ...uploadedImages])
      console.log('✅ تم رفع الصور بنجاح')
    } catch (error) {
      console.error('خطأ في رفع الصور:', error)
      alert('فشل في رفع بعض الصور')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removeImage = (index: number) => {
    setPatientImages(prev => prev.filter((_, i) => i !== index))
  }

  const capturePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'camera'
    input.multiple = true
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        handleMultiplePhotoUpload(files)
      }
    }
    
    input.click()
  }

  const fetchAvailableTests = async () => {
    if (!hospitalId) return
    
    setLoadingTests(true)
    try {
      const response = await fetch(`/api/hospital-tests?hospitalId=${hospitalId}`)
      const data = await response.json()
      setAvailableTests(data.data || [])
    } catch (error) {
      console.error('خطأ في جلب الفحوصات:', error)
    } finally {
      setLoadingTests(false)
    }
  }


  const toggleTest = (test: any) => {
    setSelectedTests(prev => {
      const isSelected = prev.some(t => t.id === test.id)
      if (isSelected) {
        return prev.filter(t => t.id !== test.id)
      } else {
        return [...prev, test]
      }
    })
  }

  const toggleAllTests = () => {
    if (selectedTests.length === availableTests.length) {
      setSelectedTests([])
    } else {
      setSelectedTests([...availableTests])
    }
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
            بيانات المريض الشاملة
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            يرجى ملء جميع البيانات المطلوبة لإضافة مريض جديد إلى النظام
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
                <label className="block text-sm font-medium mb-2">المدينة *</label>
                <Input 
                  value={city?.name || ''} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">المدينة محددة تلقائياً حسب مستشفاك</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المستشفى *</label>
                <Input 
                  value={hospital?.name || ''} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">المستشفى محددة تلقائياً حسب حسابك</p>
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

            {/* Patient Images */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">صور المريض</h3>
              <div className="space-y-4">
                {/* Upload Controls */}
                <div className="flex flex-wrap gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        handleMultiplePhotoUpload(files)
                      }
                    }}
                    className="hidden"
                    id="patient-images"
                    disabled={uploadingPhoto}
                  />
                  <label 
                    htmlFor="patient-images" 
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    {uploadingPhoto ? 'جاري الرفع...' : 'اختر صور'}
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={capturePhoto}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center"
                  >
                    <Camera className="h-4 w-4 ml-2" />
                    التقاط صور
                  </Button>
                </div>

                {/* Images Grid */}
                {patientImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {patientImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Patient image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  يمكنك رفع عدة صور أو التقاط صور جديدة بالكاميرا. JPG, PNG أو GIF (حد أقصى 5MB لكل صورة)
                </p>
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

            {/* Document Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">معلومات الهوية والوثائق</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهوية الوطنية *</label>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Input
                      value={formData.idNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, idNumber: e.target.value })
                        // Check ID after user stops typing
                        const timeoutId = setTimeout(() => {
                          checkIdNumber(e.target.value)
                        }, 1000)
                        return () => clearTimeout(timeoutId)
                      }}
                      placeholder="رقم الهوية الوطنية"
                      required
                      className={idExists ? 'border-red-500 bg-red-50' : ''}
                    />
                    {checkingId && (
                      <div className="flex items-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                        جاري التحقق...
                      </div>
                    )}
                  </div>
                  {idExists && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">⚠️ رقم الهوية الوطنية مستخدم بالفعل</p>
                      <p className="text-xs text-red-500 mt-1">يجب تغيير رقم الهوية الوطنية لإضافة المريض</p>
                    </div>
                  )}
                  {!idExists && formData.idNumber && !checkingId && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600 font-medium">✅ رقم الهوية الوطنية متاح</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رقم جواز السفر</label>
                  <Input
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    placeholder="رقم جواز السفر"
                  />
                </div>
              </div>
            </div>

            {/* Medical Tests - Optional */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">الفحوصات المطلوبة (اختيارية)</h3>
                  <p className="text-sm text-gray-500 mt-1">يمكنك اختيار فحوصات للمريض أو إضافتها لاحقاً</p>
                </div>
                {availableTests.length > 0 && (
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="text-sm text-gray-600">
                      {selectedTests.length} من {availableTests.length} محدد
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleAllTests}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {selectedTests.length === availableTests.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {loadingTests ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mr-3">جاري تحميل الفحوصات...</span>
                  </div>
                ) : availableTests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTests.map((test) => {
                      const isSelected = selectedTests.some(t => t.id === test.id)
                      return (
                        <div
                          key={test.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleTest(test)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{test.name}</h4>
                              {test.description && (
                                <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {test.category && (
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {test.category}
                                  </span>
                                )}
                                {test.duration && (
                                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                                    ⏱️ {test.duration}
                                  </span>
                                )}
                                {test.cost && (
                                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                                    💰 {test.cost} د.ع
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا توجد فحوصات متاحة في هذا المستشفى</p>
                    <p className="text-sm mt-2">يمكنك إضافة فحوصات للمريض لاحقاً من صفحة المريض</p>
                  </div>
                )}

                {selectedTests.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">الفحوصات المحددة ({selectedTests.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTests.map((test) => (
                        <span
                          key={test.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {test.name}
                          <button
                            type="button"
                            onClick={() => toggleTest(test)}
                            className="mr-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {availableTests.length > 0 && selectedTests.length === 0 && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      لم يتم اختيار أي فحوصات. يمكنك إضافة فحوصات للمريض لاحقاً من صفحة المريض.
                    </p>
                  </div>
                )}
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
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={loading || idExists} 
                className="bg-hospital-blue hover:bg-hospital-darkBlue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : idExists ? 'رقم الهوية مستخدم - غير متاح' : 'إضافة المريض'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
