import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// استرجاع فحص واحد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const test = await prisma.hospitalTest.findUnique({
      where: { id },
      include: {
        hospital: {
          include: {
            city: true
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: test
    })
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    )
  }
}

// تحديث فحص
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id
    const body = await request.json()
    const { name, description, category, duration, cost, hospitalId } = body

    if (!name) {
      return NextResponse.json({ error: 'Test name is required' }, { status: 400 })
    }

    const test = await prisma.hospitalTest.update({
      where: { id: testId },
      data: {
        name,
        description: description || '',
        category: category || '',
        duration: duration || '',
        cost: cost || 0,
        hospitalId: hospitalId
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json({
      success: true,
      data: test
    })
  } catch (error) {
    console.error('Error updating hospital test:', error)
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

// حذف فحص
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id

    await prisma.hospitalTest.delete({
      where: { id: testId }
    })

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hospital test:', error)
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}