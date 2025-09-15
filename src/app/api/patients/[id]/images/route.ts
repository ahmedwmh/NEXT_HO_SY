import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const images = await prisma.patientImage.findMany({
      where: { 
        patientId: params.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('خطأ في جلب صور المريض:', error)
    return NextResponse.json(
      { error: 'فشل في جلب صور المريض' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { imageUrl, title, description, type } = data

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: params.id }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'المريض غير موجود' },
        { status: 404 }
      )
    }

    const image = await prisma.patientImage.create({
      data: {
        patientId: params.id,
        imageUrl,
        title: title || null,
        description: description || null,
        type: type || 'medical'
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('خطأ في إضافة صورة المريض:', error)
    return NextResponse.json(
      { error: 'فشل في إضافة صورة المريض' },
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
    const { imageId, title, description, type } = data

    const image = await prisma.patientImage.update({
      where: { id: imageId },
      data: {
        title: title || null,
        description: description || null,
        type: type || 'medical'
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('خطأ في تحديث صورة المريض:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث صورة المريض' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json(
        { error: 'معرف الصورة مطلوب' },
        { status: 400 }
      )
    }

    await prisma.patientImage.update({
      where: { id: imageId },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'تم حذف الصورة بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف صورة المريض:', error)
    return NextResponse.json(
      { error: 'فشل في حذف صورة المريض' },
      { status: 500 }
    )
  }
}
