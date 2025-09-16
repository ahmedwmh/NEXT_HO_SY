import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - تحويل مسودة إلى زيارة مكتملة
export async function POST(request: NextRequest) {
  try {
    const { draftId } = await request.json()

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    // Get the draft with all related data
    const draft = await prisma.visitDraft.findUnique({
      where: { id: draftId },
      include: {
        draftTests: true,
        draftDiseases: true,
        draftTreatments: true,
        draftOperations: true,
        draftMedications: true
      }
    })

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!draft.patientId || !draft.scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields for completion' },
        { status: 400 }
      )
    }

    // Create the completed visit
    const visit = await prisma.visit.create({
      data: {
        patientId: draft.patientId,
        doctorId: draft.doctorId,
        hospitalId: draft.hospitalId,
        scheduledAt: draft.scheduledAt,
        status: 'COMPLETED',
        notes: draft.notes,
        diagnosis: draft.diagnosis,
        prescription: draft.prescription,
        symptoms: draft.symptoms,
        vitalSigns: draft.vitalSigns,
        temperature: draft.temperature,
        bloodPressure: draft.bloodPressure,
        heartRate: draft.heartRate,
        weight: draft.weight,
        height: draft.height,
        images: draft.images
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
                name: true
              }
            }
          }
        }
      }
    })

    // Convert draft records to actual records
    await Promise.all([
      // Convert tests
      draft.draftTests.length > 0 && prisma.test.createMany({
        data: draft.draftTests.map(test => ({
          patientId: draft.patientId,
          doctorId: draft.doctorId!,
          hospitalId: draft.hospitalId!,
          visitId: visit.id,
          name: test.name,
          description: test.description,
          scheduledAt: test.scheduledAt,
          status: test.status,
          results: test.results,
          notes: test.notes,
          images: test.images
        }))
      }),

      // Convert diseases
      draft.draftDiseases.length > 0 && prisma.disease.createMany({
        data: draft.draftDiseases.map(disease => ({
          patientId: draft.patientId,
          name: disease.name,
          description: disease.description,
          diagnosedAt: disease.diagnosedAt,
          severity: disease.severity,
          status: disease.status,
          notes: disease.notes
        }))
      }),

      // Convert treatments
      draft.draftTreatments.length > 0 && prisma.treatment.createMany({
        data: draft.draftTreatments.map(treatment => ({
          patientId: draft.patientId,
          doctorId: draft.doctorId!,
          hospitalId: draft.hospitalId!,
          visitId: visit.id,
          name: treatment.name,
          description: treatment.description,
          scheduledAt: treatment.scheduledAt,
          status: treatment.status,
          notes: treatment.notes,
          images: treatment.images
        }))
      }),

      // Convert operations
      draft.draftOperations.length > 0 && prisma.operation.createMany({
        data: draft.draftOperations.map(operation => ({
          patientId: draft.patientId,
          doctorId: draft.doctorId!,
          hospitalId: draft.hospitalId!,
          visitId: visit.id,
          name: operation.name,
          description: operation.description,
          scheduledAt: operation.scheduledAt,
          status: operation.status,
          notes: operation.notes,
          images: operation.images
        }))
      }),

      // Convert medications
      draft.draftMedications.length > 0 && prisma.medication.createMany({
        data: draft.draftMedications.map(medication => ({
          patientId: draft.patientId,
          doctorId: draft.doctorId!,
          visitId: visit.id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          duration: medication.duration,
          instructions: medication.instructions,
          startDate: medication.startDate,
          endDate: medication.endDate,
          status: medication.status,
          notes: medication.notes
        }))
      })
    ])

    // Delete the draft
    await prisma.visitDraft.delete({
      where: { id: draftId }
    })

    return NextResponse.json({
      success: true,
      data: visit,
      message: 'Draft completed successfully and converted to visit'
    })
  } catch (error) {
    console.error('Error completing visit draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete visit draft' },
      { status: 500 }
    )
  }
}
