import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json()
    const { id } = params

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'اسم المدينة مطلوب' },
        { status: 400 }
      )
    }

    const city = await prisma.city.update({
      where: { id },
      data: {
        name: name.trim()
      },
      include: {
        hospitals: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error('خطأ في تحديث المدينة:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'المدينة غير موجودة' },
        { status: 404 }
      )
    }

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'هذه المدينة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في تحديث المدينة' },
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

    // Check if city has hospitals
    const hospitalsCount = await prisma.hospital.count({
      where: { cityId: id }
    })

    if (hospitalsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المدينة لوجود مستشفيات مرتبطة بها' },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف المدينة بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المدينة:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'المدينة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في حذف المدينة' },
      { status: 500 }
    )
  }
}
