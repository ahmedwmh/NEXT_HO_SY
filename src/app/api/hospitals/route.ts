import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        city: {
          select: {
            id: true,
            name: true
          }
        },
        doctors: {
          select: {
            id: true
          }
        },
        staff: {
          select: {
            id: true
          }
        },
        patients: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(hospitals)
  } catch (error) {
    console.error('خطأ في جلب المستشفيات:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المستشفيات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, address, phone, email, cityId } = await request.json()

    if (!name || !name.trim() || !address || !address.trim() || !cityId) {
      return NextResponse.json(
        { error: 'اسم المستشفى والعنوان والمدينة مطلوبة' },
        { status: 400 }
      )
    }

    // Check if city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'المدينة المحددة غير موجودة' },
        { status: 400 }
      )
    }

    const hospital = await prisma.hospital.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        cityId
      },
      include: {
        city: {
          select: {
            id: true,
            name: true
          }
        },
        doctors: {
          select: {
            id: true
          }
        },
        staff: {
          select: {
            id: true
          }
        },
        patients: {
          select: {
            id: true
          }
        }
      }
    })

    return NextResponse.json(hospital, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء المستشفى:', error)
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'هذا المستشفى موجود بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في إنشاء المستشفى' },
      { status: 500 }
    )
  }
}
