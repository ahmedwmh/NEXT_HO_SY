import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        hospital: {
          include: {
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    return NextResponse.json(doctors)
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
    const { firstName, lastName, specialization, phone, licenseNumber, hospitalId, email, password } = await request.json()

    if (!firstName || !lastName || !specialization || !hospitalId || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      )
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: 'DOCTOR'
      }
    })

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        hospitalId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        specialization,
        phone: phone?.trim() || null,
        licenseNumber: licenseNumber?.trim() || null
      },
      include: {
        hospital: {
          include: {
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json(doctor, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء الطبيب:', error)
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'البيانات المدخلة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في إنشاء الطبيب' },
      { status: 500 }
    )
  }
}
