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

    // Handle both formats: "name-id" and "id"
    const findHospitalId = async (hospitalId?: string) => {
      if (!hospitalId) return null
      
      // First try direct match
      let hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } })
      if (hospital) return hospital.id
      
      // If not found, try to find by ID part
      const extractedId = extractId(hospitalId)
      if (extractedId && extractedId !== hospitalId) {
        hospital = await prisma.hospital.findUnique({ where: { id: extractedId } })
        if (hospital) return hospital.id
      }
      
      // If still not found, try to find by contains
      const hospitals = await prisma.hospital.findMany({
        where: { id: { contains: extractedId || hospitalId } }
      })
      if (hospitals.length > 0) return hospitals[0].id
      
      return null
    }

    let normalizedHospitalId = await findHospitalId(hospitalId)

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

    // Add related data for both COMPLETED and DRAFT visits
    if (tests && tests.length > 0) {
      // Check for existing tests to avoid duplicates
      const existingTests = await prisma.test.findMany({
        where: {
          patientId,
          visitId: visit.id,
          name: { in: tests.map((t: any) => t.name) }
        }
      })

      // Filter out tests that already exist
      const newTests = tests.filter((test: any) => 
        !existingTests.some(existing => existing.name === test.name)
      )

      if (newTests.length > 0) {
        await prisma.test.createMany({
          data: newTests.map((test: any) => ({
            visitId: visit.id,
            patientId,
            doctorId: doctorId || 'temp-doctor',
            hospitalId: normalizedHospitalId || 'temp-hospital',
            name: test.name,
            description: test.description || '',
            scheduledAt: new Date(test.scheduledAt || scheduledAt),
            results: test.results || null,
            notes: test.notes || null,
            testStatus: test.testStatus || null,
            testStatusDescription: test.testStatusDescription || null,
            testImages: test.testImages || []
          }))
        })
      }
    }

    if (diseases && diseases.length > 0) {
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

    if (treatments && treatments.length > 0) {
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

    if (operations && operations.length > 0) {
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

    if (medications && medications.length > 0) {
      await prisma.medication.createMany({
        data: medications.map((medication: any) => ({
          visitId: visit.id,
          patientId,
          doctorId: doctorId || 'temp-doctor',
          name: medication.name,
          dosage: medication.dosage || '',
          frequency: medication.frequency || '',
          duration: medication.duration || '',
          instructions: medication.instructions || '',
          startDate: new Date(medication.startDate || scheduledAt),
          endDate: medication.endDate ? new Date(medication.endDate) : null,
          status: medication.status || 'Active',
          notes: medication.notes || null
        }))
      })
    }

    // Create treatment courses if provided
    if (treatmentCourses && treatmentCourses.length > 0) {
      console.log('💊 Creating treatment courses:', treatmentCourses.length)
      
      for (const course of treatmentCourses) {
        // Check if hospital treatment exists and has enough quantity
        const hospitalTreatment = await prisma.hospitalTreatment.findUnique({
          where: { id: course.hospitalTreatmentId }
        })

        if (!hospitalTreatment) {
          console.error('❌ Hospital treatment not found:', course.hospitalTreatmentId)
          continue
        }

        // Calculate available quantity (total - reserved - delivered)
        const availableQuantity = (hospitalTreatment.quantity || 0) - 
                                 (hospitalTreatment.reservedQuantity || 0) - 
                                 (hospitalTreatment.deliveredQuantity || 0)

        console.log(`📊 Inventory check for ${course.courseName}:`)
        console.log(`   - Total: ${hospitalTreatment.quantity}`)
        console.log(`   - Reserved: ${hospitalTreatment.reservedQuantity}`)
        console.log(`   - Delivered: ${hospitalTreatment.deliveredQuantity}`)
        console.log(`   - Available: ${availableQuantity}`)
        console.log(`   - Required: ${course.totalQuantity}`)

        if (availableQuantity < course.totalQuantity) {
          console.error(`❌ Insufficient quantity for ${course.courseName}. Available: ${availableQuantity}, Required: ${course.totalQuantity}`)
          continue
        }

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Create treatment course
          const treatmentCourse = await tx.treatmentCourse.create({
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
              availableInStock: availableQuantity - (course.totalQuantity || 0),
              startDate: new Date(course.startDate || new Date()),
              endDate: course.endDate ? new Date(course.endDate) : null,
              status: course.status || 'CREATED',
              isReserved: course.isReserved || false,
              isDelivered: course.isDelivered || false,
              instructions: course.instructions || '',
              notes: course.notes || ''
            }
          })

          // Update hospital treatment inventory - FIXED: Use totalQuantity instead of reservedQuantity
          await tx.hospitalTreatment.update({
            where: { id: course.hospitalTreatmentId },
            data: {
              reservedQuantity: {
                increment: course.totalQuantity || 0  // Use totalQuantity for reservation
              },
              deliveredQuantity: {
                increment: course.deliveredQuantity || 0
              }
            }
          })

          console.log(`✅ Updated inventory for ${course.courseName}:`)
          console.log(`   - Reserved: +${course.totalQuantity}`)
          console.log(`   - Delivered: +${course.deliveredQuantity}`)

          return treatmentCourse
        })

        // Create doses if provided
        if (course.doses && course.doses.length > 0) {
          await prisma.treatmentDose.createMany({
            data: course.doses.map((dose: any, index: number) => ({
              courseId: result.id,
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في إنشاء الزيارة الشاملة',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    // Handle hospital ID resolution for PUT method
    const findHospitalId = async (hospitalId?: string) => {
      if (!hospitalId) return null
      
      // First try direct match
      let hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } })
      if (hospital) return hospital.id
      
      // If not found, try to find by ID part
      const extractedId = hospitalId.includes('-') ? hospitalId.split('-').pop() : hospitalId
      if (extractedId && extractedId !== hospitalId) {
        hospital = await prisma.hospital.findUnique({ where: { id: extractedId } })
        if (hospital) return hospital.id
      }
      
      // If still not found, try to find by contains
      const hospitals = await prisma.hospital.findMany({
        where: { id: { contains: extractedId || hospitalId } }
      })
      if (hospitals.length > 0) return hospitals[0].id
      
      return null
    }

    const normalizedHospitalId = await findHospitalId(hospitalId)

    // Update visit basic info
    const visit = await prisma.visit.update({
      where: { id },
      data: {
        doctorId: doctorId || null,
        hospitalId: normalizedHospitalId || null,
        cityId: cityId || null,
        scheduledAt: new Date(scheduledAt),
        status: status as any,
        notes: notes || '',
        diagnosis: diagnosis || '',
        symptoms: symptoms || '',
        currentStep: currentStep
      }
    })

    // Delete existing related data for this visit
    await prisma.test.deleteMany({ where: { visitId: id } })
    await prisma.treatment.deleteMany({ where: { visitId: id } })
    await prisma.operation.deleteMany({ where: { visitId: id } })
    await prisma.medication.deleteMany({ where: { visitId: id } })
    await prisma.treatmentCourse.deleteMany({ where: { patientId } })
    
    // Create diseases if provided
    if (diseases && diseases.length > 0) {
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

    // Add new related data
    if (tests && tests.length > 0) {
      // Check for existing tests to avoid duplicates
      const existingTests = await prisma.test.findMany({
        where: {
          patientId,
          visitId: id,
          name: { in: tests.map((t: any) => t.name) }
        }
      })

      // Filter out tests that already exist
      const newTests = tests.filter((test: any) => 
        !existingTests.some(existing => existing.name === test.name)
      )

      if (newTests.length > 0) {
        await prisma.test.createMany({
          data: newTests.map((test: any) => ({
            visitId: id,
            patientId,
            doctorId: doctorId || '',
            hospitalId: normalizedHospitalId || '',
            name: test.name,
            description: test.description || '',
            scheduledAt: new Date(test.scheduledAt),
            results: test.results || null,
            notes: test.notes || null,
            testStatus: test.testStatus || null,
            testStatusDescription: test.testStatusDescription || null,
            testImages: test.testImages || []
          }))
        })
      }
    }

    if (treatments && treatments.length > 0) {
      await prisma.treatment.createMany({
        data: treatments.map((treatment: any) => ({
          visitId: id,
          patientId,
          doctorId: doctorId || '',
          hospitalId: normalizedHospitalId || '',
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
          visitId: id,
          patientId,
          doctorId: doctorId || '',
          hospitalId: normalizedHospitalId || '',
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
          visitId: id,
          patientId,
          doctorId: doctorId || '',
          name: medication.name,
          dosage: medication.dosage || '',
          frequency: medication.frequency || '',
          duration: medication.duration || '',
          instructions: medication.instructions || '',
          startDate: new Date(medication.startDate),
          endDate: medication.endDate ? new Date(medication.endDate) : null,
          status: medication.status || 'Active',
          notes: medication.notes || null
        }))
      })
    }

    // Create treatment courses if provided
    if (treatmentCourses && treatmentCourses.length > 0) {
      console.log('💊 Creating treatment courses:', treatmentCourses.length)
      
      for (const course of treatmentCourses) {
        // Check if hospital treatment exists and has enough quantity
        const hospitalTreatment = await prisma.hospitalTreatment.findUnique({
          where: { id: course.hospitalTreatmentId }
        })

        if (!hospitalTreatment) {
          console.error('❌ Hospital treatment not found:', course.hospitalTreatmentId)
          continue
        }

        // Calculate available quantity (total - reserved - delivered)
        const availableQuantity = (hospitalTreatment.quantity || 0) - 
                                 (hospitalTreatment.reservedQuantity || 0) - 
                                 (hospitalTreatment.deliveredQuantity || 0)

        console.log(`📊 Inventory check for ${course.courseName}:`)
        console.log(`   - Total: ${hospitalTreatment.quantity}`)
        console.log(`   - Reserved: ${hospitalTreatment.reservedQuantity}`)
        console.log(`   - Delivered: ${hospitalTreatment.deliveredQuantity}`)
        console.log(`   - Available: ${availableQuantity}`)
        console.log(`   - Required: ${course.totalQuantity}`)

        if (availableQuantity < course.totalQuantity) {
          console.error(`❌ Insufficient quantity for ${course.courseName}. Available: ${availableQuantity}, Required: ${course.totalQuantity}`)
          continue
        }

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Create treatment course
          const treatmentCourse = await tx.treatmentCourse.create({
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
              availableInStock: availableQuantity - (course.totalQuantity || 0),
              startDate: new Date(course.startDate || new Date()),
              endDate: course.endDate ? new Date(course.endDate) : null,
              status: course.status || 'CREATED',
              isReserved: course.isReserved || false,
              isDelivered: course.isDelivered || false,
              instructions: course.instructions || '',
              notes: course.notes || ''
            }
          })

          // Update hospital treatment inventory - FIXED: Use totalQuantity instead of reservedQuantity
          await tx.hospitalTreatment.update({
            where: { id: course.hospitalTreatmentId },
            data: {
              reservedQuantity: {
                increment: course.totalQuantity || 0  // Use totalQuantity for reservation
              },
              deliveredQuantity: {
                increment: course.deliveredQuantity || 0
              }
            }
          })

          console.log(`✅ Updated inventory for ${course.courseName}:`)
          console.log(`   - Reserved: +${course.totalQuantity}`)
          console.log(`   - Delivered: +${course.deliveredQuantity}`)

          return treatmentCourse
        })

        // Create doses if provided
        if (course.doses && course.doses.length > 0) {
          await prisma.treatmentDose.createMany({
            data: course.doses.map((dose: any, index: number) => ({
              courseId: result.id,
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