import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const totalPatients = await prisma.patient.count()
    const totalHospitals = await prisma.hospital.count()
    const totalDoctors = await prisma.doctor.count()
    const totalStaff = await prisma.staff.count()

    return NextResponse.json({
      totalPatients,
      totalHospitals,
      totalDoctors,
      totalStaff,
      totalVisits: 0,
      totalTests: 0,
      totalTreatments: 0,
      totalOperations: 0
    })
  } catch (error) {
    console.error('خطأ في جلب إحصائيات لوحة التحكم:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    )
  }
}