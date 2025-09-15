import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'ADMIN' | 'DOCTOR' | 'STAFF'
  doctorId?: string
  staffId?: string
  hospitalId?: string
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // In a real application, you would get this from JWT token or session
    // For now, we'll simulate by checking if there's a user header or use a default
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      // For development, return a default admin user
      return {
        id: 'admin-user',
        email: 'admin@hospital.com',
        role: 'ADMIN'
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: {
          select: {
            id: true,
            hospitalId: true
          }
        },
        staffProfile: {
          select: {
            id: true,
            hospitalId: true
          }
        }
      }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorId: user.doctorProfile?.id,
      staffId: user.staffProfile?.id,
      hospitalId: user.doctorProfile?.hospitalId || user.staffProfile?.hospitalId
    }
  } catch (error) {
    console.error('خطأ في المصادقة:', error)
    return null
  }
}

export function hasPermission(user: AuthenticatedUser | null, requiredRole: 'ADMIN' | 'DOCTOR' | 'STAFF'): boolean {
  if (!user) return false
  
  const roleHierarchy = {
    'ADMIN': 3,
    'DOCTOR': 2,
    'STAFF': 1
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function canAccessHospital(user: AuthenticatedUser | null, hospitalId: string): boolean {
  if (!user) return false
  
  // Admin can access all hospitals
  if (user.role === 'ADMIN') return true
  
  // Doctor and Staff can only access their own hospital
  return user.hospitalId === hospitalId
}
