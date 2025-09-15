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

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
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
              name: true,
              city: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.visit.count({ where: whereClause })
    ])

    return NextResponse.json({
      data: visits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الزيارات:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الزيارات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('🏥 Visits API: POST request received:', {
      data: data,
      hasPatientId: !!data.patientId,
      hasDoctorId: !!data.doctorId,
      hasHospitalId: !!data.hospitalId,
      scheduledAt: data.scheduledAt
    })
    
    // Validate required fields
    if (!data.patientId) {
      return NextResponse.json(
        { error: 'معرف المريض مطلوب' },
        { status: 400 }
      )
    }

    if (!data.scheduledAt) {
      return NextResponse.json(
        { error: 'تاريخ ووقت الزيارة مطلوب' },
        { status: 400 }
      )
    }

    // Create visit data with optional fields
    const visitData: any = {
      patientId: data.patientId,
      scheduledAt: new Date(data.scheduledAt),
      status: data.status || 'SCHEDULED',
      notes: data.notes || '',
      diagnosis: data.diagnosis || '',
      symptoms: data.symptoms || '',
      vitalSigns: data.vitalSigns || '',
      temperature: data.temperature || '',
      bloodPressure: data.bloodPressure || '',
      heartRate: data.heartRate || '',
      weight: data.weight || '',
      height: data.height || ''
    }

    // Add optional fields if they exist
    if (data.doctorId) {
      visitData.doctorId = data.doctorId
    }
    if (data.hospitalId) {
      visitData.hospitalId = data.hospitalId
    }

    console.log('🏥 Visits API: Creating visit with data:', visitData)

    const visit = await prisma.visit.create({
      data: visitData,
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
            name: true,
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(visit, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء الزيارة:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'فشل في إنشاء الزيارة' },
      { status: 500 }
    )
  }
}

