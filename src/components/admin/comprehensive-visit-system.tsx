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
  treatmentCourses: TreatmentCourseData[]
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

interface TreatmentCourseData {
  id?: string
  courseName: string
  description: string
  hospitalTreatmentId: string
  // إدارة المخزون والكميات
  totalQuantity: number          // الكمية الإجمالية المطلوبة
  reservedQuantity: number       // الكمية المحجوزة للمريض
  deliveredQuantity: number      // الكمية المسلمة للمريض
  remainingQuantity: number      // الكمية المتبقية
  availableInStock: number       // الكمية المتاحة في المخزون
  // التواريخ
  startDate: string             // تاريخ بداية الكورس
  endDate?: string              // تاريخ نهاية الكورس
  // الحالة والمتابعة
  status: string                // حالة الكورس (تم إنشاؤه، محجوز، مسلم، جاري، مكتمل، ملغي)
  isReserved: boolean           // هل تم حجز الدواء؟
  isDelivered: boolean          // هل تم تسليم الدواء؟
  // التفاصيل الإضافية
  instructions?: string         // تعليمات خاصة
  notes?: string               // ملاحظات
  // الجرعات
  doses: TreatmentDoseData[]
}

interface TreatmentDoseData {
  id?: string
  doseNumber: number
  // جدولة الجرعة
  scheduledDate: string         // تاريخ الجرعة المحدد
  scheduledTime: string         // وقت الجرعة المحدد
  quantity: number             // كمية الجرعة
  // تتبع الالتزام
  status: string               // حالة الجرعة (مجدول، تم أخذه، فات الموعد، تم تخطيه)
  takenAt?: string             // وقت أخذ الجرعة الفعلي
  takenDate?: string           // تاريخ أخذ الجرعة الفعلي
  isTaken: boolean             // هل تم أخذ الجرعة؟
  isOnTime: boolean            // هل تم أخذها في الموعد؟
  // التفاصيل الإضافية
  notes?: string               // ملاحظات خاصة بالجرعة
  sideEffects?: string         // آثار جانبية (إن وجدت)
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
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set())
  const [isAddingItem, setIsAddingItem] = useState(false)
  
  // Treatment course management
  const [availableTreatments, setAvailableTreatments] = useState<any[]>([])
  const [loadingTreatments, setLoadingTreatments] = useState(false)
  const [treatmentAlerts, setTreatmentAlerts] = useState<{[key: string]: string}>({})
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
    treatmentCourses: [],
    operations: [],
    medications: []
  })

  // Auto-fill patient data function
  const [isApplyingPatientData, setIsApplyingPatientData] = useState(false)

  const applyPatientData = async () => {
    if (!patientData) return
    if (isApplyingPatientData) return
    setIsApplyingPatientData(true)
    try {
    console.log('🔄 Applying patient data:', patientData)
    
    // Find the first available doctor for the hospital
    let selectedDoctorId = ''
    if (patientData.hospitalId && doctors) {
      const hospitalDoctors = doctors.filter((doctor: any) => doctor.hospitalId === patientData.hospitalId)
      if (hospitalDoctors.length > 0) {
        selectedDoctorId = hospitalDoctors[0].id
        console.log('👨‍⚕️ Auto-selected doctor:', hospitalDoctors[0].firstName, hospitalDoctors[0].lastName)
      }
    }
    
    setVisitData(prev => ({
      ...prev,
      cityId: patientData.hospital?.city?.id || '',
      hospitalId: patientData.hospitalId || '',
      doctorId: selectedDoctorId,
      scheduledAt: new Date().toISOString().slice(0, 16) // Current date/time
    }))

    // Mark step 1 as saved since we have basic info
    setSavedSteps(prev => new Set(Array.from(prev).concat([1])))
    
    // If patient has selected tests, add them to the visit
    if (patientData.tests && patientData.tests.length > 0) {
      const patientTests = patientData.tests.map((test: any) => ({
        name: test.name,
        description: test.description || '',
        status: 'SCHEDULED'
      }))
      
      setVisitData(prev => ({
        ...prev,
        tests: patientTests
      }))
      
      // Mark step 2 as saved if we have tests
      setSavedSteps(prev => new Set(Array.from(prev).concat([2])))
      
      console.log('✅ Patient selected tests applied:', patientTests.length)
    }
    
    console.log('✅ Patient data applied successfully')
    } finally {
      setIsApplyingPatientData(false)
    }
  }

  // Fetch available treatments from hospital
  const fetchAvailableTreatments = async (hospitalId: string) => {
    if (!hospitalId) return
    
    setLoadingTreatments(true)
    try {
      const response = await fetch(`/api/hospital-treatments?hospitalId=${hospitalId}`)
      const result = await response.json()
      
      if (result.success) {
        setAvailableTreatments(result.data || [])
        console.log('💊 Available treatments loaded:', result.data?.length || 0)
      } else {
        console.error('❌ Failed to load treatments:', result.error)
        setAvailableTreatments([])
      }
    } catch (error) {
      console.error('❌ Error fetching treatments:', error)
      setAvailableTreatments([])
    } finally {
      setLoadingTreatments(false)
    }
  }

  // Check treatment availability and generate alerts
  const checkTreatmentAvailability = (treatmentId: string, requestedQuantity: number) => {
    const treatment = hospitalTreatments?.find((t: any) => t.id === treatmentId)
    if (!treatment) return 'العلاج غير متوفر'
    
    const availableQuantity = (treatment.quantity || 0) - (treatment.reservedQuantity || 0)
    
    if (availableQuantity < requestedQuantity) {
      return `الكمية المتاحة: ${availableQuantity}، المطلوبة: ${requestedQuantity}`
    }
    
    // Check expiry date
    if (treatment.expiredate) {
      const expiryDate = new Date(treatment.expiredate)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        return 'العلاج منتهي الصلاحية'
      } else if (daysUntilExpiry < 30) {
        return `صلاحية العلاج تنتهي خلال ${daysUntilExpiry} يوم`
      }
    }
    
    return null
  }

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

  // Fetch treatment courses for the visit
  const { data: treatmentCourses, isLoading: isLoadingTreatmentCourses } = useQuery({
    queryKey: ['treatment-courses', existingVisit?.patientId, existingVisit?.doctorId, existingVisit?.hospitalId],
    queryFn: async () => {
      if (!existingVisit?.patientId || !existingVisit?.doctorId || !existingVisit?.hospitalId) return []
      const response = await fetch(`/api/treatment-courses?patientId=${existingVisit.patientId}&doctorId=${existingVisit.doctorId}&hospitalId=${existingVisit.hospitalId}`)
      const result = await response.json()
      return result.success ? result.data : []
    },
    enabled: !!existingVisit?.patientId && !!existingVisit?.doctorId && !!existingVisit?.hospitalId
  })

  // Fetch diseases for the visit
  const { data: diseases, isLoading: isLoadingVisitDiseases } = useQuery({
    queryKey: ['diseases', existingVisit?.patientId, existingVisit?.scheduledAt],
    queryFn: async () => {
      if (!existingVisit?.patientId || !existingVisit?.scheduledAt) return []
      
      // Calculate date range around the visit (24 hours before and after)
      const visitDate = new Date(existingVisit.scheduledAt)
      const startDate = new Date(visitDate.getTime() - 24 * 60 * 60 * 1000)
      const endDate = new Date(visitDate.getTime() + 24 * 60 * 60 * 1000)
      
      const response = await fetch(`/api/diseases?patientId=${existingVisit.patientId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      const result = await response.json()
      return result.success ? result.data : []
    },
    enabled: !!existingVisit?.patientId && !!existingVisit?.scheduledAt
  })

  // Fetch patient data for auto-fill
  const { data: patientData, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}`)
      const result = await response.json()
      return result.success ? result.data : null
    },
    enabled: !!patientId && isOpen
  })

  // Load existing visit data
  useEffect(() => {
    if (existingVisit) {
      console.log('🏥 Hospital ID:', existingVisit.hospitalId)
      console.log('👨‍⚕️ Doctor ID:', existingVisit.doctorId)
      console.log('🏙️ City ID:', existingVisit.cityId)
      console.log('📅 Scheduled At:', existingVisit.scheduledAt)
      console.log('📝 Current Step:', existingVisit.currentStep)
      console.log('🧪 Tests Count:', existingVisit.tests?.length || 0)
      console.log('🧪 Tests Data:', existingVisit.tests)
      console.log('🦠 Diseases Count:', existingVisit.diseases?.length || 0)
      console.log('🦠 Diseases Data:', existingVisit.diseases)
      console.log('💊 Treatment Courses Count:', existingVisit.treatmentCourses?.length || 0)
      console.log('💊 Treatment Courses Data:', existingVisit.treatmentCourses)
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
             diseases: (existingVisit.diseases || diseases || [])?.map((disease: any) => ({
               id: disease.id,
               name: disease.name,
               description: disease.description || '',
               diagnosedAt: disease.diagnosedAt ? new Date(disease.diagnosedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               severity: disease.severity || '',
               status: disease.status || 'Active'
             })) || [],
             treatmentCourses: (existingVisit.treatmentCourses || treatmentCourses || [])?.map((course: any) => ({
               id: course.id,
               hospitalTreatmentId: course.hospitalTreatmentId,
               courseName: course.courseName || '',
               description: course.description || '',
               totalQuantity: course.totalQuantity || 0,
               deliveredQuantity: course.deliveredQuantity || 0,
               remainingQuantity: course.remainingQuantity || 0,
               reservedQuantity: course.reservedQuantity || 0,
               isReserved: course.isReserved || false,
               isDelivered: course.isDelivered || false,
               status: course.status || 'PENDING',
               availableInStock: course.availableInStock || 0,
               doses: course.doses?.map((dose: any) => ({
                 id: dose.id,
                 doseNumber: dose.doseNumber || 1,
                 quantity: dose.quantity || 0,
                 scheduledAt: dose.scheduledDate ? new Date(dose.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                 scheduledTime: dose.scheduledTime || '',
                 takenAt: dose.takenAt || '',
                 takenDate: dose.takenDate || '',
                 status: dose.status || 'PENDING',
                 isTaken: dose.isTaken || false,
                 isOnTime: dose.isOnTime || false,
                 notes: dose.notes || '',
                 sideEffects: dose.sideEffects || ''
               })) || []
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
      
      // Determine saved steps based on loaded data
      const loadedSavedSteps = new Set<number>()
      
      // Step 1: Basic info (always saved if visit exists)
      if (formattedVisitData.scheduledAt || formattedVisitData.doctorId || formattedVisitData.hospitalId) {
        loadedSavedSteps.add(1)
      }
      
      // Step 2: Tests - only if there are actual tests with data
      if (formattedVisitData.tests && formattedVisitData.tests.length > 0) {
        const hasValidTests = formattedVisitData.tests.some((test: any) => 
          test.name && test.name.trim() !== ''
        )
        if (hasValidTests) {
          loadedSavedSteps.add(2)
        }
      }
      
      // Step 3: Diseases - only if there are actual diseases with data
      if (formattedVisitData.diseases && formattedVisitData.diseases.length > 0) {
        const hasValidDiseases = formattedVisitData.diseases.some((disease: any) => 
          disease.name && disease.name.trim() !== ''
        )
        if (hasValidDiseases) {
          loadedSavedSteps.add(3)
        }
      }
      
      // Step 4: Treatment Courses - only if there are actual treatment courses with data
      if (formattedVisitData.treatmentCourses && formattedVisitData.treatmentCourses.length > 0) {
        const hasValidTreatmentCourses = formattedVisitData.treatmentCourses.some((course: any) => 
          course.courseName && course.courseName.trim() !== ''
        )
        if (hasValidTreatmentCourses) {
          loadedSavedSteps.add(4)
        }
      }
      
      // Step 5: Operations and Medications - only if there are actual data
      const hasValidOperations = formattedVisitData.operations && formattedVisitData.operations.length > 0 && 
        formattedVisitData.operations.some((operation: any) => operation.name && operation.name.trim() !== '')
      
      const hasValidMedications = formattedVisitData.medications && formattedVisitData.medications.length > 0 && 
        formattedVisitData.medications.some((medication: any) => medication.name && medication.name.trim() !== '')
      
      if (hasValidOperations || hasValidMedications) {
        loadedSavedSteps.add(5)
      }
      
      console.log('🔍 Detected saved steps from loaded data:', Array.from(loadedSavedSteps))
      setSavedSteps(loadedSavedSteps)
      
           console.log('✅ ===== VISIT DATA LOADED SUCCESSFULLY =====')
           console.log('📊 Final visit data state:', formattedVisitData)
           console.log('📝 Current step set to:', existingVisit.currentStep || 1)
           console.log('🧪 Tests loaded:', formattedVisitData.tests.length, 'items')
           console.log('🧪 Tests details:', JSON.stringify(formattedVisitData.tests, null, 2))
           console.log('🦠 Diseases loaded:', formattedVisitData.diseases.length, 'items')
           console.log('🦠 Diseases details:', JSON.stringify(formattedVisitData.diseases, null, 2))
           console.log('💊 Treatment Courses loaded:', formattedVisitData.treatmentCourses?.length || 0, 'items')
           console.log('💊 Treatment Courses details:', JSON.stringify(formattedVisitData.treatmentCourses, null, 2))
           console.log('🏥 Operations loaded:', formattedVisitData.operations.length, 'items')
           console.log('💉 Medications loaded:', formattedVisitData.medications.length, 'items')
           
           // Show success toast
           toast.success('تم تحميل بيانات الزيارة بنجاح')
    }
  }, [existingVisit])

  // Fetch treatments when hospital changes
  useEffect(() => {
    if (visitData.hospitalId) {
      fetchAvailableTreatments(visitData.hospitalId)
    }
  }, [visitData.hospitalId])

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
      console.log('👨‍⚕️ ===== FETCHING DOCTORS =====')
      const response = await fetch('/api/doctors')
      console.log('👨‍⚕️ Doctors response status:', response.status)
      const result = await response.json()
      console.log('👨‍⚕️ Doctors query result:', result)
      const doctorsData = Array.isArray(result) ? result : (result.data || [])
      console.log('👨‍⚕️ Doctors data after processing:', doctorsData)
      return doctorsData
    }
  })

  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      console.log('🏥 ===== FETCHING HOSPITALS =====')
      const response = await fetch('/api/hospitals')
      console.log('🏥 Hospitals response status:', response.status)
      const result = await response.json()
      console.log('🏥 Hospitals query result:', result)
      const hospitalsData = Array.isArray(result) ? result : (result.data || [])
      console.log('🏥 Hospitals data after processing:', hospitalsData)
      return hospitalsData
    }
  })

  const { data: availableTests, isLoading: isLoadingTests } = useQuery({
    queryKey: ['hospital-tests'],
    queryFn: async () => {
      console.log('🧪 ===== FETCHING AVAILABLE TESTS =====')
      console.log('🌐 API endpoint: /api/hospital-tests')
      
      const response = await fetch('/api/hospital-tests')
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tests')
      }
      
      const result = await response.json()
      console.log('📥 Raw API response:', JSON.stringify(result, null, 2))
      
      const allTests = result.data || []
      console.log('🧪 All tests count:', allTests.length)
      
      return allTests
    }
  })

  // Filter tests by selected hospital
  const filteredTests = availableTests?.filter((test: any) => 
    !visitData.hospitalId || test.hospitalId === visitData.hospitalId
  ) || []
  
  console.log('🧪 Debug - availableTests count:', availableTests?.length || 0)
  console.log('🧪 Debug - visitData.hospitalId:', visitData.hospitalId)
  console.log('🧪 Debug - filteredTests count:', filteredTests.length)
  console.log('🧪 Debug - filteredTests sample:', filteredTests.slice(0, 3))

  const { data: availableDiseases, isLoading: isLoadingDiseases } = useQuery({
    queryKey: ['hospital-diseases'],
    queryFn: async () => {
      console.log('🦠 ===== FETCHING AVAILABLE DISEASES =====')
      
      const response = await fetch('/api/hospital-diseases')
      
      if (!response.ok) {
        throw new Error('Failed to fetch diseases')
      }
      
      const result = await response.json()
      const allDiseases = result.data || []
      console.log('🦠 All diseases count:', allDiseases.length)
      
      return allDiseases
    }
  })

  // Filter diseases by selected hospital
  const filteredDiseases = availableDiseases?.filter((disease: any) => 
    !visitData.hospitalId || disease.hospitalId === visitData.hospitalId
  ) || []
  
  console.log('🦠 Debug - availableDiseases count:', availableDiseases?.length || 0)
  console.log('🦠 Debug - filteredDiseases count:', filteredDiseases.length)
  console.log('🦠 Debug - filteredDiseases sample:', filteredDiseases.slice(0, 3))

  const { data: hospitalTreatments, isLoading: isLoadingTreatments } = useQuery({
    queryKey: ['hospital-treatments'],
    queryFn: async () => {
      console.log('💊 ===== FETCHING AVAILABLE TREATMENTS =====')
      
      const response = await fetch('/api/hospital-treatments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch treatments')
      }
      
      const result = await response.json()
      const allTreatments = result.data || []
      console.log('💊 All hospital treatments count:', allTreatments.length)
      
      return allTreatments
    }
  })

  // Filter treatment courses by selected hospital
  const filteredTreatments = hospitalTreatments?.filter((treatment: any) => 
    !visitData.hospitalId || treatment.hospitalId === visitData.hospitalId
  ) || []
  
  console.log('💊 Debug - hospitalTreatments count:', hospitalTreatments?.length || 0)
  console.log('💊 Debug - filteredTreatments count:', filteredTreatments.length)
  console.log('💊 Debug - filteredTreatments sample:', filteredTreatments.slice(0, 3))

  const { data: availableOperations, isLoading: isLoadingOperations } = useQuery({
    queryKey: ['hospital-operations'],
    queryFn: async () => {
      console.log('🏥 ===== FETCHING AVAILABLE OPERATIONS =====')
      
      const response = await fetch('/api/hospital-operations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch operations')
      }
      
      const result = await response.json()
      const allOperations = result.data || []
      console.log('🏥 All operations count:', allOperations.length)
      
      return allOperations
    }
  })

  // Filter operations by selected hospital
  const filteredOperations = availableOperations?.filter((operation: any) => 
    !visitData.hospitalId || operation.hospitalId === visitData.hospitalId
  ) || []
  
  console.log('🏥 Debug - availableOperations count:', availableOperations?.length || 0)
  console.log('🏥 Debug - filteredOperations count:', filteredOperations.length)
  console.log('🏥 Debug - filteredOperations sample:', filteredOperations.slice(0, 3))

  const { data: availableMedications, isLoading: isLoadingMedications } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      console.log('💉 ===== FETCHING AVAILABLE MEDICATIONS =====')
      
      const response = await fetch('/api/medications')
      const result = await response.json()
      const allMedications = result.data || []
      console.log('💉 All medications count:', allMedications.length)
      
      return allMedications
    }
  })

  // Filter medications by selected hospital (if medications have hospitalId)
  const filteredMedications = availableMedications?.filter((medication: any) => 
    !medication.hospitalId || !visitData.hospitalId || medication.hospitalId === visitData.hospitalId
  ) || []
  
  console.log('💉 Debug - availableMedications count:', availableMedications?.length || 0)
  console.log('💉 Debug - filteredMedications count:', filteredMedications.length)
  console.log('💉 Debug - filteredMedications sample:', filteredMedications.slice(0, 3))

  // Filter hospitals based on selected city
  const filteredHospitals = hospitals?.filter((hospital: any) => 
    !visitData.cityId || hospital.cityId === visitData.cityId
  ) || []

  // Filter doctors based on selected hospital
  const filteredDoctors = doctors?.filter((doctor: any) => 
    !visitData.hospitalId || doctor.hospitalId === visitData.hospitalId
  ) || []

  // Debug logs
  console.log('🔍 Debug - hospitals:', hospitals)
  console.log('🔍 Debug - doctors:', doctors)
  console.log('🔍 Debug - filteredHospitals:', filteredHospitals)
  console.log('🔍 Debug - filteredDoctors:', filteredDoctors)
  console.log('🔍 Debug - visitData.cityId:', visitData.cityId)
  console.log('🔍 Debug - visitData.hospitalId:', visitData.hospitalId)

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
      console.log('💊 Treatment Courses Count:', visitData.treatmentCourses?.length || 0)
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
              treatmentCourses: visitData.treatmentCourses,
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
              treatmentCourses: visitData.treatmentCourses,
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
    // Basic validation
    if (!visitData.scheduledAt || visitData.scheduledAt === '') {
      toast.error('يرجى تحديد تاريخ ووقت الزيارة')
      return
    }
    if (isComplete) {
      if (!visitData.hospitalId) {
        toast.error('يرجى اختيار المستشفى')
        return
      }
      if (!visitData.doctorId) {
        toast.error('يرجى اختيار الطبيب')
        return
      }
    }
    // Check if current step is already saved
    if (savedSteps.has(currentStep)) {
      toast.error('⚠️ هذه الخطوة محفوظة مسبقاً!', {
        duration: 3000,
        style: {
          background: '#F59E0B',
          color: '#fff',
          fontSize: '16px',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }
      })
      return
    }

    setIsLoading(true)
    
    // Add current step to saved steps
    setSavedSteps(prev => new Set(Array.from(prev).concat(currentStep)))
    
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
    if (isAddingItem) {
      console.log('⚠️ Already adding item, skipping')
      return
    }
    
    console.log('🧪 ===== ADDING TEST =====')
    console.log('📝 Test name:', testName)
    console.log('📄 Test description:', testDescription)
    console.log('📊 Current tests count:', visitData.tests.length)
    console.log('📊 Current tests:', JSON.stringify(visitData.tests, null, 2))
    
    // Check if test already exists to prevent duplicates
    const testExists = visitData.tests.some((test: any) => test.name === testName)
    if (testExists) {
      console.log('⚠️ Test already exists, skipping addition')
      return
    }
    
    setIsAddingItem(true)
    
    const newTest = {
      name: testName || '',
      description: testDescription || '',
      scheduledAt: new Date().toISOString().split('T')[0],
      hospitalId: visitData.hospitalId
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
    
    // Reset the adding state after a short delay
    setTimeout(() => {
      setIsAddingItem(false)
    }, 500)
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
    
    // Check if disease already exists to prevent duplicates
    const diseaseExists = visitData.diseases.some(disease => disease.name === diseaseName)
    if (diseaseExists) {
      console.log('⚠️ Disease already exists, skipping addition')
      return
    }
    
    const newDisease = {
      name: diseaseName || '',
      description: diseaseDescription || '',
      diagnosedAt: new Date().toISOString().split('T')[0],
      severity: '',
      status: 'Active',
      hospitalId: visitData.hospitalId
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

  // Treatment Course management
  const addTreatmentCourse = (treatmentId?: string, treatmentName?: string) => {
    console.log('💊 ===== ADDING TREATMENT COURSE =====')
    console.log('📝 Treatment ID:', treatmentId)
    console.log('📝 Treatment name:', treatmentName)
    console.log('📊 Current treatment courses count:', visitData.treatmentCourses.length)
    
    // Check if treatment course already exists to prevent duplicates
    const courseExists = visitData.treatmentCourses.some(course => course.hospitalTreatmentId === treatmentId)
    if (courseExists) {
      console.log('⚠️ Treatment course already exists, skipping addition')
      return
    }
    
    const treatment = hospitalTreatments?.find((t: any) => t.id === treatmentId)
    const availableInStock = treatment ? (treatment.quantity || 0) - (treatment.reservedQuantity || 0) : 0
    
    const newTreatmentCourse: TreatmentCourseData = {
      courseName: treatmentName || '',
      description: '',
      hospitalTreatmentId: treatmentId || '',
      // إدارة المخزون والكميات
      totalQuantity: 1,
      reservedQuantity: 0,
      deliveredQuantity: 0,
      remainingQuantity: 1,
      availableInStock: availableInStock,
      // التواريخ
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      // الحالة والمتابعة
      status: 'CREATED',
      isReserved: false,
      isDelivered: false,
      // التفاصيل الإضافية
      instructions: '',
      notes: '',
      // الجرعات
      doses: []
    }
    
    console.log('🆕 New treatment course to add:', JSON.stringify(newTreatmentCourse, null, 2))
    
    const updatedTreatmentCourses = [...visitData.treatmentCourses, newTreatmentCourse]
    
    console.log('📊 Updated treatment courses array:', JSON.stringify(updatedTreatmentCourses, null, 2))
    
    setVisitData({
      ...visitData,
      treatmentCourses: updatedTreatmentCourses
    })
    
    console.log('✅ Treatment course added successfully!')
    console.log('📊 New treatment courses count:', updatedTreatmentCourses.length)
  }

  const updateTreatmentCourse = (index: number, field: keyof TreatmentCourseData, value: string | number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    newTreatmentCourses[index] = { ...newTreatmentCourses[index], [field]: value }
    
    // Recalculate remaining quantity when total quantity changes
    if (field === 'totalQuantity') {
      const totalQty = typeof value === 'number' ? value : parseInt(value.toString()) || 0
      const deliveredQty = newTreatmentCourses[index].deliveredQuantity || 0
      newTreatmentCourses[index].remainingQuantity = totalQty - deliveredQty
    }
    
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
  }

  const removeTreatmentCourse = (index: number) => {
    const newTreatmentCourses = visitData.treatmentCourses.filter((_, i) => i !== index)
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
  }

  const addDoseToCourse = (courseIndex: number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    const course = newTreatmentCourses[courseIndex]
    
    const newDose: TreatmentDoseData = {
      doseNumber: course.doses.length + 1,
      // جدولة الجرعة
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:00',
      quantity: 1,
      // تتبع الالتزام
      status: 'SCHEDULED',
      takenAt: '',
      takenDate: '',
      isTaken: false,
      isOnTime: false,
      // التفاصيل الإضافية
      notes: '',
      sideEffects: ''
    }
    
    course.doses = [...course.doses, newDose]
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
  }

  const updateDose = (courseIndex: number, doseIndex: number, field: keyof TreatmentDoseData, value: string | number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    newTreatmentCourses[courseIndex].doses[doseIndex] = {
      ...newTreatmentCourses[courseIndex].doses[doseIndex],
      [field]: value
    }
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
  }

  const removeDose = (courseIndex: number, doseIndex: number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    newTreatmentCourses[courseIndex].doses = newTreatmentCourses[courseIndex].doses.filter((_, i) => i !== doseIndex)
    
    // Renumber doses
    newTreatmentCourses[courseIndex].doses.forEach((dose, index) => {
      dose.doseNumber = index + 1
    })
    
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
  }

  // دوال إدارة الحجز والتسليم
  const reserveTreatment = (courseIndex: number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    const course = newTreatmentCourses[courseIndex]
    
    if (course.availableInStock >= course.totalQuantity) {
      course.isReserved = true
      course.reservedQuantity = course.totalQuantity
      course.status = 'RESERVED'
      course.availableInStock -= course.totalQuantity
      
      setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
      console.log('✅ Treatment reserved successfully')
    } else {
      console.error('❌ Not enough stock available')
    }
  }

  const deliverTreatment = (courseIndex: number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    const course = newTreatmentCourses[courseIndex]
    
    if (course.isReserved && course.reservedQuantity > 0) {
      course.isDelivered = true
      course.deliveredQuantity = course.reservedQuantity
      course.remainingQuantity = course.totalQuantity - course.deliveredQuantity
      course.status = 'DELIVERED'
      
      setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
      console.log('✅ Treatment delivered successfully')
    } else {
      console.error('❌ Treatment must be reserved first')
    }
  }

  const markDoseAsTaken = (courseIndex: number, doseIndex: number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    const dose = newTreatmentCourses[courseIndex].doses[doseIndex]
    
    const now = new Date()
    const scheduledDateTime = new Date(`${dose.scheduledDate}T${dose.scheduledTime}`)
    const timeDiff = now.getTime() - scheduledDateTime.getTime()
    const isOnTime = Math.abs(timeDiff) <= 30 * 60 * 1000 // 30 minutes tolerance
    
    dose.isTaken = true
    dose.status = 'TAKEN'
    dose.takenAt = now.toTimeString().slice(0, 5)
    dose.takenDate = now.toISOString().split('T')[0]
    dose.isOnTime = isOnTime
    
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
    console.log('✅ Dose marked as taken')
  }

  const markDoseAsMissed = (courseIndex: number, doseIndex: number) => {
    const newTreatmentCourses = [...visitData.treatmentCourses]
    const dose = newTreatmentCourses[courseIndex].doses[doseIndex]
    
    dose.status = 'MISSED'
    dose.isTaken = false
    dose.isOnTime = false
    
    setVisitData({ ...visitData, treatmentCourses: newTreatmentCourses })
    console.log('⚠️ Dose marked as missed')
  }

  // Operation management
  const addOperation = (operationName?: string, operationDescription?: string) => {
    console.log('🏥 ===== ADDING OPERATION =====')
    console.log('📝 Operation name:', operationName)
    console.log('📄 Operation description:', operationDescription)
    console.log('📊 Current operations count:', visitData.operations.length)
    
    // Check if operation already exists to prevent duplicates
    const operationExists = visitData.operations.some(operation => operation.name === operationName)
    if (operationExists) {
      console.log('⚠️ Operation already exists, skipping addition')
      return
    }
    
    const newOperation = {
      name: operationName || '',
      description: operationDescription || '',
      scheduledAt: new Date().toISOString().split('T')[0],
      notes: '',
      hospitalId: visitData.hospitalId
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
    
    // Check if medication already exists to prevent duplicates
    const medicationExists = visitData.medications.some(medication => medication.name === medicationName)
    if (medicationExists) {
      console.log('⚠️ Medication already exists, skipping addition')
      return
    }
    
    const newMedication = {
      name: medicationName || '',
      dosage: dosage || '',
      frequency: frequency || '',
      duration: duration || '',
      instructions: instructions || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      hospitalId: visitData.hospitalId
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
  if (visitId && (isLoadingVisit || isLoadingTreatmentCourses || isLoadingVisitDiseases)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">جاري تحميل بيانات الزيارة...</p>
            <p className="text-sm text-gray-500 mt-2">يرجى الانتظار بينما نقوم بجلب جميع البيانات المحفوظة</p>
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

        {/* Steps Indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : savedSteps.has(step) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }
              `}>
                {savedSteps.has(step) ? '✓' : step}
              </div>
              <span className="text-xs mt-1 text-gray-600">
                {step === 1 ? 'معلومات أساسية' :
                 step === 2 ? 'فحوصات' :
                 step === 3 ? 'أمراض' :
                 step === 4 ? 'علاجات' :
                 'أدوية'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Basic Visit Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  معلومات الزيارة الأساسية
                </div>
                {patientData && !visitId && (
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyPatientData}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      {isApplyingPatientData ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          جاري التطبيق...
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          تطبيق بيانات المريض
                        </>
                      )}
                    </Button>
                    {patientData.tests && patientData.tests.length > 0 && (
                      <p className="text-xs text-gray-500 text-right">
                        سيتم تطبيق {patientData.tests.length} فحص مختار للمريض
                      </p>
                    )}
                  </div>
                )}
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
                        <SelectItem value="loading" disabled>
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
                        <SelectItem value="loading" disabled>
                          جاري التحميل...
                        </SelectItem>
                      ) : filteredHospitals?.length > 0 ? (
                        filteredHospitals.map((hospital: any) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-hospitals" disabled>
                          لا توجد مستشفيات متاحة
                        </SelectItem>
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
                        <SelectItem value="loading" disabled>
                          جاري التحميل...
                        </SelectItem>
                      ) : filteredDoctors?.length > 0 ? (
                        filteredDoctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            د. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-doctors" disabled>
                          لا توجد أطباء متاحين
                        </SelectItem>
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
                {!visitData.hospitalId ? (
                  <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    <p>يرجى اختيار المستشفى أولاً لعرض الفحوصات المتاحة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {filteredTests?.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        {visitData.hospitalId ? 'لا توجد فحوصات متاحة في هذا المستشفى' : 'يرجى اختيار المستشفى أولاً'}
                      </div>
                    ) : (
                      filteredTests?.map((test: any) => {
                    const isSelected = visitData.tests.some((selectedTest: any) => selectedTest.name === test.name)
                    console.log('🧪 Checking test:', test.name, 'isSelected:', isSelected)
                    console.log('🧪 Current visitData.tests:', visitData.tests.map((t: any) => t.name))
                    return (
                      <button
                        key={test.id}
                        onClick={() => addTest(test.name, test.description)}
                        disabled={isSelected || isAddingItem}
                        className={`text-right p-2 text-sm rounded border transition-colors ${
                          isSelected 
                            ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                            : isAddingItem
                            ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed'
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium flex items-center justify-between">
                          {test.name}
                          {isSelected && <span className="text-green-600">✓</span>}
                          {isAddingItem && !isSelected && <span className="text-blue-600">...</span>}
                        </div>
                        {test.description && (
                          <div className="text-xs text-gray-500 mt-1">{test.description}</div>
                        )}
                      </button>
                    )
                  })
                    )}
                  </div>
                )}
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
                {!visitData.hospitalId ? (
                  <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    <p>يرجى اختيار المستشفى أولاً لعرض الأمراض المتاحة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {filteredDiseases?.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        {visitData.hospitalId ? 'لا توجد أمراض متاحة في هذا المستشفى' : 'يرجى اختيار المستشفى أولاً'}
                      </div>
                    ) : (
                      filteredDiseases?.map((disease: any) => {
                    const isSelected = visitData.diseases.some(selectedDisease => selectedDisease.name === disease.name)
                    console.log('🦠 Checking disease:', disease.name, 'isSelected:', isSelected)
                    console.log('🦠 Current visitData.diseases:', visitData.diseases.map(d => d.name))
                    return (
                      <button
                        type="button"
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
                  })
                    )}
                  </div>
                )}
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
                  console.log('🦠 Diseases from existingVisit:', existingVisit?.diseases)
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

        {/* Step 4: Treatment Courses */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  الكورس العلاجي
                </div>
                <Button 
                  onClick={() => addTreatmentCourse()} 
                  size="sm"
                  disabled={loadingTreatments}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loadingTreatments ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {loadingTreatments ? 'جاري التحميل...' : 'إضافة كورس علاجي'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Available Treatments Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  اختر من العلاجات المتاحة:
                </Label>
                {!visitData.hospitalId ? (
                  <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    <p>يرجى اختيار المستشفى أولاً لعرض العلاجات المتاحة</p>
                  </div>
                ) : loadingTreatments ? (
                  <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
                    <p>جاري تحميل العلاجات المتاحة...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {hospitalTreatments?.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        {visitData.hospitalId ? 'لا توجد علاجات متاحة في هذا المستشفى' : 'يرجى اختيار المستشفى أولاً'}
                      </div>
                    ) : (
                      hospitalTreatments?.map((treatment: any) => {
                        const isSelected = visitData.treatmentCourses.some(course => course.hospitalTreatmentId === treatment.id)
                        const alert = checkTreatmentAvailability(treatment.id, 1)
                        
                        return (
                          <button
                            key={treatment.id}
                            onClick={() => addTreatmentCourse(treatment.id, treatment.name)}
                            disabled={isSelected}
                            className={`text-right p-3 text-sm rounded border transition-colors ${
                              isSelected 
                                ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed' 
                                : 'hover:bg-green-50 hover:border-green-300'
                            }`}
                          >
                            <div className="font-medium flex items-center justify-between">
                              {treatment.name}
                              {isSelected && <span className="text-green-600">✓</span>}
                              {alert !== null && <span className="text-red-600">⚠️</span>}
                            </div>
                            {treatment.description && (
                              <div className="text-xs text-gray-500 mt-1">{treatment.description}</div>
                            )}
                            <div className="text-xs mt-1">
                              <div>الكمية: {treatment.quantity || 0}</div>
                              <div>المحجوز: {treatment.reservedQuantity || 0}</div>
                              {treatment.expiredate && (
                                <div>
                                  الانتهاء: {new Date(treatment.expiredate).toLocaleDateString('ar-EG-u-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                              )}
                            </div>
                            {alert && (
                              <div className="text-xs text-red-600 mt-1 font-medium">{alert}</div>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Current Treatment Courses */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  الكورسات العلاجية المختارة ({visitData.treatmentCourses.length}):
                </Label>
                {(() => {
                  console.log('💊 ===== RENDERING SELECTED TREATMENT COURSES =====')
                  console.log('💊 Visit data treatment courses:', JSON.stringify(visitData.treatmentCourses, null, 2))
                  console.log('💊 Treatment courses count:', visitData.treatmentCourses.length)
                  console.log('💊 Treatment courses from existingVisit:', existingVisit?.treatmentCourses)
                  return null
                })()}
              </div>
              {visitData.treatmentCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد كورسات علاجية موصوفة
                </div>
              ) : (
                <div className="space-y-6">
                  {visitData.treatmentCourses.map((course, courseIndex) => {
                    const treatment = hospitalTreatments?.find((t: any) => t.id === course.hospitalTreatmentId)
                    const alert = treatment ? checkTreatmentAvailability(course.hospitalTreatmentId, course.totalQuantity) : null
                    
                    return (
                      <div key={courseIndex} className="p-6 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                        {/* Course Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {course.courseName || treatment?.name || 'كورس علاجي جديد'}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTreatmentCourse(courseIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Alert */}
                        {alert && (
                          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-red-600 mr-2">⚠️</span>
                              <span className="text-red-800 font-medium">{alert}</span>
                            </div>
                          </div>
                        )}

                        {/* Course Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>اسم الكورس *</Label>
                            <Input
                              value={course.courseName}
                              onChange={(e) => updateTreatmentCourse(courseIndex, 'courseName', e.target.value)}
                              placeholder="اسم الكورس العلاجي"
                            />
                          </div>
                          <div>
                            <Label>الكمية الإجمالية *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={course.totalQuantity}
                              onChange={(e) => updateTreatmentCourse(courseIndex, 'totalQuantity', parseInt(e.target.value) || 1)}
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label>المتاح في المخزون</Label>
                            <Input
                              type="number"
                              value={course.availableInStock}
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                          <div>
                            <Label>الكمية المحجوزة</Label>
                            <Input
                              type="number"
                              min="0"
                              value={course.reservedQuantity}
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                          <div>
                            <Label>الكمية المسلمة</Label>
                            <Input
                              type="number"
                              min="0"
                              value={course.deliveredQuantity}
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                          {/* حُذفت الكمية المتبقية بعد إضافة الكمية المحجوزة */}
                          <div>
                            <Label>الحالة</Label>
                            <Select
                              value={course.status}
                              onValueChange={(value) => updateTreatmentCourse(courseIndex, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CREATED">تم إنشاء الكورس</SelectItem>
                                <SelectItem value="RESERVED">تم حجز العلاج</SelectItem>
                                <SelectItem value="DELIVERED">تم تسليم العلاج</SelectItem>
                                <SelectItem value="IN_PROGRESS">جاري العلاج</SelectItem>
                                <SelectItem value="COMPLETED">تم إكمال الكورس</SelectItem>
                                <SelectItem value="CANCELLED">تم إلغاء الكورس</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>تاريخ البداية *</Label>
                            <Input
                              type="date"
                              value={course.startDate}
                              onChange={(e) => updateTreatmentCourse(courseIndex, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>تاريخ النهاية</Label>
                            <Input
                              type="date"
                              value={course.endDate || ''}
                              onChange={(e) => updateTreatmentCourse(courseIndex, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* إدارة الحجز والتسليم */}
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-semibold text-blue-800 mb-3">إدارة الحجز والتسليم</h5>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reserveTreatment(courseIndex)}
                              disabled={course.isReserved || course.availableInStock < course.totalQuantity}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {course.isReserved ? '✓ محجوز' : 'حجز العلاج'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deliverTreatment(courseIndex)}
                              disabled={!course.isReserved || course.isDelivered}
                              className="text-green-600 hover:text-green-700"
                            >
                              {course.isDelivered ? '✓ مسلم' : 'تسليم العلاج'}
                            </Button>
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`px-2 py-1 rounded ${course.isReserved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {course.isReserved ? 'محجوز' : 'غير محجوز'}
                              </span>
                              <span className={`px-2 py-1 rounded ${course.isDelivered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {course.isDelivered ? 'مسلم' : 'غير مسلم'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description and Instructions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>وصف الكورس</Label>
                            <Textarea
                              value={course.description}
                              onChange={(e) => updateTreatmentCourse(courseIndex, 'description', e.target.value)}
                              placeholder="وصف الكورس العلاجي..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>التعليمات</Label>
                            <Textarea
                              value={course.instructions || ''}
                              onChange={(e) => updateTreatmentCourse(courseIndex, 'instructions', e.target.value)}
                              placeholder="تعليمات خاصة..."
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Doses Management */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium text-gray-700">
                              الجرعات ({course.doses.length})
                            </Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addDoseToCourse(courseIndex)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              إضافة جرعة
                            </Button>
                          </div>
                          
                          {course.doses.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                              لا توجد جرعات محددة
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {course.doses.map((dose, doseIndex) => (
                                <div key={doseIndex} className="p-3 bg-white border rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                      <Label>رقم الجرعة</Label>
                                      <Input
                                        type="number"
                                        value={dose.doseNumber}
                                        disabled
                                        className="bg-gray-100"
                                      />
                                    </div>
                                    <div>
                                      <Label>تاريخ الجرعة</Label>
                                      <Input
                                        type="date"
                                        value={dose.scheduledDate}
                                        onChange={(e) => updateDose(courseIndex, doseIndex, 'scheduledDate', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <Label>وقت الجرعة</Label>
                                      <Input
                                        type="time"
                                        value={dose.scheduledTime}
                                        onChange={(e) => updateDose(courseIndex, doseIndex, 'scheduledTime', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <Label>الكمية</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={dose.quantity}
                                        onChange={(e) => updateDose(courseIndex, doseIndex, 'quantity', parseInt(e.target.value) || 1)}
                                      />
                                    </div>
                                    <div>
                                      <Label>الحالة</Label>
                                      <Select
                                        value={dose.status}
                                        onValueChange={(value) => updateDose(courseIndex, doseIndex, 'status', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="اختر الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="SCHEDULED">مجدول</SelectItem>
                                          <SelectItem value="TAKEN">تم أخذه</SelectItem>
                                          <SelectItem value="MISSED">فات الموعد</SelectItem>
                                          <SelectItem value="SKIPPED">تم تخطيه</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex items-end gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markDoseAsTaken(courseIndex, doseIndex)}
                                        disabled={dose.isTaken}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        {dose.isTaken ? '✓' : 'أخذ'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markDoseAsMissed(courseIndex, doseIndex)}
                                        disabled={dose.isTaken}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        فات
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeDose(courseIndex, doseIndex)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* معلومات الالتزام */}
                                  {dose.isTaken && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div>
                                          <Label className="text-green-800 font-medium">تاريخ الأخذ الفعلي</Label>
                                          <Input
                                            type="date"
                                            value={dose.takenDate || ''}
                                            disabled
                                            className="bg-green-100"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-green-800 font-medium">وقت الأخذ الفعلي</Label>
                                          <Input
                                            type="time"
                                            value={dose.takenAt || ''}
                                            disabled
                                            className="bg-green-100"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-green-800 font-medium">الالتزام بالموعد</Label>
                                          <div className={`px-2 py-1 rounded text-center ${dose.isOnTime ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                            {dose.isOnTime ? '✓ في الموعد' : '⚠️ متأخر'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label>ملاحظات الجرعة</Label>
                                      <Textarea
                                        value={dose.notes || ''}
                                        onChange={(e) => updateDose(courseIndex, doseIndex, 'notes', e.target.value)}
                                        placeholder="ملاحظات خاصة بالجرعة..."
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <Label>الآثار الجانبية</Label>
                                      <Textarea
                                        value={dose.sideEffects || ''}
                                        onChange={(e) => updateDose(courseIndex, doseIndex, 'sideEffects', e.target.value)}
                                        placeholder="أي آثار جانبية ظهرت..."
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div className="mt-4">
                          <Label>ملاحظات إضافية</Label>
                          <Textarea
                            value={course.notes || ''}
                            onChange={(e) => updateTreatmentCourse(courseIndex, 'notes', e.target.value)}
                            placeholder="ملاحظات إضافية..."
                            rows={2}
                          />
                        </div>
                      </div>
                    )
                  })}
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
                  {!visitData.hospitalId ? (
                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                      <p>يرجى اختيار المستشفى أولاً لعرض العمليات المتاحة</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                      {filteredOperations?.length === 0 ? (
                        <div className="col-span-2 text-center py-4 text-gray-500">
                          {visitData.hospitalId ? 'لا توجد عمليات متاحة في هذا المستشفى' : 'يرجى اختيار المستشفى أولاً'}
                        </div>
                      ) : (
                        filteredOperations?.map((operation: any) => {
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
                  })
                      )}
                    </div>
                  )}
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
                  {!visitData.hospitalId ? (
                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                      <p>يرجى اختيار المستشفى أولاً لعرض الأدوية المتاحة</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                      {filteredMedications?.length === 0 ? (
                        <div className="col-span-2 text-center py-4 text-gray-500">
                          {visitData.hospitalId ? 'لا توجد أدوية متاحة في هذا المستشفى' : 'يرجى اختيار المستشفى أولاً'}
                        </div>
                      ) : (
                        filteredMedications?.map((medication: any) => {
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
                  })
                      )}
                    </div>
                  )}
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
              disabled={isLoading || savedSteps.has(currentStep)}
              className={`min-w-[120px] ${
                savedSteps.has(currentStep) 
                  ? 'bg-green-100 border-green-300 text-green-700' 
                  : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  جاري الحفظ...
                </>
              ) : savedSteps.has(currentStep) ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  محفوظ ✓
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  حفظ مؤقت
                </>
              )}
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
