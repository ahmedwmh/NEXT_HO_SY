import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdminPermission } from '@/lib/permission-middleware'

// GET - جلب جميع الأدوار
export const GET = withAdminPermission()(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: whereClause,
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.role.count({ where: whereClause })
    ])

    // تحويل البيانات لتسهيل الاستخدام
    const rolesWithPermissions = roles.map(role => ({
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission)
    }))

    return NextResponse.json({
      success: true,
      data: rolesWithPermissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الأدوار' },
      { status: 500 }
    )
  }
})

// POST - إنشاء دور جديد
export const POST = withAdminPermission()(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'اسم الدور مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود دور مشابه
    const existingRole = await prisma.role.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    })

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'الدور موجود بالفعل' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: {
          create: (permissions || []).map((permissionId: string) => ({
            permissionId,
            granted: true
          }))
        }
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        permissions: role.rolePermissions.map(rp => rp.permission)
      },
      message: 'تم إنشاء الدور بنجاح'
    })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الدور' },
      { status: 500 }
    )
  }
})
