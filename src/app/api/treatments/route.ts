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

    const treatments = await prisma.treatment.findMany({
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

    // Get unique treatment names for dropdown
    const uniqueTreatments = treatments.reduce((acc, treatment) => {
      if (!acc.find(t => t.name === treatment.name)) {
        acc.push({
          id: treatment.id,
          name: treatment.name,
          description: treatment.description
        })
      }
      return acc
    }, [] as Array<{id: string, name: string, description: string | null}>)

    return NextResponse.json({
      success: true,
      data: uniqueTreatments,
      count: uniqueTreatments.length
    })
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch treatments' },
      { status: 500 }
    )
  }
}