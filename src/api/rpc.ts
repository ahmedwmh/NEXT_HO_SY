import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@/lib/db'
import { createAuthContext, requireAdmin, requireStaffOrAdmin, requireHospitalAccess, AuthContext } from '@/lib/auth'

// Extend Hono context to include auth
type Variables = {
  auth: AuthContext
}

const app = new Hono<{ Variables: Variables }>()

import {
  createUserSchema,
  loginSchema,
  createCitySchema,
  createCenterSchema,
  createHospitalSchema,
  createDoctorSchema,
  createStaffSchema,
  createPatientSchema,
  createVisitSchema,
  createTestSchema,
  createTreatmentSchema,
  createOperationSchema,
  createDiseaseSchema,
  createAttachmentSchema,
  paginationSchema,
  apiResponseSchema,
} from '@/lib/validations'
import { ApiResponse, PaginatedResponse } from '@/types'

// Helper function for getting user from token
async function getUserFromToken(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: token },
      include: { doctorProfile: true, staffProfile: true }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorProfile: user.doctorProfile || undefined,
      staffProfile: user.staffProfile || undefined,
    }
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

// Middleware for authentication
app.use('*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  const user = token ? await getUserFromToken(token) : null
  c.set('auth', createAuthContext(user))
  await next()
})

// Auth routes
app.post('/auth/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true, staffProfile: true }
    })

    if (!user || user.password !== password) {
      return c.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, 401)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctorProfile: user.doctorProfile,
        staffProfile: user.staffProfile,
      }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Admin routes
app.post('/admin/users', zValidator('json', createUserSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireAdmin(auth)
    
    const userData = c.req.valid('json')
    const user = await prisma.user.create({
      data: userData,
      include: { doctorProfile: true, staffProfile: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'User created successfully',
      data: user
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// City routes
app.post('/cities', zValidator('json', createCitySchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireAdmin(auth)
    
    const cityData = c.req.valid('json')
    const city = await prisma.city.create({ data: cityData })

    return c.json<ApiResponse>({
      success: true,
      message: 'City created successfully',
      data: city
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to create city',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

app.get('/cities', zValidator('query', paginationSchema), async (c) => {
  try {
    const { page, limit, search } = c.req.valid('query')
    const skip = (page - 1) * limit

    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip,
        take: limit,
        include: { hospitals: true },
        orderBy: { name: 'asc' }
      }),
      prisma.city.count({ where })
    ])

    return c.json<PaginatedResponse<any>>({
      data: cities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to fetch cities',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})


// Hospital routes
app.post('/hospitals', zValidator('json', createHospitalSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireAdmin(auth)
    
    const hospitalData = c.req.valid('json')
    const hospital = await prisma.hospital.create({
      data: hospitalData,
      include: { city: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to create hospital',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Doctor routes
app.post('/doctors', zValidator('json', createDoctorSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireAdmin(auth)
    
    const doctorData = c.req.valid('json')
    const doctor = await prisma.doctor.create({
      data: doctorData,
      include: { user: true, hospital: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to create doctor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Staff routes
app.post('/staff', zValidator('json', createStaffSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireAdmin(auth)
    
    const staffData = c.req.valid('json')
    const staff = await prisma.staff.create({
      data: staffData,
      include: { user: true, hospital: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Staff created successfully',
      data: staff
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to create staff',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Patient routes
app.post('/patients', zValidator('json', createPatientSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const patientData = c.req.valid('json')
    
    // Generate patient number
    const patientCount = await prisma.patient.count({
      where: { hospitalId: patientData.hospitalId }
    })
    const patientNumber = `P${patientData.hospitalId.slice(-4)}${String(patientCount + 1).padStart(3, '0')}`
    
    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        patientNumber,
        dateOfBirth: new Date(patientData.dateOfBirth)
      },
      include: { hospital: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Patient created successfully',
      data: patient
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to create patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

app.get('/patients', zValidator('query', paginationSchema), async (c) => {
  try {
    const auth = c.get('auth')
    const user = requireStaffOrAdmin(auth)
    
    const { page, limit, search } = c.req.valid('query')
    const skip = (page - 1) * limit

    let where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    // Filter by hospital if not admin
    if (user.role !== 'ADMIN') {
      const hospitalId = user.doctorProfile?.hospitalId || user.staffProfile?.hospitalId
      if (hospitalId) {
        where.hospitalId = hospitalId
      }
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: { hospital: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ])

    return c.json<PaginatedResponse<any>>({
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to fetch patients',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Visit routes
app.post('/visits', zValidator('json', createVisitSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const visitData = c.req.valid('json')
    const visit = await prisma.visit.create({
      data: {
        ...visitData,
        scheduledAt: new Date(visitData.scheduledAt)
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        hospital: true
      }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Visit scheduled successfully',
      data: visit
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to schedule visit',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Test routes
app.post('/tests', zValidator('json', createTestSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const testData = c.req.valid('json')
    const test = await prisma.test.create({
      data: {
        ...testData,
        scheduledAt: new Date(testData.scheduledAt)
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        hospital: true
      }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Test scheduled successfully',
      data: test
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to schedule test',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Treatment routes
app.post('/treatments', zValidator('json', createTreatmentSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const treatmentData = c.req.valid('json')
    const treatment = await prisma.treatment.create({
      data: {
        ...treatmentData,
        scheduledAt: new Date(treatmentData.scheduledAt)
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        hospital: true
      }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Treatment scheduled successfully',
      data: treatment
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to schedule treatment',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Operation routes
app.post('/operations', zValidator('json', createOperationSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const operationData = c.req.valid('json')
    const operation = await prisma.operation.create({
      data: {
        ...operationData,
        scheduledAt: new Date(operationData.scheduledAt)
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        hospital: true
      }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Operation scheduled successfully',
      data: operation
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to schedule operation',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Disease routes
app.post('/diseases', zValidator('json', createDiseaseSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const diseaseData = c.req.valid('json')
    const disease = await prisma.disease.create({
      data: {
        ...diseaseData,
        diagnosedAt: new Date(diseaseData.diagnosedAt)
      },
      include: { patient: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Disease recorded successfully',
      data: disease
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to record disease',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Attachment routes
app.post('/attachments', zValidator('json', createAttachmentSchema), async (c) => {
  try {
    const auth = c.get('auth')
    requireStaffOrAdmin(auth)
    
    const attachmentData = c.req.valid('json')
    const attachment = await prisma.attachment.create({
      data: attachmentData,
      include: { patient: true }
    })

    return c.json<ApiResponse>({
      success: true,
      message: 'Attachment uploaded successfully',
      data: attachment
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to upload attachment',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Dashboard stats
app.get('/dashboard/stats', async (c) => {
  try {
    const auth = c.get('auth')
    const user = requireStaffOrAdmin(auth)
    
    let whereClause: any = {}
    
    // Filter by hospital if not admin
    if (user.role !== 'ADMIN') {
      const hospitalId = user.doctorProfile?.hospitalId || user.staffProfile?.hospitalId
      if (hospitalId) {
        whereClause.hospitalId = hospitalId
      }
    }

    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      totalHospitals,
      totalVisits,
      totalTests,
      totalTreatments,
      totalOperations,
      upcomingVisits,
      pendingTests,
      pendingTreatments,
      pendingOperations
    ] = await Promise.all([
      prisma.patient.count({ where: whereClause }),
      prisma.doctor.count({ where: whereClause.hospitalId ? { hospitalId: whereClause.hospitalId } : {} }),
      prisma.staff.count({ where: whereClause.hospitalId ? { hospitalId: whereClause.hospitalId } : {} }),
      prisma.hospital.count(),
      prisma.visit.count({ where: whereClause }),
      prisma.test.count({ where: whereClause }),
      prisma.treatment.count({ where: whereClause }),
      prisma.operation.count({ where: whereClause }),
      prisma.visit.count({ where: { ...whereClause, status: 'SCHEDULED' } }),
      prisma.test.count({ where: { ...whereClause, status: 'SCHEDULED' } }),
      prisma.treatment.count({ where: { ...whereClause, status: 'SCHEDULED' } }),
      prisma.operation.count({ where: { ...whereClause, status: 'SCHEDULED' } })
    ])

    return c.json<ApiResponse>({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalPatients,
        totalDoctors,
        totalStaff,
        totalHospitals,
        totalVisits,
        totalTests,
        totalTreatments,
        totalOperations,
        upcomingVisits,
        pendingTests,
        pendingTreatments,
        pendingOperations
      }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
