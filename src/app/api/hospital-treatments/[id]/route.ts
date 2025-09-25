import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const treatment = await prisma.hospitalTreatment.findUnique({
      where: { id },
      include: {
        hospital: {
          include: {
            city: true
          }
        }
      }
    })

    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: treatment
    })
  } catch (error) {
    console.error('Error fetching treatment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatment' },
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

    const updatedTreatment = await prisma.hospitalTreatment.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        duration: data.duration,
        cost: data.cost,
        quantity: data.quantity,
        expiredate: data.expiredate ? new Date(data.expiredate) : null,
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
      data: updatedTreatment,
      message: 'Treatment updated successfully'
    })
  } catch (error) {
    console.error('Error updating treatment:', error)
    return NextResponse.json(
      { error: 'Failed to update treatment' },
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

    await prisma.hospitalTreatment.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Treatment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting treatment:', error)
    return NextResponse.json(
      { error: 'Failed to delete treatment' },
      { status: 500 }
    )
  }
}