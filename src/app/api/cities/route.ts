import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      include: {
        hospitals: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('خطأ في جلب المدن:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المدن' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'اسم المدينة مطلوب' },
        { status: 400 }
      )
    }

    const city = await prisma.city.create({
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

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء المدينة:', error)
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'هذه المدينة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في إنشاء المدينة' },
      { status: 500 }
    )
  }
}
