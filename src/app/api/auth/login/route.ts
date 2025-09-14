import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true, staffProfile: true }
    })

    if (!user || user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctorProfile: user.doctorProfile,
        staffProfile: user.staffProfile,
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
