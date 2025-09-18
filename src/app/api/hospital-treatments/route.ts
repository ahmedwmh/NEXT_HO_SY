import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const hospitalId = searchParams.get('hospitalId')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    
    if (hospitalId) {
      where.hospitalId = hospitalId
    }
    
    if (category) {
      where.category = category
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [treatments, total] = await Promise.all([
      prisma.hospitalTreatment.findMany({
        where,
        include: {
          hospital: {
            include: {
              city: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.hospitalTreatment.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: treatments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching hospital treatments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hospitalId, treatments } = await request.json()

    if (!hospitalId || !treatments || !Array.isArray(treatments)) {
      return NextResponse.json(
        { error: 'Hospital ID and treatments array are required' },
        { status: 400 }
      )
    }

    // Verify hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      )
    }

    // Create treatments
    const createdTreatments = await Promise.all(
      treatments.map((treatment: any) =>
        prisma.hospitalTreatment.create({
          data: {
            hospitalId,
            name: treatment.name,
            description: treatment.description || '',
            category: treatment.category,
            duration: treatment.duration,
            cost: treatment.cost || 0,
            isActive: true
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      data: createdTreatments,
      message: 'Treatments created successfully'
    })
  } catch (error) {
    console.error('Error creating hospital treatments:', error)
    return NextResponse.json(
      { error: 'Failed to create treatments' },
      { status: 500 }
    )
  }
}