import { prisma } from './db'
import { UserRole } from '@prisma/client'
import { AuthUser } from '@/types'

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
}

export function createAuthContext(user: AuthUser | null): AuthContext {
  return {
    user,
    isAuthenticated: !!user,
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    // In a real implementation, you would verify the JWT token here
    // For now, we'll simulate by looking up the user by ID
    const userId = token // Assuming token contains user ID for simplicity
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        staffProfile: true,
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorProfile: user.doctorProfile || undefined,
      staffProfile: user.staffProfile || undefined,
    }
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

export function requireAuth(context: AuthContext): AuthUser {
  if (!context.isAuthenticated || !context.user) {
    throw new Error('Authentication required')
  }
  return context.user
}

export function requireRole(context: AuthContext, allowedRoles: UserRole[]): AuthUser {
  const user = requireAuth(context)
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}

export function requireAdmin(context: AuthContext): AuthUser {
  return requireRole(context, ['ADMIN'])
}

export function requireDoctorOrAdmin(context: AuthContext): AuthUser {
  return requireRole(context, ['ADMIN', 'DOCTOR'])
}

export function requireStaffOrAdmin(context: AuthContext): AuthUser {
  return requireRole(context, ['ADMIN', 'DOCTOR', 'STAFF'])
}

export function canAccessHospital(user: AuthUser, hospitalId: string): boolean {
  if (user.role === 'ADMIN') return true
  
  if (user.role === 'DOCTOR' && user.doctorProfile?.hospitalId === hospitalId) return true
  if (user.role === 'STAFF' && user.staffProfile?.hospitalId === hospitalId) return true
  
  return false
}

export function requireHospitalAccess(context: AuthContext, hospitalId: string): AuthUser {
  const user = requireAuth(context)
  
  if (!canAccessHospital(user, hospitalId)) {
    throw new Error('Access denied to this hospital')
  }
  
  return user
}

