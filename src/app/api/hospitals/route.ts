import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// جلب المستشفيات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const hospitalId = searchParams.get('hospitalId')

    let whereClause: any = {}
    
    if (cityId) {
      whereClause.cityId = cityId
    }
    
    if (hospitalId) {
      whereClause.id = hospitalId
    }

    const hospitals = await prisma.hospital.findMany({
      where: whereClause,
      include: {
        city: true,
        doctors: {
          select: { id: true }
        },
        staff: {
          select: { id: true }
        },
        patients: {
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      data: hospitals,
      pagination: {
        page: 1,
        limit: hospitals.length,
        total: hospitals.length,
        totalPages: 1
      }
    })
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 })
  }
}