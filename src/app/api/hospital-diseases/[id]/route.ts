import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// حذف مرض
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const diseaseId = params.id

    const deletedDisease = await prisma.hospitalDisease.delete({
      where: { id: diseaseId }
    })

    return NextResponse.json({
      message: 'Disease deleted successfully',
      disease: deletedDisease
    })
  } catch (error) {
    console.error('Error deleting disease:', error)
    return NextResponse.json({ error: 'Failed to delete disease' }, { status: 500 })
  }
}

// تحديث مرض
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const diseaseId = params.id
    const body = await request.json()
    const { name, description, category, severity } = body

    const updatedDisease = await prisma.hospitalDisease.update({
      where: { id: diseaseId },
      data: {
        name,
        description,
        category,
        severity
      }
    })

    return NextResponse.json({
      message: 'Disease updated successfully',
      disease: updatedDisease
    })
  } catch (error) {
    console.error('Error updating disease:', error)
    return NextResponse.json({ error: 'Failed to update disease' }, { status: 500 })
  }
}
