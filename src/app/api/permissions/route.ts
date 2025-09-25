import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdminPermission } from '@/lib/permission-middleware'
import type { ResourceType, PermissionType } from '@prisma/client'

// GET - جلب جميع الصلاحيات
export const GET = withAdminPermission()(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const resource = searchParams.get('resource') as ResourceType
    const action = searchParams.get('action') as PermissionType
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (resource) {
      whereClause.resource = resource
    }

    if (action) {
      whereClause.action = action
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where: whereClause,
        orderBy: [
          { resource: 'asc' },
          { action: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.permission.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: permissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الصلاحيات' },
      { status: 500 }
    )
  }
})

// POST - إنشاء صلاحية جديدة
export const POST = withAdminPermission()(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, description, resource, action } = body

    if (!name || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'الاسم والمورد والإجراء مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود صلاحية مشابهة
    const existingPermission = await prisma.permission.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        resource,
        action
      }
    })

    if (existingPermission) {
      return NextResponse.json(
        { success: false, error: 'الصلاحية موجودة بالفعل' },
        { status: 400 }
      )
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        resource,
        action
      }
    })

    return NextResponse.json({
      success: true,
      data: permission,
      message: 'تم إنشاء الصلاحية بنجاح'
    })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الصلاحية' },
      { status: 500 }
    )
  }
})
