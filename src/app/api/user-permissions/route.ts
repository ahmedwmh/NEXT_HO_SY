import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdminPermission } from '@/lib/permission-middleware'

// GET - جلب صلاحيات المستخدمين
export const GET = withAdminPermission()(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const hospitalId = searchParams.get('hospitalId')
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }

    if (hospitalId) {
      whereClause.hospitalId = hospitalId
    }

    const [userPermissions, total] = await Promise.all([
      prisma.userPermission.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              doctorProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospital: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              staffProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospital: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          permission: true,
          hospital: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.userPermission.count({ where: whereClause })
    ])

    // تحويل البيانات لتسهيل الاستخدام
    const formattedPermissions = userPermissions.map(up => ({
      id: up.id,
      userId: up.userId,
      permission: up.permission,
      granted: up.granted,
      hospitalId: up.hospitalId,
      hospital: up.hospital,
      expiresAt: up.expiresAt,
      reason: up.reason,
      createdAt: up.createdAt,
      user: {
        id: up.user.id,
        email: up.user.email,
        role: up.user.role,
        firstName: up.user.doctorProfile?.firstName || up.user.staffProfile?.firstName,
        lastName: up.user.doctorProfile?.lastName || up.user.staffProfile?.lastName,
        hospital: up.user.doctorProfile?.hospital || up.user.staffProfile?.hospital
      }
    }))

    return NextResponse.json({
      success: true,
      data: formattedPermissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب صلاحيات المستخدمين' },
      { status: 500 }
    )
  }
})

// POST - منح/منع صلاحية لمستخدم
export const POST = withAdminPermission()(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { userId, permissionId, hospitalId, granted, expiresAt, reason } = body

    if (!userId || !permissionId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم والصلاحية مطلوبان' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من وجود الصلاحية
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId }
    })

    if (!permission) {
      return NextResponse.json(
        { success: false, error: 'الصلاحية غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من وجود المستشفى إذا تم تحديده
    if (hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId }
      })

      if (!hospital) {
        return NextResponse.json(
          { success: false, error: 'المستشفى غير موجود' },
          { status: 404 }
        )
      }
    }

    // التحقق من عدم وجود صلاحية مشابهة
    const existingPermission = await prisma.userPermission.findFirst({
      where: {
        userId,
        permissionId,
        hospitalId: hospitalId || null
      }
    })

    if (existingPermission) {
      // تحديث الصلاحية الموجودة
      const updatedPermission = await prisma.userPermission.update({
        where: { id: existingPermission.id },
        data: {
          granted,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          reason
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              doctorProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospital: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              staffProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospital: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          permission: true,
          hospital: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedPermission,
        message: 'تم تحديث الصلاحية بنجاح'
      })
    } else {
      // إنشاء صلاحية جديدة
      const newPermission = await prisma.userPermission.create({
        data: {
          userId,
          permissionId,
          hospitalId: hospitalId || null,
          granted: granted !== false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          reason
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              doctorProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospital: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              staffProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospital: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          permission: true,
          hospital: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: newPermission,
        message: 'تم منح الصلاحية بنجاح'
      })
    }
  } catch (error) {
    console.error('Error managing user permission:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إدارة صلاحية المستخدم' },
      { status: 500 }
    )
  }
})
