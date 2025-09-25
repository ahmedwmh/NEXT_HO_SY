'use client'

import { useState, useEffect } from 'react'
import { hasClientPermission, getCurrentUser } from '@/lib/client-permissions'
import type { ResourceType, PermissionType } from '@prisma/client'

interface UsePermissionsOptions {
  resource: ResourceType
  action: PermissionType
  hospitalId?: string
}

interface UsePermissionsResult {
  hasPermission: boolean
  loading: boolean
  error: string | null
}

/**
 * Hook للتحقق من صلاحيات المستخدم (نسخة مبسطة للعميل)
 */
export function usePermissions(options: UsePermissionsOptions): UsePermissionsResult {
  const [hasPermissionResult, setHasPermissionResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermission = () => {
      try {
        setLoading(true)
        setError(null)

        // جلب المستخدم الحالي
        const user = getCurrentUser()
        if (!user) {
          setError('المستخدم غير مسجل الدخول')
          setHasPermissionResult(false)
          return
        }

        const result = hasClientPermission({
          userId: user.id,
          resource: options.resource,
          action: options.action,
          hospitalId: options.hospitalId
        })

        setHasPermissionResult(result)
      } catch (err) {
        console.error('خطأ في التحقق من الصلاحية:', err)
        setError(err instanceof Error ? err.message : 'خطأ في التحقق من الصلاحيات')
        setHasPermissionResult(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermission()
  }, [options.resource, options.action, options.hospitalId])

  return {
    hasPermission: hasPermissionResult,
    loading,
    error
  }
}

/**
 * Hook للتحقق من صلاحيات متعددة
 */
export function useMultiplePermissions(permissions: UsePermissionsOptions[]) {
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermissions = () => {
      try {
        setLoading(true)
        setError(null)

        const user = getCurrentUser()
        if (!user) {
          setError('المستخدم غير مسجل الدخول')
          setLoading(false)
          return
        }

        const permissionResults: Record<string, boolean> = {}

        for (const permission of permissions) {
          const key = `${permission.resource}_${permission.action}`
          const allowed = hasClientPermission({
            userId: user.id,
            resource: permission.resource,
            action: permission.action,
            hospitalId: permission.hospitalId
          })
          permissionResults[key] = allowed
        }

        setResults(permissionResults)
      } catch (err) {
        console.error('خطأ في التحقق من الصلاحيات:', err)
        setError(err instanceof Error ? err.message : 'خطأ غير معروف')
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()
  }, [permissions])

  return {
    results,
    loading,
    error,
    hasPermission: (resource: ResourceType, action: PermissionType) => {
      const key = `${resource}_${action}`
      return results[key] || false
    }
  }
}

/**
 * Hook للتحقق من صلاحيات المستشفى
 */
export function useHospitalPermissions(hospitalId: string) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHospitalPermissions = () => {
      try {
        setLoading(true)
        setError(null)

        const user = getCurrentUser()
        if (!user) {
          setError('المستخدم غير مسجل الدخول')
          setLoading(false)
          return
        }

        // صلاحيات أساسية للمستشفى
        const hospitalPermissions = [
          { resource: 'PATIENTS' as ResourceType, action: 'READ' as PermissionType },
          { resource: 'PATIENTS' as ResourceType, action: 'WRITE' as PermissionType },
          { resource: 'VISITS' as ResourceType, action: 'READ' as PermissionType },
          { resource: 'VISITS' as ResourceType, action: 'WRITE' as PermissionType },
          { resource: 'TESTS' as ResourceType, action: 'READ' as PermissionType },
          { resource: 'TESTS' as ResourceType, action: 'WRITE' as PermissionType },
          { resource: 'TREATMENTS' as ResourceType, action: 'READ' as PermissionType },
          { resource: 'TREATMENTS' as ResourceType, action: 'WRITE' as PermissionType }
        ]

        const permissionResults: Record<string, boolean> = {}

        for (const permission of hospitalPermissions) {
          const key = `${permission.resource}_${permission.action}`
          const allowed = hasClientPermission({
            userId: user.id,
            resource: permission.resource,
            action: permission.action,
            hospitalId
          })
          permissionResults[key] = allowed
        }

        setPermissions(permissionResults)
      } catch (err) {
        console.error('خطأ في التحقق من صلاحيات المستشفى:', err)
        setError(err instanceof Error ? err.message : 'خطأ غير معروف')
      } finally {
        setLoading(false)
      }
    }

    if (hospitalId) {
      checkHospitalPermissions()
    }
  }, [hospitalId])

  return {
    permissions,
    loading,
    error,
    hasPermission: (resource: ResourceType, action: PermissionType) => {
      const key = `${resource}_${action}`
      return permissions[key] || false
    }
  }
}

/**
 * Hook للتحقق من صلاحية الإدمن
 */
export function useAdminPermissions() {
  return usePermissions({
    resource: 'USERS',
    action: 'MANAGE'
  })
}

/**
 * Hook للتحقق من صلاحيات الطبيب
 */
export function useDoctorPermissions(hospitalId?: string) {
  return useMultiplePermissions([
    { resource: 'PATIENTS', action: 'READ', hospitalId },
    { resource: 'PATIENTS', action: 'WRITE', hospitalId },
    { resource: 'VISITS', action: 'READ', hospitalId },
    { resource: 'VISITS', action: 'WRITE', hospitalId },
    { resource: 'TESTS', action: 'READ', hospitalId },
    { resource: 'TESTS', action: 'WRITE', hospitalId },
    { resource: 'TREATMENTS', action: 'READ', hospitalId },
    { resource: 'TREATMENTS', action: 'WRITE', hospitalId },
    { resource: 'PRESCRIPTIONS', action: 'READ', hospitalId },
    { resource: 'PRESCRIPTIONS', action: 'WRITE', hospitalId }
  ])
}