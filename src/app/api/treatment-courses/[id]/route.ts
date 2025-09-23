import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const course = await prisma.treatmentCourse.findUnique({
      where: { id },
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
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Treatment course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Error fetching treatment course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatment course' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const updatedCourse = await prisma.treatmentCourse.update({
      where: { id },
      data: {
        courseName: data.courseName,
        description: data.description,
        totalQuantity: data.totalQuantity,
        reservedQuantity: data.reservedQuantity,
        deliveredQuantity: data.deliveredQuantity,
        remainingQuantity: data.remainingQuantity,
        availableInStock: data.availableInStock,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        isReserved: data.isReserved,
        isDelivered: data.isDelivered,
        instructions: data.instructions,
        notes: data.notes
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
        },
        doses: {
          orderBy: {
            doseNumber: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Treatment course updated successfully'
    })
  } catch (error) {
    console.error('Error updating treatment course:', error)
    return NextResponse.json(
      { error: 'Failed to update treatment course' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Delete all doses first
    await prisma.treatmentDose.deleteMany({
      where: { courseId: id }
    })

    // Delete the course
    await prisma.treatmentCourse.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Treatment course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting treatment course:', error)
    return NextResponse.json(
      { error: 'Failed to delete treatment course' },
      { status: 500 }
    )
  }
}
