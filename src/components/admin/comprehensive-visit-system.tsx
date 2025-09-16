'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  User, 
  Stethoscope, 
  TestTube, 
  Heart, 
  Activity, 
  Pill,
  Plus,
  Trash2,
  Save,
  CheckCircle
} from 'lucide-react'

interface ComprehensiveVisitSystemProps {
  patientId: string
  isOpen: boolean
  onClose: () => void
  visitId?: string
}

interface VisitData {
  id?: string
  scheduledAt: string
  symptoms: string
  notes: string
  diagnosis: string
  doctorId: string
  hospitalId: string
  cityId: string
  tests: TestData[]
  diseases: DiseaseData[]
  treatments: TreatmentData[]
  operations: OperationData[]
  medications: MedicationData[]
}

interface TestData {
  id?: string
  name: string
  description: string
  scheduledAt: string
  results?: string
}

interface DiseaseData {
  id?: string
  name: string
  description: string
  diagnosedAt: string
  severity: string
  status: string
}

interface TreatmentData {
  id?: string
  name: string
  description: string
  scheduledAt: string
  notes?: string
}

interface OperationData {
  id?: string
  name: string
  description: string
  scheduledAt: string
  notes?: string
}

interface MedicationData {
  id?: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  startDate: string
  endDate?: string
}

export default function ComprehensiveVisitSystem({ 
  patientId, 
  isOpen, 
  onClose, 
  visitId 
}: ComprehensiveVisitSystemProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [visitData, setVisitData] = useState<VisitData>({
    scheduledAt: '',
    symptoms: '',
    notes: '',
    diagnosis: '',
    doctorId: '',
    hospitalId: '',
    cityId: '',
    tests: [],
    diseases: [],
    treatments: [],
    operations: [],
    medications: []
  })

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
      console.log('🔄 ===== LOADING EXISTING VISIT DATA =====')
      console.log('📊 Raw existing visit data:', JSON.stringify(existingVisit, null, 2))
      console.log('🔍 Visit ID:', existingVisit.id)
      console.log('👤 Patient ID:', existingVisit.patientId)
      console.log('🏥 Hospital ID:', existingVisit.hospitalId)
      console.log('👨‍⚕️ Doctor ID:', existingVisit.doctorId)
      console.log('🏙️ City ID:', existingVisit.cityId)
      console.log('📅 Scheduled At:', existingVisit.scheduledAt)
      console.log('📝 Current Step:', existingVisit.currentStep)
      console.log('🧪 Tests Count:', existingVisit.tests?.length || 0)
      console.log('🧪 Tests Data:', existingVisit.tests)
      console.log('🦠 Diseases Count:', existingVisit.diseases?.length || 0)
      console.log('💊 Treatments Count:', existingVisit.treatments?.length || 0)
      console.log('🏥 Operations Count:', existingVisit.operations?.length || 0)
      console.log('💉 Medications Count:', existingVisit.medications?.length || 0)
      
      // Convert scheduledAt to datetime-local format
      const formatDateTime = (dateString: string) => {
        if (!dateString) return ''
        
        try {
          // Parse the date string
          const date = new Date(dateString)
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.error('❌ Invalid date:', dateString)
            return ''
          }
          
          // Get local timezone offset and adjust
          const timezoneOffset = date.getTimezoneOffset() * 60000
          const localDate = new Date(date.getTime() - timezoneOffset)
          
          // Format as YYYY-MM-DDTHH:mm for datetime-local input
          const year = localDate.getFullYear()
          const month = String(localDate.getMonth() + 1).padStart(2, '0')
          const day = String(localDate.getDate()).padStart(2, '0')
          const hours = String(localDate.getHours()).padStart(2, '0')
          const minutes = String(localDate.getMinutes()).padStart(2, '0')
          
          const formatted = `${year}-${month}-${day}T${hours}:${minutes}`
          
          console.log('📅 Date conversion:', {
            original: dateString,
            parsed: date.toISOString(),
            local: localDate.toISOString(),
            formatted: formatted,
            timezoneOffset: timezoneOffset
          })
          
          return formatted
        } catch (error) {
          console.error('❌ Date conversion error:', error)
          return ''
        }
      }
      
           const formattedVisitData = {
             id: existingVisit.id,
             scheduledAt: formatDateTime(existingVisit.scheduledAt),
             symptoms: existingVisit.symptoms || '',
             notes: existingVisit.notes || '',
             diagnosis: existingVisit.diagnosis || '',
             doctorId: existingVisit.doctorId || '',
             hospitalId: existingVisit.hospitalId || '',
             cityId: existingVisit.cityId || '',
             tests: existingVisit.tests?.map((test: any) => ({
               name: test.name,
               description: test.description || '',
               scheduledAt: test.scheduledAt ? new Date(test.scheduledAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               status: test.status || 'SCHEDULED',
               results: test.results || '',
               notes: test.notes || '',
               images: test.images || []
             })) || [],
             diseases: existingVisit.diseases?.map((disease: any) => ({
               name: disease.name,
               description: disease.description || '',
               diagnosedAt: disease.diagnosedAt ? new Date(disease.diagnosedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               severity: disease.severity || '',
               status: disease.status || 'Active'
             })) || [],
             treatments: existingVisit.treatments?.map((treatment: any) => ({
               name: treatment.name,
               description: treatment.description || '',
               scheduledAt: treatment.scheduledAt ? new Date(treatment.scheduledAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               notes: treatment.notes || ''
             })) || [],
             operations: existingVisit.operations?.map((operation: any) => ({
               name: operation.name,
               description: operation.description || '',
               scheduledAt: operation.scheduledAt ? new Date(operation.scheduledAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               notes: operation.notes || ''
             })) || [],
             medications: existingVisit.medications?.map((medication: any) => ({
               name: medication.name,
               dosage: medication.dosage || '',
               frequency: medication.frequency || '',
               duration: medication.duration || '',
               instructions: medication.instructions || '',
               startDate: medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               endDate: medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : ''
             })) || []
           }
      
      console.log('📝 Formatted visit data for state:', JSON.stringify(formattedVisitData, null, 2))
      
      setVisitData(formattedVisitData)
      setCurrentStep(existingVisit.currentStep || 1)
      
           console.log('✅ ===== VISIT DATA LOADED SUCCESSFULLY =====')
           console.log('📊 Final visit data state:', formattedVisitData)
           console.log('📝 Current step set to:', existingVisit.currentStep || 1)
           console.log('🧪 Tests loaded:', formattedVisitData.tests.length, 'items')
           console.log('🧪 Tests details:', JSON.stringify(formattedVisitData.tests, null, 2))
           console.log('🦠 Diseases loaded:', formattedVisitData.diseases.length, 'items')
           console.log('🦠 Diseases details:', JSON.stringify(formattedVisitData.diseases, null, 2))
           console.log('💊 Treatments loaded:', formattedVisitData.treatments.length, 'items')
           console.log('🏥 Operations loaded:', formattedVisitData.operations.length, 'items')
           console.log('💉 Medications loaded:', formattedVisitData.medications.length, 'items')
    }
  }, [existingVisit])

  // Fetch data for dropdowns
  const { data: cities, isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await fetch('/api/cities')
      const result = await response.json()
      console.log('🏙️ Cities query result:', result)
      return result.data || []
    }
  })

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await fetch('/api/doctors')
      const result = await response.json()
      console.log('👨‍⚕️ Doctors query result:', result)
      return result.data || []
    }
  })

  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await fetch('/api/hospitals')
      const result = await response.json()
      console.log('🏥 Hospitals query result:', result)
      return result.data || []
    }
  })

  const { data: availableTests, isLoading: isLoadingTests } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      console.log('🧪 ===== FETCHING AVAILABLE TESTS =====')
      console.log('🌐 API endpoint: /api/tests')
      
      const response = await fetch('/api/tests')
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const result = await response.json()
      console.log('📥 Raw API response:', JSON.stringify(result, null, 2))
      
      const tests = result.data || []
      console.log('🧪 Available tests count:', tests.length)
      console.log('🧪 Available tests data:', JSON.stringify(tests, null, 2))
      
      return tests
    }
  })

  const { data: availableDiseases, isLoading: isLoadingDiseases } = useQuery({
    queryKey: ['diseases'],
    queryFn: async () => {
      console.log('🦠 ===== FETCHING AVAILABLE DISEASES =====')
      const response = await fetch('/api/diseases')
      const result = await response.json()
      console.log('🦠 Available diseases count:', result.data?.length || 0)
      return result.data || []
    }
  })

  const { data: availableTreatments, isLoading: isLoadingTreatments } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      console.log('💊 ===== FETCHING AVAILABLE TREATMENTS =====')
      const response = await fetch('/api/treatments')
      const result = await response.json()
      console.log('💊 Available treatments count:', result.data?.length || 0)
      return result.data || []
    }
  })

  const { data: availableOperations, isLoading: isLoadingOperations } = useQuery({
    queryKey: ['operations'],
    queryFn: async () => {
      console.log('🏥 ===== FETCHING AVAILABLE OPERATIONS =====')
      const response = await fetch('/api/operations')
      const result = await response.json()
      console.log('🏥 Available operations count:', result.data?.length || 0)
      return result.data || []
    }
  })

  const { data: availableMedications, isLoading: isLoadingMedications } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      console.log('💉 ===== FETCHING AVAILABLE MEDICATIONS =====')
      const response = await fetch('/api/medications')
      const result = await response.json()
      console.log('💉 Available medications count:', result.data?.length || 0)
      return result.data || []
    }
  })

  // Filter hospitals based on selected city
  const filteredHospitals = hospitals?.filter((hospital: any) => 
    !visitData.cityId || hospital.cityId === visitData.cityId
  ) || []

  // Filter doctors based on selected hospital
  const filteredDoctors = doctors?.filter((doctor: any) => 
    !visitData.hospitalId || doctor.hospitalId === visitData.hospitalId
  ) || []

  // Save visit (draft or complete)
  const saveVisit = useMutation({
    mutationFn: async (isComplete: boolean) => {
      console.log('💾 ===== SAVING VISIT =====')
      console.log('🔄 Save type:', isComplete ? 'COMPLETE' : 'DRAFT')
      console.log('🔍 Visit ID:', visitId)
      console.log('👤 Patient ID:', patientId)
      console.log('📅 Scheduled At:', visitData.scheduledAt)
      console.log('🏙️ City ID:', visitData.cityId)
      console.log('🏥 Hospital ID:', visitData.hospitalId)
      console.log('👨‍⚕️ Doctor ID:', visitData.doctorId)
      console.log('📝 Current Step:', currentStep)
      console.log('📊 Status:', isComplete ? 'COMPLETED' : 'DRAFT')
      console.log('🧪 Tests Count:', visitData.tests.length)
      console.log('🧪 Tests Data:', JSON.stringify(visitData.tests, null, 2))
      console.log('🦠 Diseases Count:', visitData.diseases.length)
      console.log('💊 Treatments Count:', visitData.treatments.length)
      console.log('🏥 Operations Count:', visitData.operations.length)
      console.log('💉 Medications Count:', visitData.medications.length)
      console.log('📝 Full visit data:', JSON.stringify(visitData, null, 2))
      
      // Use different endpoints: simple for draft, comprehensive for complete
      const apiEndpoint = isComplete ? '/api/visits/comprehensive' : '/api/visits'
      
            const requestBody = isComplete ? {
              // Complete save with all data
              id: visitId,
              patientId,
              scheduledAt: visitData.scheduledAt,
              symptoms: visitData.symptoms,
              notes: visitData.notes,
              diagnosis: visitData.diagnosis,
              doctorId: visitData.doctorId,
              hospitalId: visitData.hospitalId,
              cityId: visitData.cityId,
              status: 'COMPLETED',
              tests: visitData.tests,
              diseases: visitData.diseases,
              treatments: visitData.treatments,
              operations: visitData.operations,
              medications: visitData.medications
            } : {
              // Draft save with basic data including city/hospital/doctor
              ...(visitId && { id: visitId }),
              patientId,
              scheduledAt: visitData.scheduledAt,
              symptoms: visitData.symptoms,
              notes: visitData.notes,
              diagnosis: visitData.diagnosis,
              doctorId: visitData.doctorId,
              hospitalId: visitData.hospitalId,
              cityId: visitData.cityId,
              currentStep: currentStep,
              status: 'DRAFT',
              tests: visitData.tests,
              diseases: visitData.diseases,
              treatments: visitData.treatments,
              operations: visitData.operations,
              medications: visitData.medications
            }
      
      console.log('🌐 ===== MAKING API REQUEST =====')
      console.log('🔗 API endpoint:', apiEndpoint)
      console.log('📤 Request method:', visitId ? 'PUT' : 'POST')
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(apiEndpoint, {
        method: visitId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📡 ===== API RESPONSE =====')
      console.log('📡 Response status:', response.status)
      console.log('📡 Response status text:', response.statusText)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('📡 Response OK:', response.ok)
      
      const result = await response.json()
      console.log('📥 Raw response data:', JSON.stringify(result, null, 2))
      
      if (result.tests) {
        console.log('🧪 Tests in response:', result.tests.length, 'items')
        console.log('🧪 Tests data:', JSON.stringify(result.tests, null, 2))
      }
      
      // Check if response is successful
      if (!response.ok) {
        console.error('❌ ===== HTTP ERROR =====')
        console.error('❌ Status:', response.status)
        console.error('❌ Status text:', response.statusText)
        console.error('❌ Error data:', result)
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      console.log('✅ ===== API SUCCESS =====')
      
      // For simple API, result is the data directly
      // For comprehensive API, result has success/data structure
      if (result.success !== undefined) {
        // Comprehensive API response
        console.log('🔍 Comprehensive API response detected')
        if (!result.success) {
          console.error('❌ API Error:', result.error)
          throw new Error(result.error)
        }
        console.log('✅ API Success - Data:', JSON.stringify(result.data, null, 2))
        if (result.data.tests) {
          console.log('🧪 Tests in success data:', result.data.tests.length, 'items')
        }
        return result.data
      } else {
        // Simple API response (data directly)
        console.log('🔍 Simple API response detected')
        console.log('✅ API Success - Direct data:', JSON.stringify(result, null, 2))
        if (result.tests) {
          console.log('🧪 Tests in direct data:', result.tests.length, 'items')
        }
        return result
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', patientId] })
      const isComplete = variables
      toast.success(isComplete ? 'تم حفظ الزيارة بنجاح' : 'تم حفظ المسودة بنجاح')
      if (isComplete) {
        onClose()
      }
    },
    onError: (error) => {
      console.error('❌ ===== SAVE ERROR =====')
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      console.error('❌ Full error object:', error)
      toast.error('حدث خطأ في الحفظ')
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

  // Test management
  const addTest = (testName?: string, testDescription?: string) => {
    console.log('🧪 ===== ADDING TEST =====')
    console.log('📝 Test name:', testName)
    console.log('📄 Test description:', testDescription)
    console.log('📊 Current tests count:', visitData.tests.length)
    console.log('📊 Current tests:', JSON.stringify(visitData.tests, null, 2))
    
    const newTest = {
      name: testName || '',
      description: testDescription || '',
      scheduledAt: new Date().toISOString().split('T')[0]
    }
    
    console.log('🆕 New test to add:', JSON.stringify(newTest, null, 2))
    
    const updatedTests = [...visitData.tests, newTest]
    
    console.log('📊 Updated tests array:', JSON.stringify(updatedTests, null, 2))
    
    setVisitData({
      ...visitData,
      tests: updatedTests
    })
    
    console.log('✅ Test added successfully!')
    console.log('📊 New tests count:', updatedTests.length)
  }

  const updateTest = (index: number, field: keyof TestData, value: string) => {
    console.log('🔄 ===== UPDATING TEST =====')
    console.log('📊 Test index:', index)
    console.log('🔧 Field to update:', field)
    console.log('📝 New value:', value)
    console.log('📊 Current tests:', JSON.stringify(visitData.tests, null, 2))
    
    const newTests = [...visitData.tests]
    newTests[index] = { ...newTests[index], [field]: value }
    
    console.log('📊 Updated tests array:', JSON.stringify(newTests, null, 2))
    
    setVisitData({ ...visitData, tests: newTests })
    
    console.log('✅ Test updated successfully!')
  }

  const removeTest = (index: number) => {
    console.log('🗑️ ===== REMOVING TEST =====')
    console.log('📊 Test index to remove:', index)
    console.log('📊 Current tests:', JSON.stringify(visitData.tests, null, 2))
    
    const newTests = visitData.tests.filter((_, i) => i !== index)
    
    console.log('📊 Updated tests array after removal:', JSON.stringify(newTests, null, 2))
    
    setVisitData({ ...visitData, tests: newTests })
    
    console.log('✅ Test removed successfully!')
    console.log('📊 New tests count:', newTests.length)
  }

  // Disease management
  const addDisease = (diseaseName?: string, diseaseDescription?: string) => {
    console.log('🦠 ===== ADDING DISEASE =====')
    console.log('📝 Disease name:', diseaseName)
    console.log('📄 Disease description:', diseaseDescription)
    console.log('📊 Current diseases count:', visitData.diseases.length)
    
    const newDisease = {
      name: diseaseName || '',
      description: diseaseDescription || '',
      diagnosedAt: new Date().toISOString().split('T')[0],
      severity: '',
      status: 'Active'
    }
    
    console.log('🆕 New disease to add:', JSON.stringify(newDisease, null, 2))
    
    const updatedDiseases = [...visitData.diseases, newDisease]
    
    console.log('📊 Updated diseases array:', JSON.stringify(updatedDiseases, null, 2))
    
    setVisitData({
      ...visitData,
      diseases: updatedDiseases
    })
    
    console.log('✅ Disease added successfully!')
    console.log('📊 New diseases count:', updatedDiseases.length)
  }

  const updateDisease = (index: number, field: keyof DiseaseData, value: string) => {
    const newDiseases = [...visitData.diseases]
    newDiseases[index] = { ...newDiseases[index], [field]: value }
    setVisitData({ ...visitData, diseases: newDiseases })
  }

  const removeDisease = (index: number) => {
    const newDiseases = visitData.diseases.filter((_, i) => i !== index)
    setVisitData({ ...visitData, diseases: newDiseases })
  }

  // Treatment management
  const addTreatment = (treatmentName?: string, treatmentDescription?: string) => {
    console.log('💊 ===== ADDING TREATMENT =====')
    console.log('📝 Treatment name:', treatmentName)
    console.log('📄 Treatment description:', treatmentDescription)
    console.log('📊 Current treatments count:', visitData.treatments.length)
    
    const newTreatment = {
      name: treatmentName || '',
      description: treatmentDescription || '',
      scheduledAt: new Date().toISOString().split('T')[0],
      notes: ''
    }
    
    console.log('🆕 New treatment to add:', JSON.stringify(newTreatment, null, 2))
    
    const updatedTreatments = [...visitData.treatments, newTreatment]
    
    console.log('📊 Updated treatments array:', JSON.stringify(updatedTreatments, null, 2))
    
    setVisitData({
      ...visitData,
      treatments: updatedTreatments
    })
    
    console.log('✅ Treatment added successfully!')
    console.log('📊 New treatments count:', updatedTreatments.length)
  }

  const updateTreatment = (index: number, field: keyof TreatmentData, value: string) => {
    const newTreatments = [...visitData.treatments]
    newTreatments[index] = { ...newTreatments[index], [field]: value }
    setVisitData({ ...visitData, treatments: newTreatments })
  }

  const removeTreatment = (index: number) => {
    const newTreatments = visitData.treatments.filter((_, i) => i !== index)
    setVisitData({ ...visitData, treatments: newTreatments })
  }

  // Operation management
  const addOperation = (operationName?: string, operationDescription?: string) => {
    console.log('🏥 ===== ADDING OPERATION =====')
    console.log('📝 Operation name:', operationName)
    console.log('📄 Operation description:', operationDescription)
    console.log('📊 Current operations count:', visitData.operations.length)
    
    const newOperation = {
      name: operationName || '',
      description: operationDescription || '',
      scheduledAt: new Date().toISOString().split('T')[0],
      notes: ''
    }
    
    console.log('🆕 New operation to add:', JSON.stringify(newOperation, null, 2))
    
    const updatedOperations = [...visitData.operations, newOperation]
    
    console.log('📊 Updated operations array:', JSON.stringify(updatedOperations, null, 2))
    
    setVisitData({
      ...visitData,
      operations: updatedOperations
    })
    
    console.log('✅ Operation added successfully!')
    console.log('📊 New operations count:', updatedOperations.length)
  }

  const updateOperation = (index: number, field: keyof OperationData, value: string) => {
    const newOperations = [...visitData.operations]
    newOperations[index] = { ...newOperations[index], [field]: value }
    setVisitData({ ...visitData, operations: newOperations })
  }

  const removeOperation = (index: number) => {
    const newOperations = visitData.operations.filter((_, i) => i !== index)
    setVisitData({ ...visitData, operations: newOperations })
  }

  // Medication management
  const addMedication = (medicationName?: string, dosage?: string, frequency?: string, duration?: string, instructions?: string) => {
    console.log('💉 ===== ADDING MEDICATION =====')
    console.log('📝 Medication name:', medicationName)
    console.log('💊 Dosage:', dosage)
    console.log('🔄 Frequency:', frequency)
    console.log('⏱️ Duration:', duration)
    console.log('📋 Instructions:', instructions)
    console.log('📊 Current medications count:', visitData.medications.length)
    
    const newMedication = {
      name: medicationName || '',
      dosage: dosage || '',
      frequency: frequency || '',
      duration: duration || '',
      instructions: instructions || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    }
    
    console.log('🆕 New medication to add:', JSON.stringify(newMedication, null, 2))
    
    const updatedMedications = [...visitData.medications, newMedication]
    
    console.log('📊 Updated medications array:', JSON.stringify(updatedMedications, null, 2))
    
    setVisitData({
      ...visitData,
      medications: updatedMedications
    })
    
    console.log('✅ Medication added successfully!')
    console.log('📊 New medications count:', updatedMedications.length)
  }

  const updateMedication = (index: number, field: keyof MedicationData, value: string) => {
    const newMedications = [...visitData.medications]
    newMedications[index] = { ...newMedications[index], [field]: value }
    setVisitData({ ...visitData, medications: newMedications })
  }

  const removeMedication = (index: number) => {
    const newMedications = visitData.medications.filter((_, i) => i !== index)
    setVisitData({ ...visitData, medications: newMedications })
  }

  if (!isOpen) return null

  // Show loading state while fetching existing visit data
  if (visitId && isLoadingVisit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">جاري تحميل بيانات الزيارة...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while fetching basic data (cities, hospitals, doctors, tests, diseases, treatments, operations, medications)
  if (isLoadingCities || isLoadingHospitals || isLoadingDoctors || isLoadingTests || isLoadingDiseases || isLoadingTreatments || isLoadingOperations || isLoadingMedications) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">جاري تحميل البيانات الأساسية...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {visitId ? 'تعديل الزيارة الشاملة' : 'زيارة شاملة جديدة'} - الخطوة {currentStep} من 5
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

        {/* Step 1: Basic Visit Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                معلومات الزيارة الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledAt">تاريخ ووقت الزيارة</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={visitData.scheduledAt}
                    onChange={(e) => setVisitData({...visitData, scheduledAt: e.target.value})}
                    style={{ direction: 'ltr' }}
                    className="text-left"
                  />
                </div>
                <div>
                  <Label htmlFor="cityId">المدينة</Label>
                  <Select value={visitData.cityId} onValueChange={(value) => {
                    setVisitData({...visitData, cityId: value, hospitalId: '', doctorId: ''})
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCities ? "جاري التحميل..." : "اختر المدينة"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCities ? (
                        <SelectItem value="" disabled>
                          جاري التحميل...
                        </SelectItem>
                      ) : (
                        cities?.map((city: any) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospitalId">المستشفى</Label>
                  <Select 
                    value={visitData.hospitalId} 
                    onValueChange={(value) => {
                      setVisitData({...visitData, hospitalId: value, doctorId: ''})
                    }}
                    disabled={!visitData.cityId || isLoadingHospitals}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingHospitals ? "جاري التحميل..." : 
                        visitData.cityId ? "اختر المستشفى" : "اختر المدينة أولاً"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingHospitals ? (
                        <SelectItem value="" disabled>
                          جاري التحميل...
                        </SelectItem>
                      ) : (
                        filteredHospitals?.map((hospital: any) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctorId">الطبيب</Label>
                  <Select 
                    value={visitData.doctorId} 
                    onValueChange={(value) => setVisitData({...visitData, doctorId: value})}
                    disabled={!visitData.hospitalId || isLoadingDoctors}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingDoctors ? "جاري التحميل..." :
                        visitData.hospitalId ? "اختر الطبيب" : "اختر المستشفى أولاً"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDoctors ? (
                        <SelectItem value="" disabled>
                          جاري التحميل...
                        </SelectItem>
                      ) : (
                        filteredDoctors?.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            د. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="symptoms">الأعراض</Label>
                <Textarea
                  id="symptoms"
                  value={visitData.symptoms}
                  onChange={(e) => setVisitData({...visitData, symptoms: e.target.value})}
                  placeholder="وصف الأعراض..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={visitData.notes}
                  onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
                  placeholder="ملاحظات إضافية..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Tests */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <TestTube className="w-5 h-5 mr-2" />
                  الفحوصات المطلوبة
                </div>
                <Button onClick={() => addTest()} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة فحص
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Available Tests Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  اختر من الفحوصات المتاحة:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {availableTests?.map((test: any) => {
                    const isSelected = visitData.tests.some(selectedTest => selectedTest.name === test.name)
                    console.log('🧪 Checking test:', test.name, 'isSelected:', isSelected)
                    console.log('🧪 Current visitData.tests:', visitData.tests.map(t => t.name))
                    return (
                      <button
                        key={test.id}
                        onClick={() => addTest(test.name, test.description)}
                        disabled={isSelected}
                        className={`text-right p-2 text-sm rounded border transition-colors ${
                          isSelected 
                            ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium flex items-center justify-between">
                          {test.name}
                          {isSelected && <span className="text-green-600">✓</span>}
                        </div>
                        {test.description && (
                          <div className="text-xs text-gray-500 mt-1">{test.description}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Tests */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  الفحوصات المختارة ({visitData.tests.length}):
                </Label>
                {(() => {
                  console.log('🧪 ===== RENDERING SELECTED TESTS =====')
                  console.log('🧪 Visit data tests:', JSON.stringify(visitData.tests, null, 2))
                  console.log('🧪 Tests count:', visitData.tests.length)
                  return null
                })()}
              </div>
              {visitData.tests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد فحوصات مضافة
                </div>
              ) : (
                <div className="space-y-4">
                  {visitData.tests.map((test, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-blue-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>اسم الفحص</Label>
                          <Input
                            value={test.name}
                            onChange={(e) => updateTest(index, 'name', e.target.value)}
                            placeholder="اسم الفحص"
                          />
                        </div>
                        <div>
                          <Label>تاريخ الفحص</Label>
                          <Input
                            type="date"
                            value={test.scheduledAt}
                            onChange={(e) => updateTest(index, 'scheduledAt', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTest(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>وصف الفحص</Label>
                        <Textarea
                          value={test.description}
                          onChange={(e) => updateTest(index, 'description', e.target.value)}
                          placeholder="وصف الفحص..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Diseases */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  الأمراض المشخصة
                </div>
                <Button 
                  onClick={() => addDisease()} 
                  size="sm"
                  disabled={isLoadingDiseases}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoadingDiseases ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {isLoadingDiseases ? 'جاري التحميل...' : 'إضافة مرض'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Available Diseases Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  اختر من الأمراض المتاحة:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {availableDiseases?.map((disease: any) => {
                    const isSelected = visitData.diseases.some(selectedDisease => selectedDisease.name === disease.name)
                    console.log('🦠 Checking disease:', disease.name, 'isSelected:', isSelected)
                    console.log('🦠 Current visitData.diseases:', visitData.diseases.map(d => d.name))
                    return (
                      <button
                        key={disease.id}
                        onClick={() => addDisease(disease.name, disease.description)}
                        disabled={isSelected}
                        className={`text-right p-2 text-sm rounded border transition-colors ${
                          isSelected 
                            ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                            : 'hover:bg-red-50 hover:border-red-300'
                        }`}
                      >
                        <div className="font-medium flex items-center justify-between">
                          {disease.name}
                          {isSelected && <span className="text-green-600">✓</span>}
                        </div>
                        {disease.description && (
                          <div className="text-xs text-gray-500 mt-1">{disease.description}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Diseases */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  الأمراض المختارة ({visitData.diseases.length}):
                </Label>
                {(() => {
                  console.log('🦠 ===== RENDERING SELECTED DISEASES =====')
                  console.log('🦠 Visit data diseases:', JSON.stringify(visitData.diseases, null, 2))
                  console.log('🦠 Diseases count:', visitData.diseases.length)
                  return null
                })()}
              </div>
              {visitData.diseases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد أمراض مشخصة
                </div>
              ) : (
                <div className="space-y-4">
                  {visitData.diseases.map((disease, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-red-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>اسم المرض</Label>
                          <Input
                            value={disease.name}
                            onChange={(e) => updateDisease(index, 'name', e.target.value)}
                            placeholder="اسم المرض"
                          />
                        </div>
                        <div>
                          <Label>تاريخ التشخيص</Label>
                          <Input
                            type="date"
                            value={disease.diagnosedAt}
                            onChange={(e) => updateDisease(index, 'diagnosedAt', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>الشدة</Label>
                          <Select value={disease.severity} onValueChange={(value) => updateDisease(index, 'severity', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الشدة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mild">خفيف</SelectItem>
                              <SelectItem value="Moderate">متوسط</SelectItem>
                              <SelectItem value="Severe">شديد</SelectItem>
                              <SelectItem value="Critical">حرج</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDisease(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>وصف المرض</Label>
                        <Textarea
                          value={disease.description}
                          onChange={(e) => updateDisease(index, 'description', e.target.value)}
                          placeholder="وصف المرض..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Treatments */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  العلاجات الموصوفة
                </div>
                <Button 
                  onClick={() => addTreatment()} 
                  size="sm"
                  disabled={isLoadingTreatments}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoadingTreatments ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {isLoadingTreatments ? 'جاري التحميل...' : 'إضافة علاج'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Available Treatments Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  اختر من العلاجات المتاحة:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {availableTreatments?.map((treatment: any) => {
                    const isSelected = visitData.treatments.some(selectedTreatment => selectedTreatment.name === treatment.name)
                    console.log('💊 Checking treatment:', treatment.name, 'isSelected:', isSelected)
                    console.log('💊 Current visitData.treatments:', visitData.treatments.map(t => t.name))
                    return (
                      <button
                        key={treatment.id}
                        onClick={() => addTreatment(treatment.name, treatment.description)}
                        disabled={isSelected}
                        className={`text-right p-2 text-sm rounded border transition-colors ${
                          isSelected 
                            ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                            : 'hover:bg-green-50 hover:border-green-300'
                        }`}
                      >
                        <div className="font-medium flex items-center justify-between">
                          {treatment.name}
                          {isSelected && <span className="text-green-600">✓</span>}
                        </div>
                        {treatment.description && (
                          <div className="text-xs text-gray-500 mt-1">{treatment.description}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Treatments */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  العلاجات المختارة ({visitData.treatments.length}):
                </Label>
                {(() => {
                  console.log('💊 ===== RENDERING SELECTED TREATMENTS =====')
                  console.log('💊 Visit data treatments:', JSON.stringify(visitData.treatments, null, 2))
                  console.log('💊 Treatments count:', visitData.treatments.length)
                  return null
                })()}
              </div>
              {visitData.treatments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد علاجات موصوفة
                </div>
              ) : (
                <div className="space-y-4">
                  {visitData.treatments.map((treatment, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-green-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>اسم العلاج</Label>
                          <Input
                            value={treatment.name}
                            onChange={(e) => updateTreatment(index, 'name', e.target.value)}
                            placeholder="اسم العلاج"
                          />
                        </div>
                        <div>
                          <Label>تاريخ العلاج</Label>
                          <Input
                            type="date"
                            value={treatment.scheduledAt}
                            onChange={(e) => updateTreatment(index, 'scheduledAt', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTreatment(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>وصف العلاج</Label>
                        <Textarea
                          value={treatment.description}
                          onChange={(e) => updateTreatment(index, 'description', e.target.value)}
                          placeholder="وصف العلاج..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 5: Operations & Medications */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    العمليات الجراحية
                  </div>
                <Button 
                  onClick={() => addOperation()} 
                  size="sm"
                  disabled={isLoadingOperations}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingOperations ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {isLoadingOperations ? 'جاري التحميل...' : 'إضافة عملية'}
                </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Available Operations Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    اختر من العمليات المتاحة:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {availableOperations?.map((operation: any) => {
                      const isSelected = visitData.operations.some(selectedOperation => selectedOperation.name === operation.name)
                      console.log('🏥 Checking operation:', operation.name, 'isSelected:', isSelected)
                      console.log('🏥 Current visitData.operations:', visitData.operations.map(o => o.name))
                      return (
                        <button
                          key={operation.id}
                          onClick={() => addOperation(operation.name, operation.description)}
                          disabled={isSelected}
                          className={`text-right p-2 text-sm rounded border transition-colors ${
                            isSelected 
                              ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium flex items-center justify-between">
                            {operation.name}
                            {isSelected && <span className="text-green-600">✓</span>}
                          </div>
                          {operation.description && (
                            <div className="text-xs text-gray-500 mt-1">{operation.description}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Current Operations */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    العمليات المختارة ({visitData.operations.length}):
                  </Label>
                  {(() => {
                    console.log('🏥 ===== RENDERING SELECTED OPERATIONS =====')
                    console.log('🏥 Visit data operations:', JSON.stringify(visitData.operations, null, 2))
                    console.log('🏥 Operations count:', visitData.operations.length)
                    return null
                  })()}
                </div>
                {visitData.operations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد عمليات مجدولة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visitData.operations.map((operation, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-orange-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>اسم العملية</Label>
                            <Input
                              value={operation.name}
                              onChange={(e) => updateOperation(index, 'name', e.target.value)}
                              placeholder="اسم العملية"
                            />
                          </div>
                          <div>
                            <Label>تاريخ العملية</Label>
                            <Input
                              type="date"
                              value={operation.scheduledAt}
                              onChange={(e) => updateOperation(index, 'scheduledAt', e.target.value)}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOperation(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label>وصف العملية</Label>
                          <Textarea
                            value={operation.description}
                            onChange={(e) => updateOperation(index, 'description', e.target.value)}
                            placeholder="وصف العملية..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pill className="w-5 h-5 mr-2" />
                    الأدوية الموصوفة
                  </div>
                  <Button 
                    onClick={() => addMedication()} 
                    size="sm"
                    disabled={isLoadingMedications}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoadingMedications ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    {isLoadingMedications ? 'جاري التحميل...' : 'إضافة دواء'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Available Medications Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    اختر من الأدوية المتاحة:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {availableMedications?.map((medication: any) => {
                      const isSelected = visitData.medications.some(selectedMedication => selectedMedication.name === medication.name)
                      console.log('💉 Checking medication:', medication.name, 'isSelected:', isSelected)
                      console.log('💉 Current visitData.medications:', visitData.medications.map(m => m.name))
                      return (
                        <button
                          key={medication.id}
                          onClick={() => addMedication(medication.name, medication.dosage, medication.frequency, medication.duration, medication.instructions)}
                          disabled={isSelected}
                          className={`text-right p-2 text-sm rounded border transition-colors ${
                            isSelected 
                              ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                              : 'hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-medium flex items-center justify-between">
                            {medication.name}
                            {isSelected && <span className="text-green-600">✓</span>}
                          </div>
                          {medication.dosage && (
                            <div className="text-xs text-gray-500 mt-1">الجرعة: {medication.dosage}</div>
                          )}
                          {medication.frequency && (
                            <div className="text-xs text-gray-500">التكرار: {medication.frequency}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Current Medications */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    الأدوية المختارة ({visitData.medications.length}):
                  </Label>
                  {(() => {
                    console.log('💉 ===== RENDERING SELECTED MEDICATIONS =====')
                    console.log('💉 Visit data medications:', JSON.stringify(visitData.medications, null, 2))
                    console.log('💉 Medications count:', visitData.medications.length)
                    return null
                  })()}
                </div>
                {visitData.medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد أدوية موصوفة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visitData.medications.map((medication, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-purple-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>اسم الدواء</Label>
                            <Input
                              value={medication.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              placeholder="اسم الدواء"
                            />
                          </div>
                          <div>
                            <Label>الجرعة</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              placeholder="الجرعة"
                            />
                          </div>
                          <div>
                            <Label>التكرار</Label>
                            <Input
                              value={medication.frequency}
                              onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                              placeholder="التكرار"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMedication(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div>
                            <Label>المدة</Label>
                            <Input
                              value={medication.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                              placeholder="المدة"
                            />
                          </div>
                          <div>
                            <Label>تاريخ البداية</Label>
                            <Input
                              type="date"
                              value={medication.startDate}
                              onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>تاريخ النهاية</Label>
                            <Input
                              type="date"
                              value={medication.endDate || ''}
                              onChange={(e) => updateMedication(index, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label>التعليمات</Label>
                          <Textarea
                            value={medication.instructions}
                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                            placeholder="تعليمات الدواء..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
              <Save className="w-4 h-4 mr-1" />
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
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {isLoading ? 'جاري الحفظ...' : 'حفظ نهائي'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
