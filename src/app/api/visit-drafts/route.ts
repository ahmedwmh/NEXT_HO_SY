import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب مسودات الزيارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status') || 'DRAFT'
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = parseInt(searchParams.get('skip') || '0')

    const whereClause: any = {}
    if (patientId) whereClause.patientId = patientId
    if (status) whereClause.status = status

    const drafts = await prisma.visitDraft.findMany({
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
                name: true
              }
            }
          }
        },
        draftTests: true,
        draftDiseases: true,
        draftTreatments: true,
        draftOperations: true,
        draftMedications: true
      },
      orderBy: { lastSavedAt: 'desc' },
      skip,
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: drafts,
      count: drafts.length
    })
  } catch (error) {
    console.error('Error fetching visit drafts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visit drafts' },
      { status: 500 }
    )
  }
}

// POST - إنشاء أو تحديث مسودة زيارة
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      id,
      patientId,
      doctorId,
      hospitalId,
      scheduledAt,
      notes,
      diagnosis,
      prescription,
      symptoms,
      vitalSigns,
      temperature,
      bloodPressure,
      heartRate,
      weight,
      height,
      images = [],
      currentStep = 1,
      isCompleted = false,
      autoSaveEnabled = true,
      tests = [],
      diseases = [],
      treatments = [],
      operations = [],
      medications = []
    } = data

    // Validation
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Scheduled date is required' },
        { status: 400 }
      )
    }

    const visitDraftData = {
      patientId,
      doctorId: doctorId || null,
      hospitalId: hospitalId || null,
      scheduledAt: new Date(scheduledAt),
      notes: notes || null,
      diagnosis: diagnosis || null,
      prescription: prescription || null,
      symptoms: symptoms || null,
      vitalSigns: vitalSigns || null,
      temperature: temperature || null,
      bloodPressure: bloodPressure || null,
      heartRate: heartRate || null,
      weight: weight || null,
      height: height || null,
      images,
      currentStep,
      isCompleted,
      autoSaveEnabled,
      lastSavedAt: new Date()
    }

    let visitDraft

    if (id) {
      // Update existing draft
      visitDraft = await prisma.visitDraft.update({
        where: { id },
        data: visitDraftData,
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
                  name: true
                }
              }
            }
          },
          draftTests: true,
          draftDiseases: true,
          draftTreatments: true,
          draftOperations: true,
          draftMedications: true
        }
      })

      // Update related records
      await updateDraftRelatedRecords(id, { tests, diseases, treatments, operations, medications })
    } else {
      // Create new draft
      visitDraft = await prisma.visitDraft.create({
        data: visitDraftData,
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
                  name: true
                }
              }
            }
          },
          draftTests: true,
          draftDiseases: true,
          draftTreatments: true,
          draftOperations: true,
          draftMedications: true
        }
      })

      // Create related records
      await createDraftRelatedRecords(visitDraft.id, { tests, diseases, treatments, operations, medications })
    }

    return NextResponse.json({
      success: true,
      data: visitDraft,
      message: id ? 'Draft updated successfully' : 'Draft created successfully'
    }, { status: id ? 200 : 201 })
  } catch (error) {
    console.error('Error saving visit draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save visit draft' },
      { status: 500 }
    )
  }
}

// DELETE - حذف مسودة زيارة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    await prisma.visitDraft.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting visit draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete visit draft' },
      { status: 500 }
    )
  }
}

// Helper function to update related records
async function updateDraftRelatedRecords(draftId: string, records: any) {
  const { tests, diseases, treatments, operations, medications } = records

  // Delete existing records
  await Promise.all([
    prisma.visitDraftTest.deleteMany({ where: { draftId } }),
    prisma.visitDraftDisease.deleteMany({ where: { draftId } }),
    prisma.visitDraftTreatment.deleteMany({ where: { draftId } }),
    prisma.visitDraftOperation.deleteMany({ where: { draftId } }),
    prisma.visitDraftMedication.deleteMany({ where: { draftId } })
  ])

  // Create new records
  await createDraftRelatedRecords(draftId, records)
}

// Helper function to create related records
async function createDraftRelatedRecords(draftId: string, records: any) {
  const { tests, diseases, treatments, operations, medications } = records

  await Promise.all([
    // Create tests
    tests.length > 0 && prisma.visitDraftTest.createMany({
      data: tests.map((test: any) => ({
        draftId,
        name: test.name,
        description: test.description || null,
        scheduledAt: new Date(test.scheduledAt || new Date()),
        status: test.status || 'SCHEDULED',
        results: test.results || null,
        notes: test.notes || null,
        images: test.images || []
      }))
    }),

    // Create diseases
    diseases.length > 0 && prisma.visitDraftDisease.createMany({
      data: diseases.map((disease: any) => ({
        draftId,
        name: disease.name,
        description: disease.description || null,
        diagnosedAt: new Date(disease.diagnosedAt || new Date()),
        severity: disease.severity || null,
        status: disease.status || null,
        notes: disease.notes || null
      }))
    }),

    // Create treatments
    treatments.length > 0 && prisma.visitDraftTreatment.createMany({
      data: treatments.map((treatment: any) => ({
        draftId,
        name: treatment.name,
        description: treatment.description || null,
        scheduledAt: new Date(treatment.scheduledAt || new Date()),
        status: treatment.status || 'SCHEDULED',
        notes: treatment.notes || null,
        images: treatment.images || []
      }))
    }),

    // Create operations
    operations.length > 0 && prisma.visitDraftOperation.createMany({
      data: operations.map((operation: any) => ({
        draftId,
        name: operation.name,
        description: operation.description || null,
        scheduledAt: new Date(operation.scheduledAt || new Date()),
        status: operation.status || 'SCHEDULED',
        notes: operation.notes || null,
        images: operation.images || []
      }))
    }),

    // Create medications
    medications.length > 0 && prisma.visitDraftMedication.createMany({
      data: medications.map((medication: any) => ({
        draftId,
        name: medication.name,
        dosage: medication.dosage || null,
        frequency: medication.frequency || null,
        duration: medication.duration || null,
        instructions: medication.instructions || null,
        startDate: new Date(medication.startDate || new Date()),
        endDate: medication.endDate ? new Date(medication.endDate) : null,
        status: medication.status || null,
        notes: medication.notes || null
      }))
    })
  ])
}
