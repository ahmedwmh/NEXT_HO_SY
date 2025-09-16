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

    const diseases = await prisma.disease.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
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

    // Get unique disease names for dropdown
    const uniqueDiseases = diseases.reduce((acc, disease) => {
      if (!acc.find(d => d.name === disease.name)) {
        acc.push({
          id: disease.id,
          name: disease.name,
          description: disease.description
        })
      }
      return acc
    }, [] as Array<{id: string, name: string, description: string | null}>)

    return NextResponse.json({
      success: true,
      data: uniqueDiseases,
      count: uniqueDiseases.length
    })
  } catch (error) {
    console.error('Error fetching diseases:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch diseases' },
      { status: 500 }
    )
  }
}