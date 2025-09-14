import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, address, phone, email, cityId } = await request.json()
    const { id } = params

    if (!name || !name.trim() || !address || !address.trim() || !cityId) {
      return NextResponse.json(
        { error: 'اسم المستشفى والعنوان والمدينة مطلوبة' },
        { status: 400 }
      )
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

    const hospital = await prisma.hospital.update({
      where: { id },
      data: {
        name: name.trim(),
        address: address.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        cityId
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
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'المستشفى غير موجود' },
        { status: 404 }
      )
    }

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'هذا المستشفى موجود بالفعل' },
        { status: 409 }
      )
    }

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
    const { id } = params

    // Check if hospital has doctors, staff, or patients
    const [doctorsCount, staffCount, patientsCount] = await Promise.all([
      prisma.doctor.count({ where: { hospitalId: id } }),
      prisma.staff.count({ where: { hospitalId: id } }),
      prisma.patient.count({ where: { hospitalId: id } })
    ])

    if (doctorsCount > 0 || staffCount > 0 || patientsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المستشفى لوجود أطباء أو موظفين أو مرضى مرتبطين به' },
        { status: 400 }
      )
    }

    await prisma.hospital.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف المستشفى بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المستشفى:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'المستشفى غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في حذف المستشفى' },
      { status: 500 }
    )
  }
}
