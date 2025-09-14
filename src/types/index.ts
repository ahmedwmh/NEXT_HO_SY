import { User, City, Hospital, Doctor, Staff, Patient, Visit, Test, Treatment, Operation, Disease, Attachment, UserRole, VisitStatus, TestStatus, TreatmentStatus, OperationStatus } from '@prisma/client'

export type { User, City, Hospital, Doctor, Staff, Patient, Visit, Test, Treatment, Operation, Disease, Attachment, UserRole, VisitStatus, TestStatus, TreatmentStatus, OperationStatus }

// Extended types with relations
export type UserWithProfile = User & {
  doctorProfile?: Doctor
  staffProfile?: Staff
}

export type DoctorWithRelations = Doctor & {
  user: User
  hospital: Hospital
}

export type StaffWithRelations = Staff & {
  user: User
  hospital: Hospital
}

export type PatientWithRelations = Patient & {
  hospital: Hospital
  visits: Visit[]
  tests: Test[]
  treatments: Treatment[]
  operations: Operation[]
  diseases: Disease[]
  attachments: Attachment[]
}

export type VisitWithRelations = Visit & {
  patient: Patient
  doctor: Doctor & { user: User }
  hospital: Hospital
}

export type TestWithRelations = Test & {
  patient: Patient
  doctor: Doctor & { user: User }
  hospital: Hospital
}

export type TreatmentWithRelations = Treatment & {
  patient: Patient
  doctor: Doctor & { user: User }
  hospital: Hospital
}

export type OperationWithRelations = Operation & {
  patient: Patient
  doctor: Doctor & { user: User }
  hospital: Hospital
}

export type DiseaseWithRelations = Disease & {
  patient: Patient
}

export type AttachmentWithRelations = Attachment & {
  patient: Patient
}

export type HospitalWithRelations = Hospital & {
  city: City
  doctors: DoctorWithRelations[]
  staff: StaffWithRelations[]
  patients: Patient[]
}


export type CityWithRelations = City & {
  hospitals: Hospital[]
}

// Dashboard types
export type DashboardStats = {
  totalPatients: number
  totalDoctors: number
  totalStaff: number
  totalHospitals: number
  totalVisits: number
  totalTests: number
  totalTreatments: number
  totalOperations: number
  upcomingVisits: number
  pendingTests: number
  pendingTreatments: number
  pendingOperations: number
}

export type PatientDashboard = {
  patient: PatientWithRelations
  upcomingVisits: VisitWithRelations[]
  recentTests: TestWithRelations[]
  recentTreatments: TreatmentWithRelations[]
  recentOperations: OperationWithRelations[]
  diseases: DiseaseWithRelations[]
  attachments: AttachmentWithRelations[]
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
  error?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export type FormState = {
  isSubmitting: boolean
  errors: Record<string, string[]>
  success: boolean
  message?: string
}

// Auth types
export type AuthUser = {
  id: string
  email: string
  role: UserRole
  doctorProfile?: Doctor
  staffProfile?: Staff
}

export type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

// File upload types
export type FileUpload = {
  file: File
  fileName: string
  fileType: string
  description?: string
}

export type UploadedFile = {
  fileName: string
  fileUrl: string
  fileType: string
  description?: string
}

// Search and filter types
export type SearchFilters = {
  search?: string
  hospitalId?: string
  doctorId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export type SortOptions = {
  field: string
  direction: 'asc' | 'desc'
}

