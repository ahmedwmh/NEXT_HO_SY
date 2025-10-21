import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const hospitalId = searchParams.get('hospitalId')

    const whereClause: any = {}
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive' as const
      }
    }
    
    // Medications are linked to doctors, not hospitals directly
    // We'll filter by doctor's hospital if hospitalId is provided
    if (hospitalId) {
      whereClause.doctor = {
        hospitalId: { contains: hospitalId }
      }
    }

    const medications = await prisma.medication.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        dosage: true,
        frequency: true,
        duration: true,
        instructions: true,
        status: true,
        startDate: true,
        endDate: true,
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

    // Get unique medication names for dropdown
    const uniqueMedications = medications.reduce((acc, medication) => {
      if (!acc.find(m => m.name === medication.name)) {
        acc.push({
          id: medication.id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          duration: medication.duration,
          instructions: medication.instructions
        })
      }
      return acc
    }, [] as Array<{id: string, name: string, dosage: string | null, frequency: string | null, duration: string | null, instructions: string | null}>)

    return NextResponse.json({
      success: true,
      data: uniqueMedications,
      count: uniqueMedications.length
    })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const medication = await prisma.medication.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        visitId: data.visitId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'Active',
        notes: data.notes
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientNumber: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        visit: {
          select: {
            id: true,
            scheduledAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: medication
    })
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create medication' },
      { status: 500 }
    )
  }
}
