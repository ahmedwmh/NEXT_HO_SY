import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب جميع الزيارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const whereClause: any = {}
    
    if (status) {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientNumber: { contains: search, mode: 'insensitive' } } },
        { doctor: { firstName: { contains: search, mode: 'insensitive' } } },
        { doctor: { lastName: { contains: search, mode: 'insensitive' } } },
        { hospital: { name: { contains: search, mode: 'insensitive' } } },
        { symptoms: { contains: search, mode: 'insensitive' } }
      ]
    }

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
          },
          city: {
            select: {
              id: true,
              name: true
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
      success: true,
      data: visits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الزيارات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء زيارة جديدة
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const visit = await prisma.visit.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        hospitalId: data.hospitalId,
        cityId: data.cityId,
        scheduledAt: new Date(data.scheduledAt),
        status: data.status || 'SCHEDULED',
        currentStep: data.currentStep || 1,
        notes: data.notes,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        vitalSigns: data.vitalSigns,
        temperature: data.temperature,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        weight: data.weight,
        height: data.height,
        images: data.images || []
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
            name: true,
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: visit
    })
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الزيارة' },
      { status: 500 }
    )
  }
}