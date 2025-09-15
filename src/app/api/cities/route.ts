import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('🏙️ Cities API: GET request received')
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit

    console.log('🏙️ Cities API: Query params:', { page, limit, skip })

    console.log('🏙️ Cities API: Starting database query...')
    const [cities, total] = await Promise.all([
      prisma.city.findMany({
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
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.city.count()
    ])

    console.log('🏙️ Cities API: Database query successful:', {
      citiesCount: cities.length,
      total
    })

    const response = {
      data: cities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    console.log('🏙️ Cities API: Returning response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Cities API: Error occurred:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'فشل في جلب المدن' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const city = await prisma.city.create({
      data,
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

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء المدينة:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء المدينة' },
      { status: 500 }
    )
  }
}

