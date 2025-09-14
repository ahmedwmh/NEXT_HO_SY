import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { firstName, lastName, specialization, phone, licenseNumber, hospitalId } = await request.json()
    const { id } = params

    if (!firstName || !lastName || !specialization || !hospitalId) {
      return NextResponse.json(
        { error: 'الاسم والتخصص والمستشفى مطلوبة' },
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

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        specialization,
        phone: phone?.trim() || null,
        licenseNumber: licenseNumber?.trim() || null,
        hospitalId
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
        },
        user: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('خطأ في تحديث الطبيب:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'الطبيب غير موجود' },
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
      { error: 'فشل في تحديث الطبيب' },
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

    // Get doctor with user info
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'الطبيب غير موجود' },
        { status: 404 }
      )
    }

    // Check if doctor has visits, tests, treatments, or operations
    const [visitsCount, testsCount, treatmentsCount, operationsCount] = await Promise.all([
      prisma.visit.count({ where: { doctorId: id } }),
      prisma.test.count({ where: { doctorId: id } }),
      prisma.treatment.count({ where: { doctorId: id } }),
      prisma.operation.count({ where: { doctorId: id } })
    ])

    if (visitsCount > 0 || testsCount > 0 || treatmentsCount > 0 || operationsCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الطبيب لوجود زيارات أو فحوصات أو علاجات أو عمليات مرتبطة به' },
        { status: 400 }
      )
    }

    // Delete doctor and associated user
    await prisma.$transaction([
      prisma.doctor.delete({ where: { id } }),
      prisma.user.delete({ where: { id: doctor.userId } })
    ])

    return NextResponse.json({ message: 'تم حذف الطبيب بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف الطبيب:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'الطبيب غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'فشل في حذف الطبيب' },
      { status: 500 }
    )
  }
}
