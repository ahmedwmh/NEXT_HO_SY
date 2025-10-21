import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب زيارات المريض مع البيانات الأساسية فقط
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Fetch visits with minimal data for better performance
    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where: { patientId },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          symptoms: true,
          diagnosis: true,
          notes: true,
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true
            }
          },
          // Include test info with new fields
          tests: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              scheduledAt: true,
              results: true,
              notes: true,
              testStatus: true,
              testStatusDescription: true,
              testImages: true
            },
            take: 5 // Limit to 5 most recent tests
          },
          // Only include basic treatment info
          treatments: {
            select: {
              id: true,
              name: true,
              status: true,
              scheduledAt: true
            },
            take: 5 // Limit to 5 most recent treatments
          },
          // Only include basic operation info
          operations: {
            select: {
              id: true,
              name: true,
              status: true,
              scheduledAt: true
            },
            take: 5 // Limit to 5 most recent operations
          }
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.visit.count({ where: { patientId } })
    ])

    return NextResponse.json({
      success: true,
      data: visits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching patient visits:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب زيارات المريض' },
      { status: 500 }
    )
  }
}