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
        orderBy: {
          diagnosedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.disease.count({ where: whereClause })
    ])

    return NextResponse.json({
      data: diseases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الأمراض:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الأمراض' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { patientId, name, description, diagnosedAt, severity, status, notes } = data

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

    const disease = await prisma.disease.create({
      data: {
        patientId,
        name: name.trim(),
        description: description?.trim() || null,
        diagnosedAt: new Date(diagnosedAt),
        severity: severity || null,
        status: status || 'Active',
        notes: notes?.trim() || null
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

    return NextResponse.json(disease, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء المرض:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء المرض' },
      { status: 500 }
    )
  }
}
