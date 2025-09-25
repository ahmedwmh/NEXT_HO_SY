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
  hospitalId: (req) => {
    // جلب hospitalId من body الطلب
    return req.headers.get('x-hospital-id') || undefined
  }
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

    // إنشاء رقم المريض الفريد
    const patientCount = await prisma.patient.count({
      where: { hospitalId }
    })
    const patientNumber = `P${hospitalId.slice(-4)}${String(patientCount + 1).padStart(4, '0')}`

    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        hospitalId,
        patientNumber
      },
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