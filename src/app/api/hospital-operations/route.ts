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
      // Handle both formats: "name-id" and "id"
      where.OR = [
        { hospitalId: hospitalId },
        { hospitalId: { contains: hospitalId } }
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [operations, total] = await Promise.all([
      prisma.hospitalOperation.findMany({
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
      prisma.hospitalOperation.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: operations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching hospital operations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both single operation and operations array
    const { hospitalId, operations, ...singleOperation } = body

    if (!hospitalId) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
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

    let operationsToCreate = []
    
    // If operations array is provided, use it
    if (operations && Array.isArray(operations)) {
      operationsToCreate = operations
    } 
    // If single operation data is provided, wrap it in array
    else if (singleOperation.name) {
      operationsToCreate = [singleOperation]
    } else {
      return NextResponse.json(
        { error: 'Operation data is required' },
        { status: 400 }
      )
    }

    // Create operations
    const createdOperations = await Promise.all(
      operationsToCreate.map((operation: any) =>
        prisma.hospitalOperation.create({
          data: {
            hospitalId,
            name: operation.name,
            description: operation.description || '',
            category: operation.category || '',
            duration: operation.duration || '',
            cost: operation.cost || 0,
            isActive: operation.isActive !== undefined ? operation.isActive : true
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      data: createdOperations,
      message: 'Operations created successfully'
    })
  } catch (error) {
    console.error('Error creating hospital operations:', error)
    return NextResponse.json(
      { error: 'Failed to create operations' },
      { status: 500 }
    )
  }
}