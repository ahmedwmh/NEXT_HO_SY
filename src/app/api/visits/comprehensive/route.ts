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
      diseases = [],
      treatmentCourses = [],
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

    // Resolve hospital/doctor/city context robustly
    const extractId = (value?: string | null) => {
      if (!value) return null
      // If value looks like "name-someid" take the last segment
      if (value.includes('-')) {
        const parts = value.split('-')
        const last = parts[parts.length - 1]
        return last || value
      }
      return value
    }

    let normalizedHospitalId = extractId(hospitalId)

    // Verify hospital exists; if not, fall back to patient's hospital
    let hospitalRecord = normalizedHospitalId
      ? await prisma.hospital.findUnique({ where: { id: normalizedHospitalId } })
      : null

    if (!hospitalRecord) {
      const patient = await prisma.patient.findUnique({ where: { id: patientId } })
      if (patient) {
        normalizedHospitalId = patient.hospitalId
        hospitalRecord = await prisma.hospital.findUnique({ where: { id: patient.hospitalId } })
      }
    }

    // Determine city from hospital if not provided/valid
    const normalizedCityId = hospitalRecord?.cityId || cityId || null

    // Create visit with basic data first
    const visit = await prisma.visit.create({
      data: {
        patientId,
        doctorId: doctorId || null,
        hospitalId: normalizedHospitalId || null,
        cityId: normalizedCityId,
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
          hospitalId: normalizedHospitalId || 'temp-hospital',
          name: test.name,
          description: test.description || '',
          scheduledAt: new Date(test.scheduledAt || scheduledAt),
          results: test.results || null,
          notes: test.notes || null
        }))
      })
    }

    if (status === 'COMPLETED' && diseases && diseases.length > 0) {
      await prisma.disease.createMany({
        data: diseases.map((d: any) => ({
          patientId,
          name: d.name,
          description: d.description || '',
          diagnosedAt: new Date(d.diagnosedAt || scheduledAt),
          severity: d.severity || null,
          status: d.status || 'Active',
          notes: d.notes || null,
        }))
      })
    }

    if (status === 'COMPLETED' && treatments && treatments.length > 0) {
      await prisma.treatment.createMany({
        data: treatments.map((treatment: any) => ({
          visitId: visit.id,
          patientId,
          doctorId: doctorId || 'temp-doctor',
          hospitalId: normalizedHospitalId || 'temp-hospital',
          name: treatment.name,
          description: treatment.description || '',
          scheduledAt: new Date(treatment.scheduledAt || scheduledAt),
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
          hospitalId: normalizedHospitalId || 'temp-hospital',
          name: operation.name,
          description: operation.description || '',
          scheduledAt: new Date(operation.scheduledAt || scheduledAt),
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
          hospitalId: normalizedHospitalId || 'temp-hospital',
          name: medication.name,
          dosage: medication.dosage || '',
          instructions: medication.instructions || '',
          startDate: new Date(medication.startDate || scheduledAt),
          endDate: medication.endDate ? new Date(medication.endDate) : null
        }))
      })
    }

    // Create treatment courses if provided
    if (status === 'COMPLETED' && treatmentCourses && treatmentCourses.length > 0) {
      console.log('💊 Creating treatment courses:', treatmentCourses.length)
      
      for (const course of treatmentCourses) {
        const treatmentCourse = await prisma.treatmentCourse.create({
          data: {
            patientId,
            doctorId: doctorId || 'temp-doctor',
            hospitalId: normalizedHospitalId || 'temp-hospital',
            hospitalTreatmentId: course.hospitalTreatmentId,
            courseName: course.courseName,
            description: course.description || '',
            totalQuantity: course.totalQuantity || 0,
            reservedQuantity: course.reservedQuantity || 0,
            deliveredQuantity: course.deliveredQuantity || 0,
            remainingQuantity: course.remainingQuantity || 0,
            availableInStock: course.availableInStock || 0,
            startDate: new Date(course.startDate || new Date()),
            endDate: course.endDate ? new Date(course.endDate) : null,
            status: course.status || 'CREATED',
            isReserved: course.isReserved || false,
            isDelivered: course.isDelivered || false,
            instructions: course.instructions || '',
            notes: course.notes || ''
          }
        })

        // Create doses if provided
        if (course.doses && course.doses.length > 0) {
          await prisma.treatmentDose.createMany({
            data: course.doses.map((dose: any, index: number) => ({
              courseId: treatmentCourse.id,
              doseNumber: dose.doseNumber || (index + 1),
              scheduledDate: new Date(dose.scheduledDate || dose.scheduledAt || new Date()),
              scheduledTime: dose.scheduledTime || '',
              quantity: dose.quantity || 0,
              status: dose.status || 'SCHEDULED',
              takenAt: dose.takenAt || null,
              takenDate: dose.takenDate ? new Date(dose.takenDate) : null,
              isTaken: dose.isTaken || false,
              isOnTime: dose.isOnTime || false,
              notes: dose.notes || '',
              sideEffects: dose.sideEffects || '',
              takenBy: dose.takenBy || null
            }))
          })
        }
      }
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
      diseases = [],
      treatmentCourses = [],
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
      await prisma.treatmentCourse.deleteMany({ where: { patientId } })

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

      // Create treatment courses if provided
      if (treatmentCourses && treatmentCourses.length > 0) {
        console.log('💊 Creating treatment courses:', treatmentCourses.length)
        
        for (const course of treatmentCourses) {
          const treatmentCourse = await prisma.treatmentCourse.create({
            data: {
              patientId,
              doctorId: doctorId || 'temp-doctor',
              hospitalId: hospitalId || 'temp-hospital',
              hospitalTreatmentId: course.hospitalTreatmentId,
              courseName: course.courseName,
              description: course.description || '',
              totalQuantity: course.totalQuantity || 0,
              reservedQuantity: course.reservedQuantity || 0,
              deliveredQuantity: course.deliveredQuantity || 0,
              remainingQuantity: course.remainingQuantity || 0,
              availableInStock: course.availableInStock || 0,
              startDate: new Date(course.startDate || new Date()),
              endDate: course.endDate ? new Date(course.endDate) : null,
              status: course.status || 'CREATED',
              isReserved: course.isReserved || false,
              isDelivered: course.isDelivered || false,
              instructions: course.instructions || '',
              notes: course.notes || ''
            }
          })

          // Create doses if provided
          if (course.doses && course.doses.length > 0) {
            await prisma.treatmentDose.createMany({
              data: course.doses.map((dose: any, index: number) => ({
                courseId: treatmentCourse.id,
                doseNumber: dose.doseNumber || (index + 1),
                scheduledDate: new Date(dose.scheduledAt || new Date()),
                scheduledTime: dose.scheduledTime || '',
                quantity: dose.quantity || 0,
                status: dose.status || 'SCHEDULED',
                takenAt: dose.takenAt || null,
                takenDate: dose.takenDate ? new Date(dose.takenDate) : null,
                isTaken: dose.isTaken || false,
                isOnTime: dose.isOnTime || false,
                notes: dose.notes || '',
                sideEffects: dose.sideEffects || '',
                takenBy: dose.takenBy || null
              }))
            })
          }
        }
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