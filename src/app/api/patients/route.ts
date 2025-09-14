import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
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

    return NextResponse.json(patients)
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
      hospitalId
    } = await request.json()

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

    // Generate patient number
    const patientCount = await prisma.patient.count({
      where: { hospitalId }
    })
    const patientNumber = `P${hospitalId.slice(-4)}${String(patientCount + 1).padStart(3, '0')}`

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
