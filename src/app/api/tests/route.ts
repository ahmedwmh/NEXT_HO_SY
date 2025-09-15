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
      prisma.test.count({ where: whereClause })
    ])

    return NextResponse.json({
      data: tests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الفحوصات:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الفحوصات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const test = await prisma.test.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt)
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
        }
      }
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء الفحص:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الفحص' },
      { status: 500 }
    )
  }
}

