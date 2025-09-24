import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser, canAccessHospital } from '@/lib/auth-middleware'

// جلب المستشفيات
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const hospitalId = searchParams.get('hospitalId')

    let whereClause: any = {}
    
    if (cityId) {
      whereClause.cityId = cityId
    }
    
    if (hospitalId) {
      // Check if user can access this hospital
      if (!canAccessHospital(user, hospitalId)) {
        return NextResponse.json({ error: 'غير مصرح للوصول لهذا المستشفى' }, { status: 403 })
      }
      whereClause.id = hospitalId
    } else if (user.role !== 'ADMIN') {
      // Non-admin users can only see their hospital
      if (user.hospitalId) {
        whereClause.id = user.hospitalId
      } else {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      }
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