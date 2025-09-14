import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
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

    return NextResponse.json(staff)
  } catch (error) {
    console.error('خطأ في جلب الموظفين:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الموظفين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, position, phone, email, password, hospitalId } = await request.json()

    if (!firstName || !lastName || !position || !phone || !email || !password || !hospitalId) {
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
        role: 'STAFF'
      }
    })

    // Create staff
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        hospitalId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position,
        phone: phone.trim()
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

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء الموظف:', error)
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'البيانات المدخلة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في إنشاء الموظف' },
      { status: 500 }
    )
  }
}
