import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit
    const patientId = searchParams.get('patientId')

    const whereClause = patientId ? { patientId } : {}

    const [operations, total] = await Promise.all([
      prisma.operation.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientNumber: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true
            }
          },
          hospital: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          scheduledAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.operation.count({ where: whereClause })
    ])

    return NextResponse.json({
      data: operations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب العمليات:', error)
    return NextResponse.json(
      { error: 'فشل في جلب العمليات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      patientId, 
      doctorId, 
      hospitalId, 
      visitId, 
      name, 
      description, 
      scheduledAt, 
      status, 
      notes, 
      images 
    } = data

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'المريض المحدد غير موجود' },
        { status: 400 }
      )
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'الطبيب المحدد غير موجود' },
        { status: 400 }
      )
    }

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'المستشفى المحدد غير موجود' },
        { status: 400 }
      )
    }

    const operation = await prisma.operation.create({
      data: {
        patientId,
        doctorId,
        hospitalId,
        visitId: visitId || null,
        name: name.trim(),
        description: description?.trim() || null,
        scheduledAt: new Date(scheduledAt),
        status: status || 'SCHEDULED',
        notes: notes?.trim() || null,
        images: images || []
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientNumber: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
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

    return NextResponse.json(operation, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء العملية:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء العملية' },
      { status: 500 }
    )
  }
}
