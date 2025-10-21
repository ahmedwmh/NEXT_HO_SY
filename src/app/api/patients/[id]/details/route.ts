import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب تفاصيل المريض الأساسية فقط
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        email: true,
        address: true,
        bloodType: true,
        idNumber: true,
        nationality: true,
        passportNumber: true,
        profilePhoto: true,
        insuranceNumber: true,
        insuranceCompany: true,
        maritalStatus: true,
        occupation: true,
        notes: true,
        createdAt: true,
        hospital: {
          select: {
            id: true,
            name: true
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

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'المريض غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: patient
    })
  } catch (error) {
    console.error('Error fetching patient details:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب تفاصيل المريض' },
      { status: 500 }
    )
  }
}
