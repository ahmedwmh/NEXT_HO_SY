import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT - تحديث مرض موجود
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    const updated = await prisma.disease.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        diagnosedAt: data.diagnosedAt ? new Date(data.diagnosedAt) : undefined,
        severity: data.severity,
        status: data.status,
        notes: data.notes,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating disease:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المرض' },
      { status: 500 }
    )
  }
}

// DELETE - حذف مرض
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.disease.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting disease:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المرض' },
      { status: 500 }
    )
  }
}


