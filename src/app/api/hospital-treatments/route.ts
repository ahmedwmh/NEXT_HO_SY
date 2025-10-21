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

    const where: any = {
      // Only show treatments that have quantity and expiry date
      quantity: { gt: 0 },
      expiredate: { not: null },
      isActive: true
    }
    
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
          name: 'asc' // Sort by name to group duplicates together
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.hospitalTreatment.count({ where })
    ])

    // Add calculated available quantity to each treatment
    const treatmentsWithAvailability = treatments.map(treatment => ({
      ...treatment,
      reservedQuantity: treatment.reservedQuantity || 0,
      deliveredQuantity: treatment.deliveredQuantity || 0,
      availableQuantity: (treatment.quantity || 0) - (treatment.reservedQuantity || 0) - (treatment.deliveredQuantity || 0)
    }))

    // Remove duplicates based on name and hospital
    const uniqueTreatments = treatmentsWithAvailability.reduce((acc, treatment) => {
      const key = `${treatment.name}-${treatment.hospitalId}`
      if (!acc.find(t => `${t.name}-${t.hospitalId}` === key)) {
        acc.push(treatment)
      }
      return acc
    }, [] as typeof treatmentsWithAvailability)

    return NextResponse.json({
      success: true,
      data: uniqueTreatments,
      pagination: {
        page,
        limit,
        total: uniqueTreatments.length,
        pages: Math.ceil(uniqueTreatments.length / limit)
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
    const data = await request.json()

    // Handle both single treatment and array of treatments
    if (data.treatments && Array.isArray(data.treatments)) {
      // Multiple treatments creation (legacy support)
      const { hospitalId, treatments } = data

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
              quantity: treatment.quantity,
              expiredate: treatment.expiredate ? new Date(treatment.expiredate) : null,
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
    } else {
      // Single treatment creation
      const { hospitalId, name, description, category, duration, cost, quantity, expiredate } = data

      if (!hospitalId || !name) {
        return NextResponse.json(
          { error: 'Hospital ID and name are required' },
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

      // Create single treatment
      const createdTreatment = await prisma.hospitalTreatment.create({
        data: {
          hospitalId,
          name,
          description: description || '',
          category: category || '',
          duration: duration || '',
          cost: cost || 0,
          quantity: quantity || null,
          expiredate: expiredate ? new Date(expiredate) : null,
          isActive: true
        },
        include: {
          hospital: {
            include: {
              city: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: createdTreatment,
        message: 'Treatment created successfully'
      })
    }
  } catch (error) {
    console.error('Error creating hospital treatment:', error)
    return NextResponse.json(
      { error: 'Failed to create treatment' },
      { status: 500 }
    )
  }
}