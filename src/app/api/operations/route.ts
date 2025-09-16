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

    const operations = await prisma.operation.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        scheduledAt: true,
        notes: true,
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

    // Get unique operation names for dropdown
    const uniqueOperations = operations.reduce((acc, operation) => {
      if (!acc.find(o => o.name === operation.name)) {
        acc.push({
          id: operation.id,
          name: operation.name,
          description: operation.description
        })
      }
      return acc
    }, [] as Array<{id: string, name: string, description: string | null}>)

    return NextResponse.json({
      success: true,
      data: uniqueOperations,
      count: uniqueOperations.length
    })
  } catch (error) {
    console.error('Error fetching operations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch operations' },
      { status: 500 }
    )
  }
}