import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// جلب فحوصات المستشفيات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const cityId = searchParams.get('cityId')
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (hospitalId) {
      // Handle both formats: "name-id" and "id"
      whereClause.OR = [
        { hospitalId: hospitalId },
        { hospitalId: { contains: hospitalId } }
      ]
    }

    if (category) {
      whereClause.category = category
    }

    if (cityId) {
      whereClause.hospital = { cityId }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { hospital: { name: { contains: search, mode: 'insensitive' } } },
        { hospital: { city: { name: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    const [tests, total] = await Promise.all([
      prisma.hospitalTest.findMany({
        where: whereClause,
        include: {
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
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.hospitalTest.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching hospital tests:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}

// إضافة فحص جديد لمستشفى
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hospitalId, name, description, category, duration, cost } = body

    if (!hospitalId || !name) {
      return NextResponse.json({ error: 'Hospital ID and test name are required' }, { status: 400 })
    }

    // التحقق من وجود المستشفى
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // إنشاء الفحص
    const test = await prisma.hospitalTest.create({
      data: {
        hospitalId,
        name,
        description: description || '',
        category: category || '',
        duration: duration || '',
        cost: cost || 0
      },
      include: {
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

    return NextResponse.json({
      success: true,
      data: test
    })
  } catch (error) {
    console.error('Error creating hospital test:', error)
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}

