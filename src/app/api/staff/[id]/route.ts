import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { firstName, lastName, position, phone, hospitalId } = await request.json()
    const { id } = params

    if (!firstName || !lastName || !position || !phone || !hospitalId) {
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

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position,
        phone: phone.trim(),
        hospitalId
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

    return NextResponse.json(staff)
  } catch (error) {
    console.error('خطأ في تحديث الموظف:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'البيانات المدخلة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في تحديث الموظف' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get staff with user info
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    // Delete staff and associated user
    await prisma.$transaction([
      prisma.staff.delete({ where: { id } }),
      prisma.user.delete({ where: { id: staff.userId } })
    ])

    return NextResponse.json({ message: 'تم حذف الموظف بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف الموظف:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في حذف الموظف' },
      { status: 500 }
    )
  }
}
