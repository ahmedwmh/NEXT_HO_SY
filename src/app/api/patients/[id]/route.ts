import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      city,
      insuranceNumber,
      insuranceCompany,
      maritalStatus,
      occupation,
      notes,
      hospitalId,
      isActive
    } = await request.json()
    const { id } = params

    if (!firstName || !lastName || !dateOfBirth || !gender || !phone || !address || !emergencyContact || !hospitalId) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
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

    const patient = await prisma.patient.update({
      where: { id },
      data: {
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
        allergies: allergies || null,
        medicalHistory: medicalHistory?.trim() || null,
        nationality: nationality || null,
        idNumber: idNumber?.trim() || null,
        passportNumber: passportNumber?.trim() || null,
        city: city?.trim() || null,
        insuranceNumber: insuranceNumber?.trim() || null,
        insuranceCompany: insuranceCompany?.trim() || null,
        maritalStatus: maritalStatus || null,
        occupation: occupation?.trim() || null,
        notes: notes?.trim() || null,
        hospitalId,
        isActive: isActive !== undefined ? isActive : true
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

    return NextResponse.json(patient)
  } catch (error) {
    console.error('خطأ في تحديث المريض:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'المريض غير موجود' },
        { status: 404 }
      )
    }

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
    const { id } = params

    // Check if patient has visits, tests, treatments, or operations
    const [visitsCount, testsCount, treatmentsCount, operationsCount] = await Promise.all([
      prisma.visit.count({ where: { patientId: id } }),
      prisma.test.count({ where: { patientId: id } }),
      prisma.treatment.count({ where: { patientId: id } }),
      prisma.operation.count({ where: { patientId: id } })
    ])

    if (visitsCount > 0 || testsCount > 0 || treatmentsCount > 0 || operationsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المريض لوجود زيارات أو فحوصات أو علاجات أو عمليات مرتبطة به' },
        { status: 400 }
      )
    }

    await prisma.patient.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف المريض بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المريض:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'المريض غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في حذف المريض' },
      { status: 500 }
    )
  }
}
