import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: params.id },
      include: {
        city: {
          select: {
            id: true,
            name: true
          }
        },
        doctors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        },
        patients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientNumber: true
          }
        }
      }
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'المستشفى غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(hospital)
  } catch (error) {
    console.error('خطأ في جلب بيانات المستشفى:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات المستشفى' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const hospital = await prisma.hospital.update({
      where: { id: params.id },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        cityId: data.cityId
      },
      include: {
        city: {
          select: {
            id: true,
            name: true
          }
        },
        doctors: {
          select: {
            id: true
          }
        },
        staff: {
          select: {
            id: true
          }
        },
        patients: {
          select: {
            id: true
          }
        }
      }
    })

    return NextResponse.json(hospital)
  } catch (error) {
    console.error('خطأ في تحديث المستشفى:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث المستشفى' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if hospital has doctors, staff, or patients
    const [doctorsCount, staffCount, patientsCount] = await Promise.all([
      prisma.doctor.count({ where: { hospitalId: params.id } }),
      prisma.staff.count({ where: { hospitalId: params.id } }),
      prisma.patient.count({ where: { hospitalId: params.id } })
    ])

    if (doctorsCount > 0 || staffCount > 0 || patientsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المستشفى لوجود أطباء أو موظفين أو مرضى مرتبطين به' },
        { status: 400 }
      )
    }

    await prisma.hospital.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف المستشفى بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المستشفى:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المستشفى' },
      { status: 500 }
    )
  }
}