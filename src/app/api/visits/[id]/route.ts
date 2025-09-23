import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const visitId = params.id

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
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
            name: true,
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tests: {
          select: {
            id: true,
            name: true,
            status: true,
            results: true,
            scheduledAt: true,
            description: true,
            notes: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        treatments: {
          select: {
            id: true,
            name: true,
            status: true,
            scheduledAt: true,
            description: true,
            notes: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        operations: {
          select: {
            id: true,
            name: true,
            status: true,
            scheduledAt: true,
            description: true,
            notes: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        medications: {
          select: {
            id: true,
            name: true,
            status: true,
            dosage: true,
            frequency: true,
            duration: true,
            instructions: true,
            startDate: true,
            endDate: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!visit) {
      return NextResponse.json(
        { success: false, error: 'الزيارة غير موجودة' },
        { status: 404 }
      )
    }

    // Fetch diseases and treatment courses separately
    const [diseases, treatmentCourses] = await Promise.all([
      // Fetch diseases for this patient around the visit date
      prisma.disease.findMany({
        where: {
          patientId: visit.patientId,
          diagnosedAt: {
            gte: new Date(new Date(visit.scheduledAt).getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(new Date(visit.scheduledAt).getTime() + 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          diagnosedAt: true,
          severity: true,
          status: true,
          notes: true
        }
      }),
      // Fetch treatment courses for this patient
      prisma.treatmentCourse.findMany({
        where: {
          patientId: visit.patientId,
          doctorId: visit.doctorId || undefined,
          hospitalId: visit.hospitalId || undefined
        },
        include: {
          hospitalTreatment: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          doses: true
        }
      })
    ])

    // Add diseases and treatment courses to the visit data
    const visitWithRelatedData = {
      ...visit,
      diseases,
      treatmentCourses
    }

    return NextResponse.json({
      success: true,
      data: visitWithRelatedData
    })
  } catch (error) {
    console.error('خطأ في جلب الزيارة:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الزيارة' },
      { status: 500 }
    )
  }
}
