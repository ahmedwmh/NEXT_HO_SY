import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب المستخدمين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          doctorProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalId: true
            }
          },
          staffProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المستخدمين' },
      { status: 500 }
    )
  }
}

// POST - إنشاء مستخدم جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, doctorProfile, staffProfile } = body

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور والدور مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'المستخدم موجود بالفعل' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // في التطبيق الحقيقي يجب تشفير كلمة المرور
        role,
        doctorProfile: doctorProfile ? {
          create: {
            firstName: doctorProfile.firstName,
            lastName: doctorProfile.lastName,
            specialization: doctorProfile.specialization,
            hospitalId: doctorProfile.hospitalId
          }
        } : undefined,
        staffProfile: staffProfile ? {
          create: {
            firstName: staffProfile.firstName,
            lastName: staffProfile.lastName,
            position: staffProfile.position,
            hospitalId: staffProfile.hospitalId
          }
        } : undefined
      },
      include: {
        doctorProfile: true,
        staffProfile: true
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'تم إنشاء المستخدم بنجاح'
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المستخدم' },
      { status: 500 }
    )
  }
}
