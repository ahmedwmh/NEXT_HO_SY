import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (patientId) {
      where.patientId = patientId
    }
    
    if (status) {
      where.status = status
    }

    const [courses, total] = await Promise.all([
      prisma.treatmentCourse.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientNumber: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true
            }
          },
          hospital: {
            select: {
              id: true,
              name: true
            }
          },
          hospitalTreatment: {
            select: {
              id: true,
              name: true,
              category: true,
              quantity: true,
              expiredate: true
            }
          },
          doses: {
            orderBy: {
              doseNumber: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.treatmentCourse.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching treatment courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatment courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      patientId,
      doctorId,
      hospitalId,
      hospitalTreatmentId,
      courseName,
      description,
      totalQuantity,
      reservedQuantity = 0,
      deliveredQuantity = 0,
      availableInStock = 0,
      startDate,
      endDate,
      status = 'CREATED',
      isReserved = false,
      isDelivered = false,
      instructions,
      notes,
      doses
    } = data

    if (!patientId || !doctorId || !hospitalId || !hospitalTreatmentId || !courseName || !totalQuantity) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // Check if hospital treatment exists and has enough quantity
    const hospitalTreatment = await prisma.hospitalTreatment.findUnique({
      where: { id: hospitalTreatmentId }
    })

    if (!hospitalTreatment) {
      return NextResponse.json(
        { error: 'Hospital treatment not found' },
        { status: 404 }
      )
    }

    // Calculate available quantity (total - reserved - delivered)
    const availableQuantity = (hospitalTreatment.quantity || 0) - 
                             (hospitalTreatment.reservedQuantity || 0) - 
                             (hospitalTreatment.deliveredQuantity || 0)

    if (availableQuantity < totalQuantity) {
      return NextResponse.json(
        { 
          error: `Insufficient quantity in hospital inventory. Available: ${availableQuantity}, Required: ${totalQuantity}`,
          availableQuantity,
          requiredQuantity: totalQuantity
        },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create treatment course
      const course = await tx.treatmentCourse.create({
        data: {
          patientId,
          doctorId,
          hospitalId,
          hospitalTreatmentId,
          courseName,
          description,
          totalQuantity,
          reservedQuantity,
          deliveredQuantity,
          remainingQuantity: totalQuantity - deliveredQuantity,
          availableInStock: availableQuantity - totalQuantity,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          status: status as any,
          isReserved,
          isDelivered,
          instructions,
          notes
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientNumber: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true
            }
          },
          hospital: {
            select: {
              id: true,
              name: true
            }
          },
          hospitalTreatment: {
            select: {
              id: true,
              name: true,
              category: true,
              quantity: true,
              expiredate: true
            }
          }
        }
      })

      // Update hospital treatment inventory
      await tx.hospitalTreatment.update({
        where: { id: hospitalTreatmentId },
        data: {
          reservedQuantity: {
            increment: reservedQuantity
          },
          deliveredQuantity: {
            increment: deliveredQuantity
          }
        }
      })

      return course
    })

    // Create doses if provided
    if (doses && Array.isArray(doses)) {
      await prisma.treatmentDose.createMany({
        data: doses.map((dose: any, index: number) => ({
          courseId: result.id,
          doseNumber: index + 1,
          scheduledDate: new Date(dose.scheduledDate),
          scheduledTime: dose.scheduledTime,
          quantity: dose.quantity,
          status: dose.status || 'SCHEDULED',
          takenAt: dose.takenAt,
          takenDate: dose.takenDate ? new Date(dose.takenDate) : null,
          isTaken: dose.isTaken || false,
          isOnTime: dose.isOnTime || false,
          notes: dose.notes,
          sideEffects: dose.sideEffects,
          takenBy: dose.takenBy
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Treatment course created successfully'
    })
  } catch (error) {
    console.error('Error creating treatment course:', error)
    return NextResponse.json(
      { error: 'Failed to create treatment course' },
      { status: 500 }
    )
  }
}
