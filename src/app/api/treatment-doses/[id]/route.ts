import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const updatedDose = await prisma.treatmentDose.update({
      where: { id },
      data: {
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        scheduledTime: data.scheduledTime,
        quantity: data.quantity,
        status: data.status,
        takenAt: data.takenAt,
        takenDate: data.takenDate ? new Date(data.takenDate) : undefined,
        isTaken: data.isTaken,
        isOnTime: data.isOnTime,
        notes: data.notes,
        sideEffects: data.sideEffects,
        takenBy: data.takenBy
      },
      include: {
        course: {
          select: {
            id: true,
            courseName: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
                patientNumber: true
              }
            }
          }
        }
      }
    })

    // Update course status based on dose status
    if (data.status === 'TAKEN') {
      const course = await prisma.treatmentCourse.findUnique({
        where: { id: updatedDose.courseId },
        include: {
          doses: true
        }
      })

      if (course) {
        const takenDoses = course.doses.filter(d => d.status === 'TAKEN').length
        const totalDoses = course.doses.length

        let newStatus = course.status
        if (takenDoses === totalDoses) {
          newStatus = 'COMPLETED'
        } else if (takenDoses > 0) {
          newStatus = 'IN_PROGRESS'
        }

        if (newStatus !== course.status) {
          await prisma.treatmentCourse.update({
            where: { id: course.id },
            data: { status: newStatus }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedDose,
      message: 'Treatment dose updated successfully'
    })
  } catch (error) {
    console.error('Error updating treatment dose:', error)
    return NextResponse.json(
      { error: 'Failed to update treatment dose' },
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

    await prisma.treatmentDose.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Treatment dose deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting treatment dose:', error)
    return NextResponse.json(
      { error: 'Failed to delete treatment dose' },
      { status: 500 }
    )
  }
}
