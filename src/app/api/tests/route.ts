import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const whereClause = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {}

    const tests = await prisma.test.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        results: true,
        notes: true,
        scheduledAt: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { name: 'asc' },
      take: limit
    })

    // Get unique test names for dropdown
    const uniqueTests = tests.reduce((acc, test) => {
      if (!acc.find(t => t.name === test.name)) {
        acc.push({
          id: test.id,
          name: test.name,
          description: test.description
        })
      }
      return acc
    }, [] as Array<{id: string, name: string, description: string | null}>)

    return NextResponse.json({
      success: true,
      data: uniqueTests,
      count: uniqueTests.length
    })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}