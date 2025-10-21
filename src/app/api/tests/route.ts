import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب جميع الفحوصات
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
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientNumber: { contains: search, mode: 'insensitive' } } },
        { doctor: { firstName: { contains: search, mode: 'insensitive' } } },
        { doctor: { lastName: { contains: search, mode: 'insensitive' } } },
        { hospital: { name: { contains: search, mode: 'insensitive' } } },
        { results: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
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
          },
          visit: {
            select: {
              id: true,
              scheduledAt: true
            }
          }
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.test.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الفحوصات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء فحص جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const test = await prisma.test.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        hospitalId: data.hospitalId,
        visitId: data.visitId,
        name: data.name,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt),
        status: data.status || 'SCHEDULED',
        results: data.results,
        notes: data.notes,
        images: data.images || [],
        testStatus: data.testStatus,
        testStatusDescription: data.testStatusDescription,
        testImages: data.testImages || []
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
        },
        visit: {
          select: {
            id: true,
            scheduledAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: test
    })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الفحص' },
      { status: 500 }
    )
  }
}