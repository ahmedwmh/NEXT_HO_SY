'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

interface SimpleVisitFormProps {
  patientId: string
  isOpen: boolean
  onClose: () => void
  visitId?: string // إذا كان موجود، نعدل زيارة موجودة
}

export default function SimpleVisitForm({ patientId, isOpen, onClose, visitId }: SimpleVisitFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    scheduledAt: '',
    symptoms: '',
    notes: '',
    diagnosis: '',
    cityId: '',
    hospitalId: '',
    doctorId: '',
    tests: [] as any[],
    diseases: [] as any[],
    treatments: [] as any[],
    operations: [] as any[],
    medications: [] as any[]
  })
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  // Fetch existing visit if editing
  const { data: existingVisit, isLoading: isLoadingVisit } = useQuery({
    queryKey: ['visit', visitId],
    queryFn: async () => {
      if (!visitId) return null
      const response = await fetch(`/api/visits/${visitId}`)
      const result = await response.json()
      return result.success ? result.data : null
    },
    enabled: !!visitId
  })

  // Load existing visit data
  useEffect(() => {
    if (existingVisit) {
      setFormData({
        scheduledAt: existingVisit.scheduledAt || '',
        symptoms: existingVisit.symptoms || '',
        notes: existingVisit.notes || '',
        diagnosis: existingVisit.diagnosis || '',
        cityId: existingVisit.cityId || '',
        hospitalId: existingVisit.hospitalId || '',
        doctorId: existingVisit.doctorId || '',
        tests: existingVisit.tests || [],
        diseases: existingVisit.diseases || [],
        treatments: existingVisit.treatments || [],
        operations: existingVisit.operations || [],
        medications: existingVisit.medications || []
      })
      setCurrentStep(existingVisit.currentStep || 1)
    }
  }, [existingVisit])

  // Fetch data for dropdowns
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await fetch('/api/cities')
      const result = await response.json()
      console.log('🏙️ Cities query result in simple form:', result)
      return result.data || []
    }
  })

  const { data: hospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await fetch('/api/hospitals')
      const result = await response.json()
      console.log('🏥 Hospitals query result in simple form:', result)
      return result.data || []
    }
  })

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await fetch('/api/doctors')
      const result = await response.json()
      console.log('👨‍⚕️ Doctors query result in simple form:', result)
      return result.data || []
    }
  })

  // Save visit (draft or complete)
  const saveVisit = useMutation({
    mutationFn: async (isComplete: boolean) => {
      const response = await fetch('/api/visits', {
        method: visitId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: visitId,
          patientId,
          scheduledAt: formData.scheduledAt,
          symptoms: formData.symptoms,
          notes: formData.notes,
          diagnosis: formData.diagnosis,
          cityId: formData.cityId,
          hospitalId: formData.hospitalId,
          doctorId: formData.doctorId,
          tests: formData.tests,
          diseases: formData.diseases,
          treatments: formData.treatments,
          operations: formData.operations,
          medications: formData.medications,
          status: isComplete ? 'COMPLETED' : 'DRAFT',
          currentStep: currentStep
        })
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data, isComplete) => {
      queryClient.invalidateQueries({ queryKey: ['visits', patientId] })
      toast.success(isComplete ? 'تم حفظ الزيارة بنجاح' : 'تم حفظ المسودة بنجاح')
      if (isComplete) {
        onClose()
      }
    },
    onError: (error) => {
      toast.error('حدث خطأ في الحفظ')
      console.error('Error saving visit:', error)
    }
  })

  const handleSave = (isComplete: boolean = false) => {
    setIsLoading(true)
    saveVisit.mutate(isComplete, {
      onSettled: () => setIsLoading(false)
    })
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {visitId ? 'تعديل الزيارة' : 'زيارة جديدة'} - الخطوة {currentStep} من 5
          </h2>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>معلومات الزيارة الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scheduledAt">تاريخ ووقت الزيارة</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="symptoms">الأعراض</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="وصف الأعراض..."
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location & Doctor */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>اختيار الموقع والطبيب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="city">المدينة</Label>
                <Select value={formData.cityId} onValueChange={(value) => setFormData({...formData, cityId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city: any) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hospital">المستشفى</Label>
                <Select value={formData.hospitalId} onValueChange={(value) => setFormData({...formData, hospitalId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستشفى" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((hospital: any) => (
                      <SelectItem key={hospital.id} value={hospital.id}>{hospital.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor">الطبيب</Label>
                <Select value={formData.doctorId} onValueChange={(value) => setFormData({...formData, doctorId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        د. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Tests */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>الفحوصات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">يمكنك إضافة الفحوصات لاحقاً</p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Diseases */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>الأمراض</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">يمكنك إضافة الأمراض لاحقاً</p>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Treatments */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>العلاجات والعمليات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">يمكنك إضافة العلاجات والعمليات لاحقاً</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                السابق
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ مؤقت'}
            </Button>
            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                التالي
              </Button>
            ) : (
              <Button 
                onClick={() => handleSave(true)}
                disabled={isLoading}
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ نهائي'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
