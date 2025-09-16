import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit
    const patientId = searchParams.get('patientId')

    const whereClause = patientId ? { patientId } : {}

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where: whereClause,
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
          city: {
            select: {
              id: true,
              name: true
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
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.visit.count({ where: whereClause })
    ])

    return NextResponse.json({
      data: visits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('❌ خطأ في جلب الزيارات:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { error: 'فشل في جلب الزيارات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return handleVisitRequest(request, false)
}

export async function PUT(request: NextRequest) {
  return handleVisitRequest(request, true)
}

async function handleVisitRequest(request: NextRequest, isUpdate: boolean) {
  try {
    const data = await request.json()
    
    console.log(`🏥 ===== VISITS API: ${isUpdate ? 'PUT' : 'POST'} REQUEST =====`)
    console.log('📊 Request data:', JSON.stringify(data, null, 2))
    console.log('🔍 Has Patient ID:', !!data.patientId)
    console.log('🔍 Has Doctor ID:', !!data.doctorId)
    console.log('🔍 Has Hospital ID:', !!data.hospitalId)
    console.log('🔍 Has City ID:', !!data.cityId)
    console.log('🔍 Has Current Step:', !!data.currentStep)
    console.log('📅 Scheduled At:', data.scheduledAt)
    console.log('📊 Status:', data.status)
    console.log('📝 Notes:', data.notes)
    console.log('🔬 Diagnosis:', data.diagnosis)
    console.log('🤒 Symptoms:', data.symptoms)
    console.log('🔄 Is Update:', isUpdate || !!data.id)
    console.log('🧪 Tests Count:', data.tests?.length || 0)
    console.log('🧪 Tests Data:', JSON.stringify(data.tests, null, 2))
    
    console.log('🔍 Full request data:', JSON.stringify(data, null, 2))
    
    // Validate required fields
    if (!data.patientId) {
      return NextResponse.json(
        { error: 'معرف المريض مطلوب' },
        { status: 400 }
      )
    }

    if (!data.scheduledAt) {
      return NextResponse.json(
        { error: 'تاريخ ووقت الزيارة مطلوب' },
        { status: 400 }
      )
    }

    // Create visit data with optional fields
    const visitData: any = {
      patientId: data.patientId,
      scheduledAt: new Date(data.scheduledAt),
      status: data.status || 'SCHEDULED',
      notes: data.notes || '',
      diagnosis: data.diagnosis || '',
      symptoms: data.symptoms || '',
      vitalSigns: data.vitalSigns || '',
      temperature: data.temperature || '',
      bloodPressure: data.bloodPressure || '',
      heartRate: data.heartRate || '',
      weight: data.weight || '',
      height: data.height || ''
    }
    
    // Add tests data if provided
    const testsData = data.tests || []
    const diseasesData = data.diseases || []
    const treatmentsData = data.treatments || []
    const operationsData = data.operations || []
    const medicationsData = data.medications || []

    console.log('📝 ===== VISIT DATA CREATED =====')
    console.log('📊 Visit data:', JSON.stringify(visitData, null, 2))
    console.log('🧪 Tests data count:', testsData.length)
    console.log('🧪 Tests data:', JSON.stringify(testsData, null, 2))
    console.log('🦠 Diseases data count:', diseasesData.length)
    console.log('💊 Treatments data count:', treatmentsData.length)
    console.log('🏥 Operations data count:', operationsData.length)
    console.log('💉 Medications data count:', medicationsData.length)

    // Add optional fields if they exist and are valid
    if (data.doctorId && data.doctorId !== '') {
      visitData.doctorId = data.doctorId
    }
    if (data.hospitalId && data.hospitalId !== '') {
      visitData.hospitalId = data.hospitalId
    }
    if (data.cityId && data.cityId !== '') {
      visitData.cityId = data.cityId
    }
    if (data.currentStep) {
      visitData.currentStep = data.currentStep
    }

    let visit

    // Check if this is an update (has ID or isUpdate flag) or create new
    if (data.id || isUpdate) {
      console.log('🔄 ===== UPDATING EXISTING VISIT =====')
      console.log('🔍 Visit ID to update:', data.id)
      console.log('📝 Visit data for update:', JSON.stringify(visitData, null, 2))
      console.log('🧪 Tests to create:', testsData.length, 'items')
      console.log('🧪 Tests data for creation:', JSON.stringify(testsData, null, 2))
      
      if (testsData.length > 0 && (!data.doctorId || !data.hospitalId)) {
        console.log('⚠️ Skipping tests creation - missing doctorId or hospitalId')
        console.log('👨‍⚕️ Doctor ID:', data.doctorId)
        console.log('🏥 Hospital ID:', data.hospitalId)
      }
      
      // Update existing visit with tests
      visit = await prisma.visit.update({
        where: { id: data.id },
        data: {
          ...visitData,
          tests: {
            deleteMany: {}, // Delete existing tests
            create: (data.doctorId && data.hospitalId) ? testsData.map((test: any) => ({
              name: test.name,
              description: test.description || '',
              scheduledAt: new Date(test.scheduledAt || new Date()),
              status: 'SCHEDULED',
              patientId: data.patientId,
              doctorId: data.doctorId,
              hospitalId: data.hospitalId
            })) : []
          }
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
              name: true,
              city: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          city: {
            select: {
              id: true,
              name: true
            }
          },
          tests: {
            select: {
              id: true,
              name: true,
              description: true,
              scheduledAt: true,
              status: true
            }
          }
        }
      })

      console.log('✅ ===== VISIT UPDATED SUCCESSFULLY =====')
      console.log('🔍 Visit ID:', visit.id)
      console.log('📊 Status:', visit.status)
      console.log('📅 Scheduled At:', visit.scheduledAt)
      console.log('📝 Notes:', visit.notes)
      console.log('🔬 Diagnosis:', visit.diagnosis)
      console.log('🤒 Symptoms:', visit.symptoms)
      console.log('👨‍⚕️ Has Doctor:', !!visit.doctor)
      console.log('🏥 Has Hospital:', !!visit.hospital)
      console.log('🏙️ Has City:', !!visit.city)
      console.log('🧪 Tests Count:', visit.tests?.length || 0)
      console.log('🧪 Tests Data:', JSON.stringify(visit.tests, null, 2))
    } else {
      console.log('🆕 Visits API: Creating new visit with data:', visitData)
      console.log('📝 Visit data for create:', JSON.stringify(visitData, null, 2))
      
      if (testsData.length > 0 && (!data.doctorId || !data.hospitalId)) {
        console.log('⚠️ Skipping tests creation - missing doctorId or hospitalId')
        console.log('👨‍⚕️ Doctor ID:', data.doctorId)
        console.log('🏥 Hospital ID:', data.hospitalId)
      }

      // Create new visit with tests
      visit = await prisma.visit.create({
        data: {
          ...visitData,
          tests: {
            create: (data.doctorId && data.hospitalId) ? testsData.map((test: any) => ({
              name: test.name,
              description: test.description || '',
              scheduledAt: new Date(test.scheduledAt || new Date()),
              status: 'SCHEDULED',
              patientId: data.patientId,
              doctorId: data.doctorId,
              hospitalId: data.hospitalId
            })) : []
          }
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
              name: true,
              city: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          city: {
            select: {
              id: true,
              name: true
            }
          },
          tests: {
            select: {
              id: true,
              name: true,
              description: true,
              scheduledAt: true,
              status: true
            }
          }
        }
      })

      console.log('✅ Visit created successfully:', {
        id: visit.id,
        status: visit.status,
        scheduledAt: visit.scheduledAt,
        notes: visit.notes,
        diagnosis: visit.diagnosis,
        symptoms: visit.symptoms,
        hasDoctor: !!visit.doctor,
        hasHospital: !!visit.hospital,
        hasCity: !!visit.city
      })
    }

    console.log('✅ Visits API: Visit operation completed successfully:', {
      id: visit.id,
      patientId: visit.patientId,
      status: visit.status,
      hasDoctor: !!visit.doctor,
      hasHospital: !!visit.hospital,
      hasCity: !!visit.city
    })
    
    console.log('📤 Final response data:', JSON.stringify(visit, null, 2))

    return NextResponse.json(visit, { status: (data.id || isUpdate) ? 200 : 201 })
  } catch (error) {
    console.error('❌ خطأ في إنشاء/تحديث الزيارة:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    console.error('❌ Full error details:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء/تحديث الزيارة' },
      { status: 500 }
    )
  }
}

