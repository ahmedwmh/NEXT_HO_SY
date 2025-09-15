import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const city = await prisma.city.findUnique({
      where: { id: params.id },
      include: {
        hospitals: {
          select: {
            id: true,
            name: true
          }
        },
        patients: {
          select: {
            id: true
          }
        }
      }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'المدينة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(city)
  } catch (error) {
    console.error('خطأ في جلب بيانات المدينة:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات المدينة' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const city = await prisma.city.update({
      where: { id: params.id },
      data: {
        name: data.name
      },
      include: {
        hospitals: {
          select: {
            id: true,
            name: true
          }
        },
        patients: {
          select: {
            id: true
          }
        }
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error('خطأ في تحديث المدينة:', error)
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
    // Check if city has hospitals
    const hospitalsCount = await prisma.hospital.count({
      where: { cityId: params.id }
    })

    if (hospitalsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المدينة لوجود مستشفيات مرتبطة بها' },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف المدينة بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المدينة:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المدينة' },
      { status: 500 }
    )
  }
}