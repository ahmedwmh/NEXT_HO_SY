import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser, canAccessHospital } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idNumber = searchParams.get('idNumber')
    const hospitalId = searchParams.get('hospitalId')
    
    // If checking for ID number uniqueness
    if (idNumber) {
      const existingPatient = await prisma.patient.findFirst({
        where: { idNumber: idNumber.trim() },
        select: { id: true, firstName: true, lastName: true, patientNumber: true }
      })
      
      return NextResponse.json({
        exists: !!existingPatient,
        patient: existingPatient
      })
    }

    // Build where clause based on filters
    const whereClause: any = {}
    
    // Filter by hospital if specified
    if (hospitalId) {
      // Check if user can access this hospital
      if (!canAccessHospital(user, hospitalId)) {
        return NextResponse.json({ error: 'غير مصرح للوصول لهذا المستشفى' }, { status: 403 })
      }
      whereClause.hospitalId = hospitalId
    } else if (user.role !== 'ADMIN') {
      // Non-admin users can only see patients from their hospital
      if (user.hospitalId) {
        whereClause.hospitalId = user.hospitalId
      } else {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      }
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        hospital: {
          include: {
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      data: patients,
      pagination: {
        page: 1,
        limit: patients.length,
        total: patients.length,
        totalPages: 1
      }
    })
  } catch (error) {
    console.error('خطأ في جلب المرضى:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المرضى' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      emergencyContact,
      bloodType,
      allergies,
      medicalHistory,
      nationality,
      idNumber,
      passportNumber,
      cityId,
      insuranceNumber,
      insuranceCompany,
      maritalStatus,
      occupation,
      notes,
      profilePhoto,
      patientImages,
      hospitalId,
      selectedTests
    } = await request.json()

    if (!firstName || !lastName || !dateOfBirth || !gender || !phone || !address || !emergencyContact || !cityId || !hospitalId) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    // Check if user can access this hospital
    if (!canAccessHospital(user, hospitalId)) {
      return NextResponse.json({ error: 'غير مصرح للوصول لهذا المستشفى' }, { status: 403 })
    }

    // Check if ID number already exists (if provided)
    if (idNumber && idNumber.trim()) {
      const existingPatient = await prisma.patient.findFirst({
        where: { idNumber: idNumber.trim() }
      })
      
      if (existingPatient) {
        return NextResponse.json(
          { error: `رقم الهوية الوطنية ${idNumber} مستخدم بالفعل للمريض ${existingPatient.firstName} ${existingPatient.lastName} (${existingPatient.patientNumber})` },
          { status: 409 }
        )
      }
    }

    // Check if city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'المدينة المحددة غير موجودة' },
        { status: 400 }
      )
    }

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'المستشفى المحدد غير موجود' },
        { status: 400 }
      )
    }


    // Verify hospital belongs to the selected city
    if (hospital.cityId !== cityId) {
      return NextResponse.json(
        { error: 'المستشفى المحدد لا ينتمي للمدينة المحددة' },
        { status: 400 }
      )
    }

    // Generate unique patient number
    let patientNumber: string = ''
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      const patientCount = await prisma.patient.count({
        where: { hospitalId }
      })
      const hospitalCode = hospitalId.slice(-4).toUpperCase()
      const sequenceNumber = String(patientCount + 1 + attempts).padStart(4, '0')
      patientNumber = `P${hospitalCode}${sequenceNumber}`
      
      // Check if this patient number already exists
      const existingPatient = await prisma.patient.findUnique({
        where: { patientNumber }
      })
      
      if (!existingPatient) {
        isUnique = true
      }
      attempts++
    }
    
    if (!isUnique) {
      return NextResponse.json(
        { error: 'فشل في إنشاء رقم مريض فريد' },
        { status: 500 }
      )
    }

    const patient = await prisma.patient.create({
      data: {
        patientNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName?.trim() || null,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
        bloodType: bloodType || null,
        allergies: Array.isArray(allergies) ? allergies.join(', ') : allergies || null,
        medicalHistory: medicalHistory?.trim() || null,
        nationality: nationality || null,
        idNumber: idNumber?.trim() || null,
        passportNumber: passportNumber?.trim() || null,
        cityId,
        insuranceNumber: insuranceNumber?.trim() || null,
        insuranceCompany: insuranceCompany?.trim() || null,
        maritalStatus: maritalStatus || null,
        occupation: occupation?.trim() || null,
        notes: notes?.trim() || null,
        profilePhoto: profilePhoto?.trim() || null,
        hospitalId,
        isActive: true
      },
      include: {
        hospital: {
          include: {
            city: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Create patient images if provided
    if (patientImages && Array.isArray(patientImages) && patientImages.length > 0) {
      const imageData = patientImages.map((imageUrl: string, index: number) => ({
        patientId: patient.id,
        imageUrl: imageUrl,
        title: `صورة المريض ${index + 1}`,
        description: `صورة إضافية للمريض ${patient.patientNumber}`,
        type: 'patient_photo',
        isActive: true
      }))

      await prisma.patientImage.createMany({
        data: imageData
      })
    }

    // Create tests if selected
    if (selectedTests && Array.isArray(selectedTests) && selectedTests.length > 0) {
      // Get a default doctor for the hospital (you might want to modify this logic)
      const defaultDoctor = await prisma.doctor.findFirst({
        where: { hospitalId }
      })

      if (defaultDoctor) {
        const testData = selectedTests.map((test: any) => ({
          patientId: patient.id,
          doctorId: defaultDoctor.id,
          hospitalId: hospitalId,
          name: test.name,
          description: test.description || null,
          scheduledAt: new Date(), // Schedule for today
          status: 'SCHEDULED' as const,
          notes: `فحص مبدئي للمريض الجديد - ${patient.patientNumber}`
        }))

        await prisma.test.createMany({
          data: testData
        })
      }
    }

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء المريض:', error)
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'البيانات المدخلة موجودة بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في إنشاء المريض' },
      { status: 500 }
    )
  }
}
