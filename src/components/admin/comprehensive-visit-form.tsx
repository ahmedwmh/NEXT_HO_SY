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
  isNewVisit?: boolean // New prop to distinguish new visits from drafts
  existingVisitId?: string // Optional: ID of existing visit to edit
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

export function ComprehensiveVisitForm({ patientId, patientName, isOpen, onClose, onSuccess, isNewVisit = true, existingVisitId }: VisitFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isFinalSaving, setIsFinalSaving] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null)
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
    treatments: [] as { name: string; description: string; scheduledAt: string; status: string; quantity?: number; cost?: number; duration?: string; category?: string; notes?: string }[],
    operations: [] as { name: string; description: string; scheduledAt: string; status: string }[]
  })

  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  // Fetch patient data for auto-fill
  const { data: patientData } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}`)
      const result = await response.json()
      return result.success ? result.data : null
    },
    enabled: !!patientId && isOpen
  })

  // Auto-fill patient data function
  const applyPatientData = async () => {
    if (!patientData) return

    console.log('🔄 Applying patient data to form:', patientData)
    
    setFormData(prev => ({
      ...prev,
      cityId: patientData.hospital?.city?.id || '',
      hospitalId: patientData.hospitalId || '',
      doctorIds: [], // Will be set when doctor is selected
      scheduledAt: new Date().toISOString().slice(0, 16) // Current date/time
    }))

    // If patient has selected tests, add them to the form
    if (patientData.tests && patientData.tests.length > 0) {
      const testNames = patientData.tests.map((test: any) => test.name)
      setFormData(prev => ({
        ...prev,
        selectedTests: testNames
      }))
      console.log('✅ Patient selected tests applied to form:', testNames.length)
    }
    
    console.log('✅ Patient data applied to form successfully')
  }

  // Load draft data when form opens
  useEffect(() => {
    if (isOpen) {
      loadDraftData()
    }
  }, [isOpen, patientId])

  // Load draft data from new draft system
  const loadDraftData = async () => {
    try {
      setIsLoadingDraft(true)
      
      // Only load draft if not a new visit
      if (isNewVisit) {
        return
      }

      // Load from new draft API
      const response = await fetch(`/api/visit-drafts?patientId=${patientId}&status=DRAFT&limit=1`)
      const result = await response.json()
      
      if (result.success && result.data && result.data.length > 0) {
        const latestDraft = result.data[0]
        console.log('📂 Loading draft from new API:', latestDraft)
        
        // Set the current visit ID for updates
        setCurrentVisitId(latestDraft.id)
        
        // Convert API data to form data format
        const formDataFromAPI = {
          scheduledAt: latestDraft.scheduledAt ? new Date(latestDraft.scheduledAt).toISOString().slice(0, 16) : '',
          status: latestDraft.status || 'SCHEDULED',
          notes: latestDraft.notes || '',
          diagnosis: latestDraft.diagnosis || '',
          symptoms: latestDraft.symptoms || '',
          vitalSigns: latestDraft.vitalSigns || '',
          temperature: latestDraft.temperature || '',
          bloodPressure: latestDraft.bloodPressure || '',
          heartRate: latestDraft.heartRate || '',
          weight: latestDraft.weight || '',
          height: latestDraft.height || '',
          cityId: latestDraft.hospital?.cityId || '',
          hospitalId: latestDraft.hospitalId || '',
          doctorIds: latestDraft.doctor ? [latestDraft.doctor.id] : [],
          selectedTests: latestDraft.draftTests?.map((test: any) => test.name) || [],
          customTests: latestDraft.draftTests?.map((test: any) => ({
            name: test.name,
            description: test.description || ''
          })) || [],
          diseases: latestDraft.draftDiseases?.map((disease: any) => ({
            name: disease.name,
            description: disease.description || '',
            severity: disease.severity || '',
            status: disease.status || ''
          })) || [],
          treatments: latestDraft.draftTreatments?.map((treatment: any) => ({
            name: treatment.name,
            description: treatment.description || '',
            scheduledAt: new Date(treatment.scheduledAt).toISOString().slice(0, 16),
            status: treatment.status || ''
          })) || [],
          operations: latestDraft.draftOperations?.map((operation: any) => ({
            name: operation.name,
            description: operation.description || '',
            scheduledAt: new Date(operation.scheduledAt).toISOString().slice(0, 16),
            status: operation.status || ''
          })) || []
        }
        
        console.log('📂 Doctor IDs from API:', formDataFromAPI.doctorIds)
        console.log('📂 Current visit ID set to:', latestDraft.id)
        setFormData(formDataFromAPI)
        
        // Set current step from draft
        setCurrentStep(latestDraft.currentStep || 1)
      }
    } catch (error) {
      console.error('Error loading draft data:', error)
    } finally {
      setIsLoadingDraft(false)
    }
  }

  // Save draft data to localStorage (deprecated - using new draft system)
  const saveDraftToLocalStorage = (data: any) => {
    // No longer using localStorage - all data is saved to the database
    console.log('💾 Draft data prepared for API (localStorage deprecated):', data)
  }

  // Save draft to new draft API system
  const saveDraftToAPI = async (step: number) => {
    try {
      setIsDraftSaving(true)
      console.log('💾 Saving draft to new API system for step:', step)
      console.log('💾 Current form data:', formData)
      console.log('💾 Current visit ID:', currentVisitId)

      // Validate required fields for the current step
      const stepValidation = validateStep(step)
      if (!stepValidation.isValid) {
        setValidationErrors(stepValidation.errors)
        console.log('❌ Step validation failed:', stepValidation.errors)
        return false
      }

      // Clear validation errors for this step
      setValidationErrors({})

      // Prepare draft data
      const draftData = {
        id: currentVisitId, // Include ID for updates
        patientId,
        doctorId: formData.doctorIds.length > 0 ? formData.doctorIds[0] : null,
        hospitalId: formData.hospitalId || null,
        scheduledAt: formData.scheduledAt,
        notes: formData.notes || null,
        diagnosis: formData.diagnosis || null,
        symptoms: formData.symptoms || null,
        vitalSigns: formData.vitalSigns || null,
        temperature: formData.temperature || null,
        bloodPressure: formData.bloodPressure || null,
        heartRate: formData.heartRate || null,
        weight: formData.weight || null,
        height: formData.height || null,
        images: [],
        currentStep: step,
        isCompleted: false,
        autoSaveEnabled: true,
        tests: step >= 3 ? [
          ...formData.selectedTests.map((testId: string) => {
            // Note: This would need to be implemented with proper test data
            return { 
              name: `Test ${testId}`, 
              description: 'Test description',
              scheduledAt: new Date().toISOString(),
              status: 'SCHEDULED'
            }
          }),
          ...formData.customTests.map((test: any) => ({
            name: test.name,
            description: test.description,
            scheduledAt: new Date().toISOString(),
            status: 'SCHEDULED'
          }))
        ] : [],
        diseases: step >= 4 ? formData.diseases.map((disease: any) => ({
          name: disease.name,
          description: disease.description,
          diagnosedAt: new Date().toISOString(),
          severity: disease.severity,
          status: disease.status
        })) : [],
        treatments: step >= 4 ? formData.treatments.map((treatment: any) => ({
          name: treatment.name,
          description: treatment.description,
          scheduledAt: treatment.scheduledAt,
          status: treatment.status
        })) : [],
        operations: step >= 4 ? formData.operations.map((operation: any) => ({
          name: operation.name,
          description: operation.description,
          scheduledAt: operation.scheduledAt,
          status: operation.status
        })) : [],
        medications: step >= 5 ? [] : [] // Will be implemented later
      }

      console.log('💾 Sending draft data to API:', draftData)

      // Save to new draft API
      const response = await fetch('/api/visit-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Draft saved successfully:', result.data)
        
        // Set the visit ID if it's a new draft
        if (!currentVisitId) {
          setCurrentVisitId(result.data.id)
          console.log('💾 New draft ID set:', result.data.id)
        }
        
        return true
      } else {
        console.error('❌ Failed to save draft:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ Error saving draft to API:', error)
      return false
    } finally {
      setIsDraftSaving(false)
    }
  }

  // Fetch cities
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await fetch('/api/cities')
      const result = await response.json()
      console.log('🏙️ Cities query result in form:', result)
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
      console.log('🔄 Filtering doctors for hospital:', formData.hospitalId)
      console.log('🔄 Available doctors:', filtered.map((d: Doctor) => ({ id: d.id, name: `${d.firstName} ${d.lastName}` })))
      console.log('🔄 Current doctorIds:', formData.doctorIds)
      setFilteredDoctors(filtered)
      
      // Only reset doctor selection if the hospital actually changed
      // Check if any of the currently selected doctors are still valid for this hospital
      const validDoctorIds = formData.doctorIds.filter(doctorId => 
        filtered.some((doctor: Doctor) => doctor.id === doctorId)
      )
      
      if (validDoctorIds.length !== formData.doctorIds.length) {
        console.log('🔄 Hospital changed, resetting doctor selection')
        setFormData(prev => ({ ...prev, doctorIds: [] }))
      } else {
        console.log('🔄 Hospital same, keeping doctor selection:', validDoctorIds)
      }
    }
  }, [formData.hospitalId, doctors])

  // Auto-save to new draft system when form data changes
  useEffect(() => {
    if (isOpen && formData.scheduledAt) { // Only save if form is open and has some data
      console.log('🔄 Auto-save triggered for step:', currentStep, 'with visit ID:', currentVisitId)
      const timeoutId = setTimeout(() => {
        // Auto-save to new draft system
        if (currentVisitId) {
          console.log('🔄 Auto-saving to API for existing draft:', currentVisitId)
          saveDraftToAPI(currentStep).catch(error => {
            console.error('Error in auto-save to API:', error)
          })
        } else {
          console.log('⚠️ No visit ID available for auto-save to API')
        }
      }, 2000) // Debounce for 2 seconds to reduce API calls

      return () => clearTimeout(timeoutId)
    }
  }, [formData, isOpen, currentVisitId, currentStep])

  const createVisitMutation = useMutation({
    mutationFn: async (visitData: any) => {
      console.log('🚀 Sending visit data to API:', visitData)
      
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('❌ API Error:', error)
        throw new Error(error.error || 'فشل في إنشاء الزيارة')
      }
      
      const result = await response.json()
      console.log('✅ API Response received:', result)
      return result
    },
    onSuccess: (data, variables) => {
      const isDraft = variables?.status === 'DRAFT'
      if (isDraft) {
        alert('✅ تم حفظ الزيارة مؤقتاً بنجاح!\nيمكنك إكمالها لاحقاً من قائمة الزيارات.')
      } else {
        alert('🎉 تم حفظ الزيارة نهائياً بنجاح!\nتم تحويل الحالة إلى "مكتمل" وإنشاء جميع السجلات الطبية المرتبطة.')
      }
      onSuccess?.()
      resetForm()
    },
  })

  // Save draft for current step
  const saveDraftForStep = async (step: number) => {
    try {
      setIsDraftSaving(true)
      
      // Validate current step first
      if (!validateStep(step)) {
        return false
      }

      // Create visit data based on current step
      let visitData: any = {
        patientId,
        scheduledAt: formData.scheduledAt || new Date().toISOString(),
        status: 'DRAFT',
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

      console.log('💾 Saving draft for step:', step, 'with data:', visitData)
      console.log('📝 Form data being saved:', {
        scheduledAt: formData.scheduledAt,
        status: formData.status,
        notes: formData.notes,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        vitalSigns: formData.vitalSigns,
        temperature: formData.temperature,
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        weight: formData.weight,
        height: formData.height,
        cityId: formData.cityId,
        hospitalId: formData.hospitalId,
        doctorIds: formData.doctorIds
      })

      const visit = await createVisitMutation.mutateAsync(visitData)

      // Save current form data to localStorage
      saveDraftToLocalStorage(formData)

      // Only create additional data if we have the required info and we're past step 1
      if (step > 1 && formData.doctorIds.length > 0 && formData.hospitalId) {
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
              scheduledAt: formData.scheduledAt || new Date().toISOString(),
              status: 'SCHEDULED'
            })
          })
        }

        // Create custom tests
        for (const test of formData.customTests) {
          if (test.name) {
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
                scheduledAt: formData.scheduledAt || new Date().toISOString(),
                status: 'SCHEDULED'
              })
            })
          }
        }

        // Create diseases
        for (const disease of formData.diseases) {
          if (disease.name) {
            await fetch('/api/diseases', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId,
                name: disease.name,
                description: disease.description,
                diagnosedAt: formData.scheduledAt || new Date().toISOString(),
                severity: disease.severity,
                status: disease.status
              })
            })
          }
        }

        // Create treatments
        for (const treatment of formData.treatments) {
          if (treatment.name && treatment.scheduledAt) {
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
          if (operation.name && operation.scheduledAt) {
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

      return true
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('حدث خطأ أثناء حفظ المسودة')
      return false
    } finally {
      setIsDraftSaving(false)
    }
  }

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
    setCurrentVisitId(null)
    
    console.log('🗑️ Form reset - ready for new visit')
  }

  const validateStep = (step: number): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.scheduledAt) {
        errors.scheduledAt = 'تاريخ ووقت الزيارة مطلوب'
      } else {
        const visitDate = new Date(formData.scheduledAt)
        const now = new Date()
        if (visitDate < now) {
          errors.scheduledAt = 'تاريخ الزيارة يجب أن يكون في المستقبل'
        }
      }
      
      if (!formData.symptoms?.trim()) {
        errors.symptoms = 'وصف الأعراض مطلوب'
      }
    }

    if (step === 2) {
      if (!formData.cityId) {
        errors.cityId = 'اختيار المدينة مطلوب'
      }
      if (!formData.hospitalId) {
        errors.hospitalId = 'اختيار المستشفى مطلوب'
      }
      if (!formData.doctorIds.length) {
        errors.doctorIds = 'اختيار طبيب واحد على الأقل مطلوب'
      }
    }

    if (step === 3) {
      if (!formData.selectedTests.length && !formData.customTests.length) {
        errors.selectedTests = 'اختيار فحص واحد على الأقل مطلوب'
      }
      
      // Validate custom tests
      formData.customTests.forEach((test, index) => {
        if (!test.name?.trim()) {
          errors[`customTest_${index}_name`] = 'اسم الفحص مطلوب'
        }
      })
    }

    if (step === 4) {
      if (!formData.diseases.length) {
        errors.diseases = 'إضافة مرض واحد على الأقل مطلوب'
      }
      
      // Validate diseases
      formData.diseases.forEach((disease, index) => {
        if (!disease.name?.trim()) {
          errors[`disease_${index}_name`] = 'اسم المرض مطلوب'
        }
        if (!disease.severity?.trim()) {
          errors[`disease_${index}_severity`] = 'شدة المرض مطلوبة'
        }
      })
    }

    if (step === 5) {
      if (!formData.treatments.length && !formData.operations.length) {
        errors.treatments = 'إضافة علاج أو عملية واحدة على الأقل مطلوب'
      }
      
      // Validate treatments
      formData.treatments.forEach((treatment, index) => {
        if (!treatment.name?.trim()) {
          errors[`treatment_${index}_name`] = 'اسم العلاج مطلوب'
        }
        if (!treatment.scheduledAt) {
          errors[`treatment_${index}_scheduledAt`] = 'تاريخ العلاج مطلوب'
        }
      })
      
      // Validate operations
      formData.operations.forEach((operation, index) => {
        if (!operation.name?.trim()) {
          errors[`operation_${index}_name`] = 'اسم العملية مطلوب'
        }
        if (!operation.scheduledAt) {
          errors[`operation_${index}_scheduledAt`] = 'تاريخ العملية مطلوب'
        }
      })
    }

    setValidationErrors(errors)
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      if (isDraft) {
        // Save draft for current step using new system
        const success = await saveDraftToAPI(currentStep)
        if (success) {
          // Show success message with step name
          const stepNames = {
            1: 'معلومات الزيارة الأساسية',
            2: 'اختيار الموقع والطبيب',
            3: 'اختيار الفحوصات',
            4: 'الأمراض المكتشفة',
            5: 'العلاجات والعمليات'
          }
          alert(`✅ تم حفظ ${stepNames[currentStep as keyof typeof stepNames]} مؤقتاً بنجاح!\nيمكنك إكمال باقي الخطوات لاحقاً.`)
        }
        return
      }

      // Final save - validate all steps
      const validation = validateStep(currentStep)
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors)
        if (errorMessages.length > 0) {
          alert(`يرجى تصحيح الأخطاء التالية:\n\n${errorMessages.join('\n')}`)
        }
        return
      }

      // If we're on step 1, only validate basic info
      if (currentStep === 1) {
        if (!formData.scheduledAt) {
          alert('يرجى اختيار تاريخ ووقت الزيارة')
          return
        }
      }

      // If we're on step 2, validate location and doctor
      if (currentStep === 2) {
        if (!formData.doctorIds.length) {
          alert('يرجى اختيار طبيب واحد على الأقل')
          return
        }
        
        if (!formData.hospitalId) {
          alert('يرجى اختيار مستشفى')
          return
        }
      }

      setIsFinalSaving(true)

      // If we have a draft, complete it using the new system
      if (currentVisitId) {
        console.log('🔄 Completing existing draft:', currentVisitId)
        
        const response = await fetch('/api/visit-drafts/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftId: currentVisitId })
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ Draft completed successfully:', result.data)
          alert('✅ تم إكمال الزيارة بنجاح!')
          onSuccess?.()
          onClose()
          return
        } else {
          console.error('❌ Failed to complete draft:', result.error)
          alert('❌ فشل في إكمال الزيارة. يرجى المحاولة مرة أخرى.')
          return
        }
      }

      // If no draft exists, create a new visit using the old system
      console.log('🆕 Creating new visit (no draft found)')
      
      // Create visit data based on current step
      let visitData: any = {
        patientId,
        scheduledAt: formData.scheduledAt,
        status: 'COMPLETED', // Always set to COMPLETED for final save
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

      console.log('🏥 ComprehensiveVisitForm: Creating FINAL visit with data:', visitData)
      console.log('🎯 Final save - Status will be set to COMPLETED')

      const visit = await createVisitMutation.mutateAsync(visitData)
      
      // Set the visit ID if this is a new visit
      if (!currentVisitId) {
        setCurrentVisitId(visit.id)
        console.log('📝 New visit ID set to:', visit.id)
      }

      // Only create additional data if we have the required info
      if (formData.doctorIds.length > 0 && formData.hospitalId) {
        console.log('📊 Creating additional medical records...')
        console.log('🔬 Tests to create:', formData.selectedTests.length)
        console.log('🏥 Custom tests to create:', formData.customTests.length)
        console.log('🦠 Diseases to create:', formData.diseases.length)
        console.log('💊 Treatments to create:', formData.treatments.length)
        console.log('⚕️ Operations to create:', formData.operations.length)
        
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
        
        console.log('✅ All additional medical records created successfully!')
      } else {
        console.log('⚠️ Skipping additional records - missing doctor or hospital info')
      }

    } catch (error) {
      console.error('Error creating visit:', error)
      alert('حدث خطأ أثناء حفظ الزيارة')
    } finally {
      setIsFinalSaving(false)
    }
  }

  const nextStep = async () => {
    const validation = validateStep(currentStep)
    if (validation.isValid) {
      try {
        // Show loading state
        setIsDraftSaving(true)
        
        // Save to new draft system
        await saveDraftToAPI(currentStep)
        console.log(`💾 Step ${currentStep} saved to draft system`)
        
        // Move to next step immediately
        setCurrentStep(prev => {
          const nextStepNum = Math.min(prev + 1, 5)
          console.log(`🔄 Moving from step ${prev} to step ${nextStepNum}`)
          
          return nextStepNum
        })
      } catch (error) {
        console.error('Error in nextStep:', error)
        alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.')
      } finally {
        setIsDraftSaving(false)
      }
    } else {
      console.log('❌ Validation failed, staying on current step')
      console.log('❌ Validation errors:', validation.errors)
      
      // Show validation errors to user
      const errorMessages = Object.values(validation.errors)
      if (errorMessages.length > 0) {
        alert(`يرجى تصحيح الأخطاء التالية:\n\n${errorMessages.join('\n')}`)
      }
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
    setFormData(prev => {
      const newDoctorIds = prev.doctorIds.includes(doctorId)
        ? prev.doctorIds.filter(id => id !== doctorId)
        : [...prev.doctorIds, doctorId]
      
      console.log('🔄 Toggling doctor:', doctorId)
      console.log('🔄 Previous doctorIds:', prev.doctorIds)
      console.log('🔄 New doctorIds:', newDoctorIds)
      
      return {
        ...prev,
        doctorIds: newDoctorIds
      }
    })
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
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(false) // Final save
      }}
      submitText={isFinalSaving ? 'جاري الحفظ...' : 'حفظ نهائي'}
      loading={isFinalSaving}
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-6">
          {[
            { step: 1, title: 'معلومات أساسية' },
            { step: 2, title: 'الموقع والطبيب' },
            { step: 3, title: 'الفحوصات' },
            { step: 4, title: 'الأمراض' },
            { step: 5, title: 'العلاجات' }
          ].map(({ step, title }) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-8 h-0.5 mx-2 transition-all duration-200 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Current Step Title */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {currentStep === 1 && 'معلومات الزيارة الأساسية'}
            {currentStep === 2 && 'اختيار الموقع والطبيب'}
            {currentStep === 3 && 'اختيار الفحوصات'}
            {currentStep === 4 && 'الأمراض المكتشفة'}
            {currentStep === 5 && 'العلاجات والعمليات'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            الخطوة {currentStep} من 5
          </p>
          
          {/* Loading indicator */}
          {isLoadingDraft && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-700">جاري تحميل البيانات المحفوظة...</span>
              </div>
            </div>
          )}

          {/* Debug Info - Only show in development */}
          {process.env.NODE_ENV === 'development' && !isLoadingDraft && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
              <h4 className="text-sm font-medium text-gray-700 mb-2">🔍 معلومات التصحيح:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>تاريخ الزيارة:</strong> {formData.scheduledAt || 'غير محدد'}</p>
                <p><strong>الحالة:</strong> {formData.status}</p>
                <p><strong>الأعراض:</strong> {formData.symptoms || 'غير محدد'}</p>
                <p><strong>التشخيص:</strong> {formData.diagnosis || 'غير محدد'}</p>
                <p><strong>الملاحظات:</strong> {formData.notes || 'غير محدد'}</p>
                <p><strong>المدينة:</strong> {formData.cityId || 'غير محدد'}</p>
                <p><strong>المستشفى:</strong> {formData.hospitalId || 'غير محدد'}</p>
                <p><strong>الأطباء:</strong> {formData.doctorIds.length > 0 ? formData.doctorIds.join(', ') : 'غير محدد'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 1: Basic Visit Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 ml-2" />
                  معلومات الزيارة الأساسية
                </div>
                {patientData && isNewVisit && (
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyPatientData}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <User className="w-4 h-4 ml-2" />
                      تطبيق بيانات المريض
                    </Button>
                    {patientData.tests && patientData.tests.length > 0 && (
                      <p className="text-xs text-gray-500 text-right">
                        سيتم تطبيق {patientData.tests.length} فحص مختار للمريض
                      </p>
                    )}
                  </div>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                أدخل المعلومات الأساسية للزيارة. يمكنك حفظ هذه الخطوة مؤقتاً والعودة إليها لاحقاً.
              </p>
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
                <Label htmlFor="symptoms">الأعراض *</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="وصف الأعراض التي يشكو منها المريض"
                  className={validationErrors.symptoms ? 'border-red-500' : ''}
                />
                {validationErrors.symptoms && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.symptoms}</p>
                )}
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
              <p className="text-sm text-gray-600 mt-2">
                اختر المدينة والمستشفى والطبيب المسؤول عن هذه الزيارة. هذه المعلومات مطلوبة لإكمال الزيارة.
              </p>
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
                  {filteredDoctors.map((doctor: Doctor) => {
                    const isSelected = formData.doctorIds.includes(doctor.id)
                    console.log(`👨‍⚕️ Doctor ${doctor.firstName} ${doctor.lastName} (${doctor.id}): selected=${isSelected}`)
                    return (
                      <div
                        key={doctor.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
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
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    )
                  })}
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
              <p className="text-sm text-gray-600 mt-2">
                اختر الفحوصات المطلوبة أو أضف فحوصات مخصصة. يمكنك تخطي هذه الخطوة إذا لم تكن هناك فحوصات مطلوبة.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الفحوصات الشائعة *</Label>
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 ${
                  validationErrors.selectedTests ? 'ring-2 ring-red-500 rounded-lg p-2' : ''
                }`}>
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
                {validationErrors.selectedTests && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.selectedTests}</p>
                )}
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
              <p className="text-sm text-gray-600 mt-2">
                بناءً على الفحوصات والتشخيص، أضف أي أمراض تم اكتشافها. يمكنك تخطي هذه الخطوة إذا لم يتم اكتشاف أي أمراض.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  بناءً على الفحوصات، هل تم اكتشاف أي أمراض؟ *
                </p>
                <Button size="sm" onClick={addDisease}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مرض
                </Button>
              </div>
              {validationErrors.diseases && (
                <p className="text-red-500 text-sm">{validationErrors.diseases}</p>
              )}

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
              <p className="text-sm text-gray-600 mt-2">
                أضف العلاجات والعمليات المطلوبة بناءً على التشخيص. هذه هي الخطوة الأخيرة قبل الحفظ النهائي.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Treatments */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">العلاجات المطلوبة *</h3>
                  <Button size="sm" onClick={addTreatment}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة علاج
                  </Button>
                </div>
                {validationErrors.treatments && (
                  <p className="text-red-500 text-sm mb-4">{validationErrors.treatments}</p>
                )}
                {formData.treatments.map((treatment, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 mb-4 bg-green-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label>اسم العلاج *</Label>
                        <Input
                          placeholder="اسم العلاج"
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
                        <Label>فئة العلاج</Label>
                        <Select
                          value={treatment.category || ''}
                          onValueChange={(value) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].category = value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فئة العلاج" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="دوائي">دوائي</SelectItem>
                            <SelectItem value="فيزيائي">فيزيائي</SelectItem>
                            <SelectItem value="نفسي">نفسي</SelectItem>
                            <SelectItem value="جراحي">جراحي</SelectItem>
                            <SelectItem value="أخرى">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>موعد العلاج *</Label>
                        <Input
                          type="datetime-local"
                          placeholder="موعد العلاج"
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
                      <div>
                        <Label>الكمية</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={treatment.quantity || 1}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].quantity = parseInt(e.target.value) || 1
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                        />
                      </div>
                      <div>
                        <Label>التكلفة (دينار)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={treatment.cost || 0}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].cost = parseFloat(e.target.value) || 0
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                        />
                      </div>
                      <div>
                        <Label>المدة</Label>
                        <Input
                          placeholder="مثال: 7 أيام"
                          value={treatment.duration || ''}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].duration = e.target.value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                        />
                      </div>
                      <div>
                        <Label>الحالة</Label>
                        <Select
                          value={treatment.status}
                          onValueChange={(value) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].status = value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="حالة العلاج" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SCHEDULED">مجدول</SelectItem>
                            <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                            <SelectItem value="COMPLETED">مكتمل</SelectItem>
                            <SelectItem value="CANCELLED">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newTreatments = formData.treatments.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>وصف العلاج</Label>
                        <Textarea
                          placeholder="وصف العلاج"
                          value={treatment.description}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].description = e.target.value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>ملاحظات إضافية</Label>
                        <Textarea
                          placeholder="ملاحظات إضافية"
                          value={treatment.notes || ''}
                          onChange={(e) => {
                            const newTreatments = [...formData.treatments]
                            newTreatments[index].notes = e.target.value
                            setFormData(prev => ({ ...prev, treatments: newTreatments }))
                          }}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Operations */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">العمليات المطلوبة *</h3>
                  <Button size="sm" onClick={addOperation}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة عملية
                  </Button>
                </div>
                {validationErrors.operations && (
                  <p className="text-red-500 text-sm mb-4">{validationErrors.operations}</p>
                )}
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
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            ← السابق
          </Button>
          
          <div className="flex gap-3">
            {currentStep < 5 && (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={isDraftSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isDraftSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ والانتقال...
                  </>
                ) : (
                  <>
                    التالي →
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              onClick={async () => {
                const success = await saveDraftToAPI(currentStep)
                if (success) {
                  const stepNames = {
                    1: 'معلومات الزيارة الأساسية',
                    2: 'اختيار الموقع والطبيب',
                    3: 'اختيار الفحوصات',
                    4: 'الأمراض المكتشفة',
                    5: 'العلاجات والعمليات'
                  }
                  alert(`✅ تم حفظ ${stepNames[currentStep as keyof typeof stepNames]} مؤقتاً بنجاح!`)
                }
              }}
              disabled={isDraftSaving || isFinalSaving}
              variant="outline"
              className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {isDraftSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  💾 حفظ مؤقت (الخطوة {currentStep})
                </>
              )}
            </Button>
            {currentStep === 5 && (
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isDraftSaving || isFinalSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isFinalSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    ✅ حفظ نهائي
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  )
}
