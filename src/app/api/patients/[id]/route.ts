import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
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

    if (!patient) {
      return NextResponse.json(
        { error: 'المريض غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('خطأ في جلب بيانات المريض:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات المريض' },
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
    
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        allergies: data.allergies ? (Array.isArray(data.allergies) ? data.allergies : data.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)) : undefined
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
    console.error('خطأ في تحديث بيانات المريض:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث بيانات المريض' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.patient.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف المريض بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المريض:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المريض' },
      { status: 500 }
    )
  }
}