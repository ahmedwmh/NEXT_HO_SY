import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب جميع الزيارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const hospitalId = searchParams.get('hospitalId')
    const doctorId = searchParams.get('doctorId')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const whereClause: any = {}
    
    if (status) {
      whereClause.status = status
    }
    if (patientId) {
      whereClause.patientId = patientId
    }
    if (hospitalId) {
      // Decode hospitalId if it's URL encoded and handle spaces
      const decodedHospitalId = decodeURIComponent(hospitalId).replace(/\+/g, ' ')
      whereClause.hospitalId = decodedHospitalId
      console.log('🔍 Hospital ID:', decodedHospitalId)
    }
    if (doctorId) {
      whereClause.doctorId = doctorId
    }
    
    if (search) {
      whereClause.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientNumber: { contains: search, mode: 'insensitive' } } },
        { doctor: { firstName: { contains: search, mode: 'insensitive' } } },
        { doctor: { lastName: { contains: search, mode: 'insensitive' } } },
        { hospital: { name: { contains: search, mode: 'insensitive' } } },
        { symptoms: { contains: search, mode: 'insensitive' } }
      ]
    }

    console.log('🔍 Where clause:', JSON.stringify(whereClause, null, 2))
    
    const [visitsBase, total] = await Promise.all([
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
              description: true, 
              status: true,
              results: true,
              scheduledAt: true
            }
          },
          treatments: {
            select: { 
              id: true, 
              name: true, 
              description: true, 
              status: true,
              scheduledAt: true
            }
          },
          operations: {
            select: { 
              id: true, 
              name: true, 
              description: true, 
              status: true,
              scheduledAt: true
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
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.visit.count({ where: whereClause })
    ])

    // Attach patient diseases to each visit (no direct relation in schema)
    let visits = visitsBase as any[]

    // Enrich with patient-level tests/treatments/operations/medications around the visit date (or linked by visitId)
    try {
      const dayMs = 24 * 60 * 60 * 1000
      const enriched = [] as any[]
      for (const v of visits) {
        // If relations already present with items, keep them; otherwise fetch by window
        const [testsExtra, treatmentsExtra, operationsExtra, medicationsExtra] = await Promise.all([
          (v.tests && v.tests.length > 0) ? Promise.resolve([]) : prisma.test.findMany({
            where: {
              patientId: v.patientId,
              OR: [
                { visitId: v.id },
                { scheduledAt: { gte: new Date(new Date(v.scheduledAt).getTime() - dayMs), lte: new Date(new Date(v.scheduledAt).getTime() + dayMs) } }
              ]
            },
            select: { id: true, name: true, description: true, status: true }
          }),
          (v.treatments && v.treatments.length > 0) ? Promise.resolve([]) : prisma.treatment.findMany({
            where: {
              patientId: v.patientId,
              OR: [
                { visitId: v.id },
                { scheduledAt: { gte: new Date(new Date(v.scheduledAt).getTime() - dayMs), lte: new Date(new Date(v.scheduledAt).getTime() + dayMs) } }
              ]
            },
            select: { id: true, name: true, description: true, status: true }
          }),
          (v.operations && v.operations.length > 0) ? Promise.resolve([]) : prisma.operation.findMany({
            where: {
              patientId: v.patientId,
              OR: [
                { visitId: v.id },
                { scheduledAt: { gte: new Date(new Date(v.scheduledAt).getTime() - dayMs), lte: new Date(new Date(v.scheduledAt).getTime() + dayMs) } }
              ]
            },
            select: { id: true, name: true, description: true, status: true }
          }),
          (v.medications && v.medications.length > 0) ? Promise.resolve([]) : prisma.medication.findMany({
            where: {
              patientId: v.patientId,
              OR: [
                { visitId: v.id },
                { startDate: { lte: new Date(new Date(v.scheduledAt).getTime() + dayMs) }, endDate: { gte: new Date(new Date(v.scheduledAt).getTime() - dayMs) } }
              ]
            },
            select: { id: true, name: true, dosage: true, frequency: true, duration: true, instructions: true }
          })
        ])

        enriched.push({
          ...v,
          tests: (v.tests && v.tests.length > 0) ? v.tests : testsExtra,
          treatments: (v.treatments && v.treatments.length > 0) ? v.treatments : treatmentsExtra,
          operations: (v.operations && v.operations.length > 0) ? v.operations : operationsExtra,
          medications: (v.medications && v.medications.length > 0) ? v.medications : medicationsExtra
        })
      }
      visits = enriched
    } catch (e) {
      console.error('Failed to attach related records to visits:', e)
    }

    return NextResponse.json({
      success: true,
      data: visits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الزيارات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء زيارة جديدة
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const visit = await prisma.visit.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        hospitalId: data.hospitalId,
        cityId: data.cityId,
        scheduledAt: new Date(data.scheduledAt),
        status: data.status || 'SCHEDULED',
        currentStep: data.currentStep || 1,
        notes: data.notes,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        vitalSigns: data.vitalSigns,
        temperature: data.temperature,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        weight: data.weight,
        height: data.height,
        images: data.images || []
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: visit
    })
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الزيارة' },
      { status: 500 }
    )
  }
}