import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// جلب أمراض مستشفى معين أو جميع الأمراض
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')
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
    
    if (severity) {
      whereClause.severity = severity
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

    const [diseases, total] = await Promise.all([
      prisma.hospitalDisease.findMany({
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
      prisma.hospitalDisease.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: diseases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching hospital diseases:', error)
    return NextResponse.json({ error: 'Failed to fetch diseases' }, { status: 500 })
  }
}

// إضافة أمراض جديدة لمستشفى
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hospitalId, diseases } = body

    if (!hospitalId || !diseases || !Array.isArray(diseases)) {
      return NextResponse.json({ error: 'Hospital ID and diseases array are required' }, { status: 400 })
    }

    // التحقق من وجود المستشفى
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // إنشاء الأمراض
    const createdDiseases = await Promise.all(
      diseases.map((disease: any) =>
        prisma.hospitalDisease.create({
          data: {
            hospitalId,
            name: disease.name,
            description: disease.description || '',
            category: disease.category || '',
            severity: disease.severity || 'medium'
          }
        })
      )
    )

    return NextResponse.json({
      message: 'Diseases created successfully',
      diseases: createdDiseases
    })
  } catch (error) {
    console.error('Error creating hospital diseases:', error)
    return NextResponse.json({ error: 'Failed to create diseases' }, { status: 500 })
  }
}
