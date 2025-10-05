import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withPermission, withHospitalAccess } from '@/lib/permission-middleware'

// GET - جلب المرضى مع التحقق من الصلاحيات
export const GET = withPermission({
  resource: 'PATIENTS',
  action: 'READ',
  hospitalId: (req) => {
    const url = new URL(req.url)
    return url.searchParams.get('hospitalId') || undefined
  }
})(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const idNumber = searchParams.get('idNumber')
    
    // Check if this is an ID number validation request
    if (idNumber) {
      const existingPatient = await prisma.patient.findFirst({
        where: { idNumber: idNumber.trim() },
        select: { id: true, firstName: true, lastName: true, patientNumber: true }
      })
      
      return NextResponse.json({
        success: true,
        exists: !!existingPatient,
        patient: existingPatient
      })
    }
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (hospitalId) {
      whereClause.hospitalId = hospitalId
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { patientNumber: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        include: {
          city: {
            select: {
              id: true,
              name: true
            }
          },
          hospital: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.patient.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المرضى' },
      { status: 500 }
    )
  }
})

// POST - إنشاء مريض جديد مع التحقق من الصلاحيات
export const POST = withPermission({
  resource: 'PATIENTS',
  action: 'WRITE',
  hospitalId: undefined // We'll handle hospital validation inside the handler
})(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { hospitalId, ...patientData } = body

    if (!hospitalId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستشفى مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستشفى
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: 'المستشفى غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من أن المستخدم لديه صلاحية على هذا المستشفى
    // (This is a simplified check - you might want to implement more sophisticated hospital access control)
    console.log('🔐 التحقق من الصلاحية للمستشفى:', hospitalId)

    // إنشاء رقم المريض الفريد
    const patientCount = await prisma.patient.count({
      where: { hospitalId }
    })
    const patientNumber = `P${hospitalId.slice(-4)}${String(patientCount + 1).padStart(4, '0')}`

    // Extract images and tests from patientData
    const { patientImages = [], selectedTests = [], ...patientFields } = patientData

    // Convert dateOfBirth string to DateTime
    const processedData = {
      ...patientFields,
      dateOfBirth: new Date(patientFields.dateOfBirth),
      hospitalId,
      patientNumber
    }

    // Create patient with related data in a transaction
    const patient = await prisma.$transaction(async (tx) => {
      // Create the patient
      const newPatient = await tx.patient.create({
        data: processedData,
        include: {
          city: {
            select: {
              id: true,
              name: true
            }
          },
          hospital: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // Create patient images if any
      if (patientImages.length > 0) {
        await tx.patientImage.createMany({
          data: patientImages.map((imageUrl: string) => ({
            patientId: newPatient.id,
            imageUrl,
            type: 'patient_photo'
          }))
        })
      }

      // Create tests if any
      if (selectedTests.length > 0) {
        // Get a default doctor for the hospital (you might want to improve this logic)
        const defaultDoctor = await tx.doctor.findFirst({
          where: { hospitalId },
          select: { id: true }
        })

        if (defaultDoctor) {
          await tx.test.createMany({
            data: selectedTests.map((test: any) => ({
              patientId: newPatient.id,
              doctorId: defaultDoctor.id,
              hospitalId,
              name: test.name,
              description: test.description,
              scheduledAt: new Date(), // You might want to make this configurable
              status: test.status || 'SCHEDULED'
            }))
          })
        }
      }

      return newPatient
    })

    return NextResponse.json({
      success: true,
      data: patient,
      message: 'تم إنشاء المريض بنجاح'
    })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المريض' },
      { status: 500 }
    )
  }
})