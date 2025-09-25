import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const operation = await prisma.hospitalOperation.findUnique({
      where: { id },
      include: {
        hospital: {
          include: {
            city: true
          }
        }
      }
    })

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: operation
    })
  } catch (error) {
    console.error('Error fetching operation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const updatedOperation = await prisma.hospitalOperation.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        duration: data.duration,
        cost: data.cost,
        isActive: data.isActive
      },
      include: {
        hospital: {
          include: {
            city: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedOperation,
      message: 'Operation updated successfully'
    })
  } catch (error) {
    console.error('Error updating operation:', error)
    return NextResponse.json(
      { error: 'Failed to update operation' },
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

    await prisma.hospitalOperation.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Operation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting operation:', error)
    return NextResponse.json(
      { error: 'Failed to delete operation' },
      { status: 500 }
    )
  }
}