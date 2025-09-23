import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب جميع الأمراض
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const patientId = searchParams.get('patientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const skip = (page - 1) * limit

    const whereClause: any = {}
    
    if (patientId) {
      whereClause.patientId = patientId
    }
    
    if (startDate && endDate) {
      whereClause.diagnosedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (severity) {
      whereClause.severity = severity
    }
    
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
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [diseases, total] = await Promise.all([
      prisma.disease.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientNumber: true
            }
          }
        },
        orderBy: { diagnosedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.disease.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: diseases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching diseases:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الأمراض' },
      { status: 500 }
    )
  }
}

// POST - إنشاء مرض جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const disease = await prisma.disease.create({
      data: {
        patientId: data.patientId,
        name: data.name,
        description: data.description,
        diagnosedAt: new Date(data.diagnosedAt),
        severity: data.severity,
        status: data.status || 'Active',
        notes: data.notes
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientNumber: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: disease
    })
  } catch (error) {
    console.error('Error creating disease:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المرض' },
      { status: 500 }
    )
  }
}