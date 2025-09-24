import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { action, quantity } = await request.json()

    if (!action || !['reserve', 'deliver', 'unreserve', 'undeliver'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: reserve, deliver, unreserve, or undeliver' },
        { status: 400 }
      )
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    // Get the treatment course
    const course = await prisma.treatmentCourse.findUnique({
      where: { id },
      include: {
        hospitalTreatment: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Treatment course not found' },
        { status: 404 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      let updatedCourse
      let inventoryUpdate

      switch (action) {
        case 'reserve':
          // Check if there's enough available quantity
          const availableForReserve = (course.hospitalTreatment.quantity || 0) - 
                                    (course.hospitalTreatment.reservedQuantity || 0) - 
                                    (course.hospitalTreatment.deliveredQuantity || 0)
          
          if (availableForReserve < quantity) {
            throw new Error(`Insufficient quantity for reservation. Available: ${availableForReserve}, Requested: ${quantity}`)
          }

          updatedCourse = await tx.treatmentCourse.update({
            where: { id },
            data: {
              reservedQuantity: {
                increment: quantity
              },
              isReserved: true,
              status: 'RESERVED'
            }
          })

          inventoryUpdate = await tx.hospitalTreatment.update({
            where: { id: course.hospitalTreatmentId },
            data: {
              reservedQuantity: {
                increment: quantity
              }
            }
          })
          break

        case 'deliver':
          // Check if there's enough reserved quantity
          if ((course.reservedQuantity || 0) < quantity) {
            throw new Error(`Insufficient reserved quantity for delivery. Reserved: ${course.reservedQuantity || 0}, Requested: ${quantity}`)
          }

          updatedCourse = await tx.treatmentCourse.update({
            where: { id },
            data: {
              deliveredQuantity: {
                increment: quantity
              },
              reservedQuantity: {
                decrement: quantity
              },
              isDelivered: true,
              status: 'DELIVERED'
            }
          })

          inventoryUpdate = await tx.hospitalTreatment.update({
            where: { id: course.hospitalTreatmentId },
            data: {
              deliveredQuantity: {
                increment: quantity
              },
              reservedQuantity: {
                decrement: quantity
              }
            }
          })
          break

        case 'unreserve':
          // Check if there's enough reserved quantity to unreserve
          if ((course.reservedQuantity || 0) < quantity) {
            throw new Error(`Insufficient reserved quantity to unreserve. Reserved: ${course.reservedQuantity || 0}, Requested: ${quantity}`)
          }

          updatedCourse = await tx.treatmentCourse.update({
            where: { id },
            data: {
              reservedQuantity: {
                decrement: quantity
              },
              isReserved: course.reservedQuantity === quantity ? false : true,
              status: course.reservedQuantity === quantity ? 'CREATED' : 'RESERVED'
            }
          })

          inventoryUpdate = await tx.hospitalTreatment.update({
            where: { id: course.hospitalTreatmentId },
            data: {
              reservedQuantity: {
                decrement: quantity
              }
            }
          })
          break

        case 'undeliver':
          // Check if there's enough delivered quantity to undeliver
          if ((course.deliveredQuantity || 0) < quantity) {
            throw new Error(`Insufficient delivered quantity to undeliver. Delivered: ${course.deliveredQuantity || 0}, Requested: ${quantity}`)
          }

          updatedCourse = await tx.treatmentCourse.update({
            where: { id },
            data: {
              deliveredQuantity: {
                decrement: quantity
              },
              reservedQuantity: {
                increment: quantity
              },
              isDelivered: course.deliveredQuantity === quantity ? false : true,
              status: 'RESERVED'
            }
          })

          inventoryUpdate = await tx.hospitalTreatment.update({
            where: { id: course.hospitalTreatmentId },
            data: {
              deliveredQuantity: {
                decrement: quantity
              },
              reservedQuantity: {
                increment: quantity
              }
            }
          })
          break
      }

      return { updatedCourse, inventoryUpdate }
    })

    return NextResponse.json({
      success: true,
      data: result.updatedCourse,
      message: `Treatment course ${action} updated successfully`
    })
  } catch (error) {
    console.error('Error updating treatment course status:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update treatment course status' 
      },
      { status: 500 }
    )
  }
}
