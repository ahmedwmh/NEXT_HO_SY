import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalPatients,
      totalHospitals,
      totalDoctors,
      totalStaff,
      totalVisits,
      totalTests,
      totalTreatments,
      totalOperations
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.hospital.count(),
      prisma.doctor.count(),
      prisma.staff.count(),
      prisma.visit.count(),
      prisma.test.count(),
      prisma.treatment.count(),
      prisma.operation.count()
    ])

    return NextResponse.json({
      totalPatients,
      totalHospitals,
      totalDoctors,
      totalStaff,
      totalVisits,
      totalTests,
      totalTreatments,
      totalOperations
    })
  } catch (error) {
    console.error('خطأ في جلب إحصائيات لوحة التحكم:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    )
  }
}