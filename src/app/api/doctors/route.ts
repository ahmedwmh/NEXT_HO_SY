import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit
    const hospitalId = searchParams.get('hospitalId')

    const whereClause = hospitalId ? { hospitalId } : {}

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
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
        orderBy: { firstName: 'asc' },
        skip,
        take: limit
      }),
      prisma.doctor.count({ where: whereClause })
    ])

    // Debug: Log first doctor structure
    if (doctors.length > 0) {
      console.log('👨‍⚕️ First doctor structure:', {
        id: doctors[0].id,
        firstName: doctors[0].firstName,
        lastName: doctors[0].lastName,
        hospitalId: doctors[0].hospitalId,
        hospital: doctors[0].hospital
      })
    }

    return NextResponse.json({
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('خطأ في جلب الأطباء:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الأطباء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, password, ...doctorData } = data
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Create user and doctor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          email,
          password, // In production, hash this password
          role: 'DOCTOR'
        }
      })

      // Create doctor profile linked to the user
      const { cityId, ...doctorFields } = doctorData
      const doctor = await tx.doctor.create({
        data: {
          ...doctorFields,
          userId: user.id
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
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

      return doctor
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء الطبيب:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الطبيب' },
      { status: 500 }
    )
  }
}