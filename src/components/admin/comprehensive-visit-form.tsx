'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormModal } from '@/components/ui/form-modal'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Calendar, 
  User, 
  Stethoscope, 
  TestTube, 
  Heart, 
  Pill,
  Plus,
  X,
  Check
} from 'lucide-react'

interface VisitFormProps {
  patientId: string
  patientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  cityId: string
}

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialization: string
  hospitalId: string
}

interface Test {
  id: string
  name: string
  description?: string
}

export function ComprehensiveVisitForm({ patientId, patientName, isOpen, onClose, onSuccess }: VisitFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    // Basic visit info
    scheduledAt: '',
    status: 'SCHEDULED',
    notes: '',
    diagnosis: '',
    symptoms: '',
    vitalSigns: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    weight: '',
    height: '',
    
    // Location and doctor selection
    cityId: '',
    hospitalId: '',
    doctorIds: [] as string[],
    
    // Tests selection
    selectedTests: [] as string[],
    customTests: [] as { name: string; description: string }[],
    
    // Results based on tests
    diseases: [] as { name: string; description: string; severity: string; status: string }[],
    treatments: [] as { name: string; description: string; scheduledAt: string; status: string }[],
    operations: [] as { name: string; description: string; scheduledAt: string; status: string }[]
  })

  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  // Fetch cities
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await fetch('/api/cities')
      const result = await response.json()
      return result.data || []
    },
  })

  // Fetch hospitals
  const { data: hospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await fetch('/api/hospitals')
      const result = await response.json()
      return result.data || []
    },
  })

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await fetch('/api/doctors')
      const result = await response.json()
      return result.data || []
    },
  })

  // Filter hospitals when city changes
  useEffect(() => {
    if (formData.cityId && hospitals) {
      const filtered = hospitals.filter((hospital: Hospital) => hospital.cityId === formData.cityId)
      setFilteredHospitals(filtered)
      // Reset hospital selection when city changes
      setFormData(prev => ({ ...prev, hospitalId: '', doctorIds: [] }))
    }
  }, [formData.cityId, hospitals])

  // Filter doctors when hospital changes
  useEffect(() => {
    if (formData.hospitalId && doctors) {
      const filtered = doctors.filter((doctor: Doctor) => doctor.hospitalId === formData.hospitalId)
      setFilteredDoctors(filtered)
      // Reset doctor selection when hospital changes
      setFormData(prev => ({ ...prev, doctorIds: [] }))
    }
  }, [formData.hospitalId, doctors])

  const createVisitMutation = useMutation({
    mutationFn: async (visitData: any) => {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل في إنشاء الزيارة')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      const isDraft = variables?.status === 'DRAFT'
      if (isDraft) {
        alert('تم حفظ الزيارة مؤقتاً بنجاح! يمكنك إكمالها لاحقاً.')
      } else {
        alert('تم حفظ الزيارة بنجاح!')
      }
      onSuccess?.()
      resetForm()
    },
  })

  const resetForm = () => {
    setFormData({
      scheduledAt: '',
      status: 'SCHEDULED',
      notes: '',
      diagnosis: '',
      symptoms: '',
      vitalSigns: '',
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      weight: '',
      height: '',
      cityId: '',
      hospitalId: '',
      doctorIds: [],
      selectedTests: [],
      customTests: [],
      diseases: [],
      treatments: [],
      operations: []
    })
    setValidationErrors({})
    setCurrentStep(1)
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.scheduledAt) {
        errors.scheduledAt = 'تاريخ ووقت الزيارة مطلوب'
      }
      // For step 1, we only require scheduledAt, other fields are optional
    }

    if (step === 2) {
      // For step 2, location and doctor selection is optional for saving
      // Only validate if user tries to go to next step
    }

    if (step === 3) {
      // Validate custom tests if any are added
      formData.customTests.forEach((test, index) => {
        if (!test.name) {
          errors[`customTest_${index}_name`] = 'اسم الفحص مطلوب'
        }
      })
    }

    if (step === 4) {
      // Validate diseases if any are added
      formData.diseases.forEach((disease, index) => {
        if (!disease.name) {
          errors[`disease_${index}_name`] = 'اسم المرض مطلوب'
        }
      })
    }

    if (step === 5) {
      // Validate treatments if any are added
      formData.treatments.forEach((treatment, index) => {
        if (!treatment.name) {
          errors[`treatment_${index}_name`] = 'اسم العلاج مطلوب'
        }
        if (!treatment.scheduledAt) {
          errors[`treatment_${index}_scheduledAt`] = 'موعد العلاج مطلوب'
        }
      })

      // Validate operations if any are added
      formData.operations.forEach((operation, index) => {
        if (!operation.name) {
          errors[`operation_${index}_name`] = 'اسم العملية مطلوب'
        }
        if (!operation.scheduledAt) {
          errors[`operation_${index}_scheduledAt`] = 'موعد العملية مطلوب'
        }
      })
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      // Validate current step first
      if (!validateStep(currentStep)) {
        return
      }

      // If we're on step 1, only validate basic info
      if (currentStep === 1) {
        if (!formData.scheduledAt) {
          alert('يرجى اختيار تاريخ ووقت الزيارة')
          return
        }
      }

      // If we're on step 2 and not draft, validate location and doctor
      if (currentStep === 2 && !isDraft) {
        if (!formData.doctorIds.length) {
          alert('يرجى اختيار طبيب واحد على الأقل')
          return
        }
        
        if (!formData.hospitalId) {
          alert('يرجى اختيار مستشفى')
          return
        }
      }

      // Create visit data based on current step
      let visitData: any = {
        patientId,
        scheduledAt: formData.scheduledAt,
        status: isDraft ? 'DRAFT' : formData.status,
        notes: formData.notes,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        vitalSigns: formData.vitalSigns,
        temperature: formData.temperature,
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        weight: formData.weight,
        height: formData.height
      }

      // Add location and doctor info if available
      if (formData.doctorIds.length > 0) {
        visitData.doctorId = formData.doctorIds[0] // Primary doctor
      }
      if (formData.hospitalId) {
        visitData.hospitalId = formData.hospitalId
      }

      console.log('🏥 ComprehensiveVisitForm: Creating visit with data:', visitData)

      const visit = await createVisitMutation.mutateAsync(visitData)

      // Only create additional data if we have the required info
      if (formData.doctorIds.length > 0 && formData.hospitalId) {
        // Create tests
        for (const testName of formData.selectedTests) {
          await fetch('/api/tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId,
              doctorId: formData.doctorIds[0],
              hospitalId: formData.hospitalId,
              visitId: visit.id,
              name: testName,
              scheduledAt: formData.scheduledAt,
              status: 'SCHEDULED'
            })
          })
        }

        // Create custom tests
        for (const test of formData.customTests) {
          if (test.name) { // Only create if name is provided
            await fetch('/api/tests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId,
                doctorId: formData.doctorIds[0],
                hospitalId: formData.hospitalId,
                visitId: visit.id,
                name: test.name,
                description: test.description,
                scheduledAt: formData.scheduledAt,
                status: 'SCHEDULED'
              })
            })
          }
        }

        // Create diseases
        for (const disease of formData.diseases) {
          if (disease.name) { // Only create if name is provided
            await fetch('/api/diseases', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId,
                name: disease.name,
                description: disease.description,
                diagnosedAt: formData.scheduledAt,
                severity: disease.severity,
                status: disease.status
              })
            })
          }
        }

        // Create treatments
        for (const treatment of formData.treatments) {
          if (treatment.name && treatment.scheduledAt) { // Only create if required fields are provided
            await fetch('/api/treatments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId,
                doctorId: formData.doctorIds[0],
                hospitalId: formData.hospitalId,
                visitId: visit.id,
                name: treatment.name,
                description: treatment.description,
                scheduledAt: treatment.scheduledAt,
                status: treatment.status
              })
            })
          }
        }

        // Create operations
        for (const operation of formData.operations) {
          if (operation.name && operation.scheduledAt) { // Only create if required fields are provided
            await fetch('/api/operations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId,
                doctorId: formData.doctorIds[0],
                hospitalId: formData.hospitalId,
                visitId: visit.id,
                name: operation.name,
                description: operation.description,
                scheduledAt: operation.scheduledAt,
                status: operation.status
              })
            })
          }
        }
      }

    } catch (error) {
      console.error('Error creating visit:', error)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const addCustomTest = () => {
    setFormData(prev => ({
      ...prev,
      customTests: [...prev.customTests, { name: '', description: '' }]
    }))
  }

  const removeCustomTest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customTests: prev.customTests.filter((_, i) => i !== index)
    }))
  }

  const addDisease = () => {
    setFormData(prev => ({
      ...prev,
      diseases: [...prev.diseases, { name: '', description: '', severity: 'Medium', status: 'Active' }]
    }))
  }

  const addTreatment = () => {
    setFormData(prev => ({
      ...prev,
      treatments: [...prev.treatments, { name: '', description: '', scheduledAt: '', status: 'SCHEDULED' }]
    }))
  }

  const addOperation = () => {
    setFormData(prev => ({
      ...prev,
      operations: [...prev.operations, { name: '', description: '', scheduledAt: '', status: 'SCHEDULED' }]
    }))
  }

  const toggleDoctor = (doctorId: string) => {
    setFormData(prev => ({
      ...prev,
      doctorIds: prev.doctorIds.includes(doctorId)
        ? prev.doctorIds.filter(id => id !== doctorId)
        : [...prev.doctorIds, doctorId]
    }))
  }

  const toggleTest = (testName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testName)
        ? prev.selectedTests.filter(name => name !== testName)
        : [...prev.selectedTests, testName]
    }))
  }

  const commonTests = [
    'فحص الدم الكامل',
    'فحص السكر',
    'فحص الكوليسترول',
    'فحص وظائف الكبد',
    'فحص وظائف الكلى',
    'فحص الغدة الدرقية',
    'تخطيط القلب',
    'الأشعة السينية',
    'الموجات فوق الصوتية',
    'الرنين المغناطيسي'
  ]

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`زيارة جديدة - ${patientName}`}
      size="xl"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Visit Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 ml-2" />
                معلومات الزيارة الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledAt">تاريخ ووقت الزيارة *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className={validationErrors.scheduledAt ? 'border-red-500' : ''}
                  />
                  {validationErrors.scheduledAt && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.scheduledAt}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">حالة الزيارة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">مجدولة</SelectItem>
                      <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                      <SelectItem value="COMPLETED">مكتملة</SelectItem>
                      <SelectItem value="CANCELLED">ملغية</SelectItem>
                      <SelectItem value="DRAFT">مسودة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="symptoms">الأعراض</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="وصف الأعراض التي يشكو منها المريض"
                />
              </div>

              <div>
                <Label htmlFor="diagnosis">التشخيص الأولي</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="التشخيص الأولي للحالة"
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location and Doctor Selection */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 ml-2" />
                اختيار الموقع والطبيب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cityId">المدينة *</Label>
                  <Select
                    value={formData.cityId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value }))}
                  >
                    <SelectTrigger className={validationErrors.cityId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((city: City) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.cityId && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.cityId}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hospitalId">المستشفى *</Label>
                  <Select
                    value={formData.hospitalId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, hospitalId: value }))}
                    disabled={!formData.cityId}
                  >
                    <SelectTrigger className={validationErrors.hospitalId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="اختر المستشفى" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredHospitals.map((hospital: Hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.hospitalId && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.hospitalId}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>الأطباء *</Label>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ${
                  validationErrors.doctorIds ? 'ring-2 ring-red-500 rounded-lg p-2' : ''
                }`}>
                  {filteredDoctors.map((doctor: Doctor) => (
                    <div
                      key={doctor.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.doctorIds.includes(doctor.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleDoctor(doctor.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            د. {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                        {formData.doctorIds.includes(doctor.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.doctorIds && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.doctorIds}</p>
                )}
                {formData.doctorIds.length > 0 && !validationErrors.doctorIds && (
                  <p className="text-sm text-gray-600 mt-2">
                    تم اختيار {formData.doctorIds.length} طبيب
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Tests Selection */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 ml-2" />
                اختيار الفحوصات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الفحوصات الشائعة</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {commonTests.map((test) => (
                    <div
                      key={test}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        formData.selectedTests.includes(test)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleTest(test)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{test}</span>
                        {formData.selectedTests.includes(test) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>فحوصات مخصصة</Label>
                  <Button size="sm" onClick={addCustomTest}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة فحص
                  </Button>
                </div>
                {formData.customTests.map((test, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <Input
                        placeholder="اسم الفحص *"
                        value={test.name}
                        onChange={(e) => {
                          const newTests = [...formData.customTests]
                          newTests[index].name = e.target.value
                          setFormData(prev => ({ ...prev, customTests: newTests }))
                        }}
                        className={validationErrors[`customTest_${index}_name`] ? 'border-red-500' : ''}
                      />
                      {validationErrors[`customTest_${index}_name`] && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors[`customTest_${index}_name`]}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="وصف الفحص"
                        value={test.description}
                        onChange={(e) => {
                          const newTests = [...formData.customTests]
                          newTests[index].description = e.target.value
                          setFormData(prev => ({ ...prev, customTests: newTests }))
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCustomTest(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Diseases */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 ml-2" />
                الأمراض المكتشفة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  بناءً على الفحوصات، هل تم اكتشاف أي أمراض؟
                </p>
                <Button size="sm" onClick={addDisease}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مرض
                </Button>
              </div>

              {formData.diseases.map((disease, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Input
                        placeholder="اسم المرض *"
                        value={disease.name}
                        onChange={(e) => {
                          const newDiseases = [...formData.diseases]
                          newDiseases[index].name = e.target.value
                          setFormData(prev => ({ ...prev, diseases: newDiseases }))
                        }}
                        className={validationErrors[`disease_${index}_name`] ? 'border-red-500' : ''}
                      />
                      {validationErrors[`disease_${index}_name`] && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors[`disease_${index}_name`]}</p>
                      )}
                    </div>
                    <Select
                      value={disease.severity}
                      onValueChange={(value) => {
                        const newDiseases = [...formData.diseases]
                        newDiseases[index].severity = value
                        setFormData(prev => ({ ...prev, diseases: newDiseases }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="الشدة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">خفيف</SelectItem>
                        <SelectItem value="Medium">متوسط</SelectItem>
                        <SelectItem value="High">شديد</SelectItem>
                        <SelectItem value="Critical">حرج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="وصف المرض"
                    value={disease.description}
                    onChange={(e) => {
                      const newDiseases = [...formData.diseases]
                      newDiseases[index].description = e.target.value
                      setFormData(prev => ({ ...prev, diseases: newDiseases }))
                    }}
                  />
                  <div className="flex gap-2">
                    <Select
                      value={disease.status}
                      onValueChange={(value) => {
                        const newDiseases = [...formData.diseases]
                        newDiseases[index].status = value
                        setFormData(prev => ({ ...prev, diseases: newDiseases }))
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">نشط</SelectItem>
                        <SelectItem value="Cured">مشفي</SelectItem>
                        <SelectItem value="Chronic">مزمن</SelectItem>
                        <SelectItem value="Under Treatment">قيد العلاج</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newDiseases = formData.diseases.filter((_, i) => i !== index)
                        setFormData(prev => ({ ...prev, diseases: newDiseases }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 5: Treatments and Operations */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 ml-2" />
                العلاجات والعمليات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Treatments */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">العلاجات المطلوبة</h3>
                  <Button size="sm" onClick={addTreatment}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة علاج
                  </Button>
                </div>
                {formData.treatments.map((treatment, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="اسم العلاج *"
                          value={treatment.name}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].name = e.target.value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                          className={validationErrors[`treatment_${index}_name`] ? 'border-red-500' : ''}
                        />
                        {validationErrors[`treatment_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors[`treatment_${index}_name`]}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          type="datetime-local"
                          placeholder="موعد العلاج *"
                          value={treatment.scheduledAt}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].scheduledAt = e.target.value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                          className={validationErrors[`treatment_${index}_scheduledAt`] ? 'border-red-500' : ''}
                        />
                        {validationErrors[`treatment_${index}_scheduledAt`] && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors[`treatment_${index}_scheduledAt`]}</p>
                        )}
                      </div>
                    </div>
                    <Textarea
                      placeholder="وصف العلاج"
                      value={treatment.description}
                      onChange={(e) => {
                        const newTreatments = [...formData.treatments]
                        newTreatments[index].description = e.target.value
                        setFormData(prev => ({ ...prev, treatments: newTreatments }))
                      }}
                    />
                    <div className="flex gap-2">
                      <Select
                        value={treatment.status}
                        onValueChange={(value) => {
                          const newTreatments = [...formData.treatments]
                          newTreatments[index].status = value
                          setFormData(prev => ({ ...prev, treatments: newTreatments }))
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="حالة العلاج" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCHEDULED">مجدول</SelectItem>
                          <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                          <SelectItem value="COMPLETED">مكتمل</SelectItem>
                          <SelectItem value="CANCELLED">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newTreatments = formData.treatments.filter((_, i) => i !== index)
                          setFormData(prev => ({ ...prev, treatments: newTreatments }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Operations */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">العمليات المطلوبة</h3>
                  <Button size="sm" onClick={addOperation}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة عملية
                  </Button>
                </div>
                {formData.operations.map((operation, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="اسم العملية *"
                          value={operation.name}
                          onChange={(e) => {
                            const newOperations = [...formData.operations]
                            newOperations[index].name = e.target.value
                            setFormData(prev => ({ ...prev, operations: newOperations }))
                          }}
                          className={validationErrors[`operation_${index}_name`] ? 'border-red-500' : ''}
                        />
                        {validationErrors[`operation_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors[`operation_${index}_name`]}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          type="datetime-local"
                          placeholder="موعد العملية *"
                          value={operation.scheduledAt}
                          onChange={(e) => {
                            const newOperations = [...formData.operations]
                            newOperations[index].scheduledAt = e.target.value
                            setFormData(prev => ({ ...prev, operations: newOperations }))
                          }}
                          className={!operation.scheduledAt ? 'border-red-500' : ''}
                        />
                        {!operation.scheduledAt && (
                          <p className="text-red-500 text-xs mt-1">موعد العملية مطلوب</p>
                        )}
                      </div>
                    </div>
                    <Textarea
                      placeholder="وصف العملية"
                      value={operation.description}
                      onChange={(e) => {
                        const newOperations = [...formData.operations]
                        newOperations[index].description = e.target.value
                        setFormData(prev => ({ ...prev, operations: newOperations }))
                      }}
                    />
                    <div className="flex gap-2">
                      <Select
                        value={operation.status}
                        onValueChange={(value) => {
                          const newOperations = [...formData.operations]
                          newOperations[index].status = value
                          setFormData(prev => ({ ...prev, operations: newOperations }))
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="حالة العملية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCHEDULED">مجدولة</SelectItem>
                          <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                          <SelectItem value="COMPLETED">مكتملة</SelectItem>
                          <SelectItem value="CANCELLED">ملغية</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newOperations = formData.operations.filter((_, i) => i !== index)
                          setFormData(prev => ({ ...prev, operations: newOperations }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            السابق
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 5 && (
              <Button type="button" onClick={nextStep}>
                التالي
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={createVisitMutation.isPending}
              variant="outline"
            >
              {createVisitMutation.isPending ? 'جاري الحفظ...' : 'حفظ مؤقت'}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={createVisitMutation.isPending}
              variant="default"
            >
              {createVisitMutation.isPending ? 'جاري الحفظ...' : 'حفظ نهائي'}
            </Button>
          </div>
        </div>
      </div>
    </FormModal>
  )
}
