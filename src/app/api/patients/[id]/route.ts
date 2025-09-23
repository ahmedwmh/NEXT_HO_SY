import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        city: {
          select: {
            id: true,
            name: true
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
        visits: {
          include: {
            doctor: {
              select: {
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
                description: true,
                status: true
              }
            },
            treatments: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true
              }
            },
            operations: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true
              }
            },
            medications: {
              select: {
                id: true,
                name: true,
                dosage: true,
                frequency: true,
                duration: true,
                instructions: true
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        },
        tests: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        },
        treatments: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        },
        operations: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        },
        medications: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        diseases: {
          orderBy: {
            diagnosedAt: 'desc'
          }
        },
        images: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'المريض غير موجود' },
        { status: 404 }
      )
    }

    // Get diseases for each visit
    const visitsWithDiseases = await Promise.all(
      patient.visits.map(async (visit) => {
        const diseases = await prisma.disease.findMany({
          where: {
            patientId: patient.id,
            diagnosedAt: {
              gte: new Date(visit.scheduledAt.getTime() - 24 * 60 * 60 * 1000), // 24 hours before visit
              lte: new Date(visit.scheduledAt.getTime() + 24 * 60 * 60 * 1000)  // 24 hours after visit
            }
          },
          select: {
            id: true,
            name: true,
            description: true
          }
        })
        
        return {
          ...visit,
          diseases
        }
      })
    )

    const patientWithDiseases = {
      ...patient,
      visits: visitsWithDiseases
    }

    return NextResponse.json({
      success: true,
      data: patientWithDiseases
    })
  } catch (error) {
    console.error('خطأ في جلب بيانات المريض:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب بيانات المريض' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { cityId, hospitalId, ...patientData } = data

    // Check if city exists
    if (cityId) {
      const city = await prisma.city.findUnique({
        where: { id: cityId }
      })
      if (!city) {
        return NextResponse.json(
          { error: 'المدينة المحددة غير موجودة' },
          { status: 400 }
        )
      }
    }

    // Check if hospital exists
    if (hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId }
      })
      if (!hospital) {
        return NextResponse.json(
          { error: 'المستشفى المحدد غير موجود' },
          { status: 400 }
        )
      }
    }

    // Check if ID number already exists (if provided and different from current)
    if (patientData.idNumber && patientData.idNumber.trim()) {
      const existingPatient = await prisma.patient.findFirst({
        where: { 
          idNumber: patientData.idNumber.trim(),
          id: { not: params.id } // Exclude current patient
        }
      })
      
      if (existingPatient) {
        return NextResponse.json(
          { error: `رقم الهوية الوطنية ${patientData.idNumber} مستخدم بالفعل للمريض ${existingPatient.firstName} ${existingPatient.lastName} (${existingPatient.patientNumber})` },
          { status: 409 }
        )
      }
    }

    // Process allergies field if it's an array
    const processedPatientData = {
      ...patientData,
      allergies: Array.isArray(patientData.allergies) 
        ? patientData.allergies.join(', ') 
        : patientData.allergies
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...processedPatientData,
        cityId,
        hospitalId
      },
      include: {
        city: {
          select: {
            id: true,
            name: true
          }
        },
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error('خطأ في تحديث المريض:', error)
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'البيانات المدخلة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في تحديث المريض' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.patient.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف المريض بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المريض:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المريض' },
      { status: 500 }
    )
  }
}