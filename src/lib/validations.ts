import { z } from 'zod'

// User schemas
export const userRoleSchema = z.enum(['ADMIN', 'DOCTOR', 'STAFF'])

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema,
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// City schemas
export const createCitySchema = z.object({
  name: z.string().min(1, 'City name is required'),
})

export const updateCitySchema = createCitySchema.partial()

// Center schemas
export const createCenterSchema = z.object({
  name: z.string().min(1, 'Center name is required'),
  address: z.string().min(1, 'Address is required'),
  cityId: z.string().min(1, 'City is required'),
})

export const updateCenterSchema = createCenterSchema.partial()

// Hospital schemas
export const createHospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  cityId: z.string().min(1, 'City is required'),
})

export const updateHospitalSchema = createHospitalSchema.partial()

// Doctor schemas
export const createDoctorSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
})

export const updateDoctorSchema = createDoctorSchema.partial()

// Staff schemas
export const createStaffSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.string().min(1, 'Position is required'),
  phone: z.string().optional(),
})

export const updateStaffSchema = createStaffSchema.partial()

// Patient schemas
export const createPatientSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  profilePhoto: z.string().optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

// Visit schemas
export const visitStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

export const createVisitSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  status: visitStatusSchema.default('SCHEDULED'),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
})

export const updateVisitSchema = createVisitSchema.partial()

// Test schemas
export const testStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

export const createTestSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z.string().min(1, 'Test name is required'),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  status: testStatusSchema.default('SCHEDULED'),
  results: z.string().optional(),
  notes: z.string().optional(),
})

export const updateTestSchema = createTestSchema.partial()

// Treatment schemas
export const treatmentStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

export const createTreatmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z.string().min(1, 'Treatment name is required'),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  status: treatmentStatusSchema.default('SCHEDULED'),
  notes: z.string().optional(),
})

export const updateTreatmentSchema = createTreatmentSchema.partial()

// Operation schemas
export const operationStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

export const createOperationSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z.string().min(1, 'Operation name is required'),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  status: operationStatusSchema.default('SCHEDULED'),
  notes: z.string().optional(),
})

export const updateOperationSchema = createOperationSchema.partial()

// Disease schemas
export const createDiseaseSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  name: z.string().min(1, 'Disease name is required'),
  description: z.string().optional(),
  diagnosedAt: z.string().min(1, 'Diagnosis date is required'),
  severity: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

export const updateDiseaseSchema = createDiseaseSchema.partial()

// Attachment schemas
export const createAttachmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileType: z.string().min(1, 'File type is required'),
  description: z.string().optional(),
})

// API Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
})

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateCityInput = z.infer<typeof createCitySchema>
export type UpdateCityInput = z.infer<typeof updateCitySchema>
export type CreateCenterInput = z.infer<typeof createCenterSchema>
export type UpdateCenterInput = z.infer<typeof updateCenterSchema>
export type CreateHospitalInput = z.infer<typeof createHospitalSchema>
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>
export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>
export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type CreateVisitInput = z.infer<typeof createVisitSchema>
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>
export type CreateTestInput = z.infer<typeof createTestSchema>
export type UpdateTestInput = z.infer<typeof updateTestSchema>
export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>
export type CreateOperationInput = z.infer<typeof createOperationSchema>
export type UpdateOperationInput = z.infer<typeof updateOperationSchema>
export type CreateDiseaseInput = z.infer<typeof createDiseaseSchema>
export type UpdateDiseaseInput = z.infer<typeof updateDiseaseSchema>
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

