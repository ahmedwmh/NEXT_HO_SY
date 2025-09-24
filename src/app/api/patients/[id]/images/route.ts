import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب صور المريض
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🖼️ Fetching images for patient:', id)

    const images = await prisma.patientImage.findMany({
      where: {
        patientId: id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('🖼️ Found images:', images.length, images)

    return NextResponse.json({
      success: true,
      data: images
    })
  } catch (error) {
    console.error('Error fetching patient images:', error)
    return NextResponse.json(
      { error: 'فشل في جلب صور المريض' },
      { status: 500 }
    )
  }
}