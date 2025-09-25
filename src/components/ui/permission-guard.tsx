'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { hasClientPermission, getCurrentUser } from '@/lib/client-permissions'
import type { ResourceType, PermissionType } from '@prisma/client'

interface PermissionGuardProps {
  resource: ResourceType
  action: PermissionType
  hospitalId?: string
  children: ReactNode
  fallback?: ReactNode
  loading?: ReactNode
  error?: ReactNode
}

/**
 * كومبوننت للتحكم في عرض العناصر حسب الصلاحيات
 */
export function PermissionGuard({
  resource,
  action,
  hospitalId,
  children,
  fallback = null,
  loading = <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>,
  error = <div className="text-red-500 text-sm">خطأ في تحميل الصلاحيات</div>
}: PermissionGuardProps) {
  const { hasPermission, loading: isLoading, error: permissionError } = usePermissions({
    resource,
    action,
    hospitalId
  })

  if (isLoading) {
    return <>{loading}</>
  }

  if (permissionError) {
    return <>{error}</>
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * كومبوننت للتحكم في عرض الأزرار حسب الصلاحيات
 */
interface PermissionButtonProps extends PermissionGuardProps {
  className?: string
  disabled?: boolean
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function PermissionButton({
  resource,
  action,
  hospitalId,
  children,
  fallback,
  loading,
  error,
  className,
  disabled,
  onClick,
  variant = 'default',
  size = 'default',
  ...props
}: PermissionButtonProps) {
  const { hasPermission, loading: isLoading, error: permissionError } = usePermissions({
    resource,
    action,
    hospitalId
  })

  if (isLoading) {
    return (
      <div className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}>
        {loading}
      </div>
    )
  }

  if (permissionError) {
    return <>{error}</>
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * كومبوننت للتحكم في عرض الأقسام حسب الصلاحيات
 */
interface PermissionSectionProps extends PermissionGuardProps {
  title?: string
  className?: string
}

export function PermissionSection({
  resource,
  action,
  hospitalId,
  children,
  fallback,
  loading,
  error,
  title,
  className = ''
}: PermissionSectionProps) {
  const { hasPermission, loading: isLoading, error: permissionError } = usePermissions({
    resource,
    action,
    hospitalId
  })

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="space-y-2">
          {loading}
        </div>
      </div>
    )
  }

  if (permissionError) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  )
}

/**
 * Hook للتحقق من صلاحيات متعددة في كومبوننت واحد
 */
interface UseMultiplePermissionGuardProps {
  permissions: Array<{
    resource: ResourceType
    action: PermissionType
    hospitalId?: string
  }>
  children: (permissions: Record<string, boolean>) => ReactNode
  fallback?: ReactNode
  loading?: ReactNode
  error?: ReactNode
}

export function MultiplePermissionGuard({
  permissions,
  children,
  fallback = null,
  loading = <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>,
  error = <div className="text-red-500 text-sm">خطأ في تحميل الصلاحيات</div>
}: UseMultiplePermissionGuardProps) {
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermissions = () => {
      try {
        setIsLoading(true)
        const permissionResults: Record<string, boolean> = {}
        
        // Get current user
        const user = getCurrentUser()
        if (!user) {
          setPermissionError('المستخدم غير مسجل الدخول')
          return
        }

        for (const permission of permissions) {
          const hasPermissionResult = hasClientPermission({
            userId: user.id,
            resource: permission.resource,
            action: permission.action,
            hospitalId: permission.hospitalId
          })
          permissionResults[`${permission.resource}-${permission.action}`] = hasPermissionResult
        }
        
        setResults(permissionResults)
      } catch (err) {
        setPermissionError(err instanceof Error ? err.message : 'خطأ في التحقق من الصلاحيات')
      } finally {
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [permissions])

  if (isLoading) {
    return <>{loading}</>
  }

  if (permissionError) {
    return <>{error}</>
  }

  // التحقق من وجود صلاحية واحدة على الأقل
  const hasAnyPermission = Object.values(results).some(Boolean)

  if (!hasAnyPermission) {
    return <>{fallback}</>
  }

  return <>{children(results)}</>
}
