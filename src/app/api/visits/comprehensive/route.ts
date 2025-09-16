import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      patientId,
      scheduledAt,
      symptoms,
      notes,
      diagnosis,
      doctorId,
      hospitalId,
      cityId,
      status = 'DRAFT',
      tests = [],
      treatments = [],
      operations = [],
      medications = [],
      currentStep = 1
    } = data

    console.log('🏥 Comprehensive Visit API: Creating visit with data:', {
      patientId,
      doctorId,
      hospitalId,
      status,
      testsCount: tests.length,
      treatmentsCount: treatments.length,
      operationsCount: operations.length,
      medicationsCount: medications.length
    })

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'معرف المريض مطلوب' },
        { status: 400 }
      )
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'تاريخ ووقت الزيارة مطلوب' },
        { status: 400 }
      )
    }

    // Create visit with basic data first
    const visit = await prisma.visit.create({
      data: {
        patientId,
        doctorId: doctorId || null,
        hospitalId: hospitalId || null,
        cityId: cityId || null,
        scheduledAt: new Date(scheduledAt),
        status: status as any,
        notes: notes || '',
        diagnosis: diagnosis || '',
        symptoms: symptoms || '',
        currentStep: currentStep
      }
    })

    // If this is a complete visit, add related data
    if (status === 'COMPLETED' && tests && tests.length > 0) {
      await prisma.test.createMany({
        data: tests.map((test: any) => ({
          visitId: visit.id,
          patientId,
          doctorId: doctorId || 'temp-doctor',
          hospitalId: hospitalId || 'temp-hospital',
          name: test.name,
          description: test.description || '',
          scheduledAt: new Date(test.scheduledAt),
          results: test.results || null,
          notes: test.notes || null
        }))
      })
    }

    if (status === 'COMPLETED' && treatments && treatments.length > 0) {
      await prisma.treatment.createMany({
        data: treatments.map((treatment: any) => ({
          visitId: visit.id,
          patientId,
          doctorId: doctorId || 'temp-doctor',
          hospitalId: hospitalId || 'temp-hospital',
          name: treatment.name,
          description: treatment.description || '',
          scheduledAt: new Date(treatment.scheduledAt),
          notes: treatment.notes || null
        }))
      })
    }

    if (status === 'COMPLETED' && operations && operations.length > 0) {
      await prisma.operation.createMany({
        data: operations.map((operation: any) => ({
          visitId: visit.id,
          patientId,
          doctorId: doctorId || 'temp-doctor',
          hospitalId: hospitalId || 'temp-hospital',
          name: operation.name,
          description: operation.description || '',
          scheduledAt: new Date(operation.scheduledAt),
          notes: operation.notes || null
        }))
      })
    }

    if (status === 'COMPLETED' && medications && medications.length > 0) {
      await prisma.medication.createMany({
        data: medications.map((medication: any) => ({
          visitId: visit.id,
          patientId,
          doctorId: doctorId || 'temp-doctor',
          hospitalId: hospitalId || 'temp-hospital',
          name: medication.name,
          dosage: medication.dosage || '',
          instructions: medication.instructions || '',
          startDate: new Date(medication.startDate),
          endDate: medication.endDate ? new Date(medication.endDate) : null
        }))
      })
    }

    // Fetch the complete visit with relations
    const completeVisit = await prisma.visit.findUnique({
      where: { id: visit.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
        tests: true,
        treatments: true,
        operations: true,
        medications: true
      }
    })

    console.log('✅ Visit created successfully:', completeVisit?.id)

    return NextResponse.json({
      success: true,
      data: completeVisit
    })
  } catch (error) {
    console.error('خطأ في إنشاء الزيارة الشاملة:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الزيارة الشاملة' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      id,
      patientId,
      scheduledAt,
      symptoms,
      notes,
      diagnosis,
      doctorId,
      hospitalId,
      cityId,
      status = 'DRAFT',
      tests = [],
      treatments = [],
      operations = [],
      medications = [],
      currentStep = 1
    } = data

    console.log('🏥 Comprehensive Visit API: Updating visit with data:', {
      id,
      patientId,
      doctorId,
      hospitalId,
      status,
      testsCount: tests.length,
      treatmentsCount: treatments.length,
      operationsCount: operations.length,
      medicationsCount: medications.length
    })

    // Update visit basic info
    const visit = await prisma.visit.update({
      where: { id },
      data: {
        doctorId: doctorId || null,
        hospitalId: hospitalId || null,
        cityId: cityId || null,
        scheduledAt: new Date(scheduledAt),
        status: status as any,
        notes: notes || '',
        diagnosis: diagnosis || '',
        symptoms: symptoms || '',
        currentStep: currentStep
      }
    })

    // If this is a complete visit, add related data
    if (status === 'COMPLETED') {
      // Delete existing related data
      await prisma.test.deleteMany({ where: { patientId } })
      await prisma.treatment.deleteMany({ where: { patientId } })
      await prisma.operation.deleteMany({ where: { patientId } })
      await prisma.medication.deleteMany({ where: { patientId } })

      // Add new related data
      if (tests && tests.length > 0) {
        await prisma.test.createMany({
          data: tests.map((test: any) => ({
            patientId,
            doctorId: doctorId || '',
            hospitalId: hospitalId || '',
            name: test.name,
            description: test.description || '',
            scheduledAt: new Date(test.scheduledAt),
            results: test.results || null,
            notes: test.notes || null
          }))
        })
      }

      if (treatments && treatments.length > 0) {
        await prisma.treatment.createMany({
          data: treatments.map((treatment: any) => ({
            patientId,
            doctorId: doctorId || '',
            hospitalId: hospitalId || '',
            name: treatment.name,
            description: treatment.description || '',
            scheduledAt: new Date(treatment.scheduledAt),
            notes: treatment.notes || null
          }))
        })
      }

      if (operations && operations.length > 0) {
        await prisma.operation.createMany({
          data: operations.map((operation: any) => ({
            patientId,
            doctorId: doctorId || '',
            hospitalId: hospitalId || '',
            name: operation.name,
            description: operation.description || '',
            scheduledAt: new Date(operation.scheduledAt),
            notes: operation.notes || null
          }))
        })
      }

      if (medications && medications.length > 0) {
        await prisma.medication.createMany({
          data: medications.map((medication: any) => ({
            patientId,
            doctorId: doctorId || '',
            hospitalId: hospitalId || '',
            name: medication.name,
            dosage: medication.dosage || '',
            instructions: medication.instructions || '',
            startDate: new Date(medication.startDate),
            endDate: medication.endDate ? new Date(medication.endDate) : null
          }))
        })
      }
    }

    // Fetch the complete visit with relations
    const completeVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
        tests: true,
        treatments: true,
        operations: true,
        medications: true
      }
    })

    console.log('✅ Visit updated successfully:', completeVisit?.id)

    return NextResponse.json({
      success: true,
      data: completeVisit
    })
  } catch (error) {
    console.error('خطأ في تحديث الزيارة الشاملة:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الزيارة الشاملة' },
      { status: 500 }
    )
  }
}