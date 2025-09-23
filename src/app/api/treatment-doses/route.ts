import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (courseId) {
      where.courseId = courseId
    }
    
    if (status) {
      where.status = status
    }

    const doses = await prisma.treatmentDose.findMany({
      where,
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
      },
      orderBy: [
        { courseId: 'asc' },
        { doseNumber: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: doses
    })
  } catch (error) {
    console.error('Error fetching treatment doses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatment doses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      courseId,
      doseNumber,
      scheduledDate,
      scheduledTime,
      quantity,
      status = 'SCHEDULED',
      takenAt,
      takenDate,
      isTaken = false,
      isOnTime = false,
      notes,
      sideEffects,
      takenBy
    } = data

    if (!courseId || !doseNumber || !scheduledDate || !quantity) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const dose = await prisma.treatmentDose.create({
      data: {
        courseId,
        doseNumber,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        quantity,
        status: status as any,
        takenAt,
        takenDate: takenDate ? new Date(takenDate) : null,
        isTaken,
        isOnTime,
        notes,
        sideEffects,
        takenBy
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

    return NextResponse.json({
      success: true,
      data: dose,
      message: 'Treatment dose created successfully'
    })
  } catch (error) {
    console.error('Error creating treatment dose:', error)
    return NextResponse.json(
      { error: 'Failed to create treatment dose' },
      { status: 500 }
    )
  }
}
