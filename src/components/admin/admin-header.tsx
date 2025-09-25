'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { MobileSidebar } from './admin-sidebar'
import { usePermissions } from '@/hooks/use-permissions'
import { Badge } from '@/components/ui/badge'
import { Shield, User, LogOut } from 'lucide-react'

export function AdminHeader() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // التحقق من صلاحيات الإدمن
  const { hasPermission, loading: permissionLoading } = usePermissions({
    resource: 'USERS',
    action: 'MANAGE'
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return (
    <header className="admin-header bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <MobileSidebar />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-hospital-blue truncate">
              نظام إدارة المستشفى الذكي
            </h1>
            <span className="hidden sm:inline-block bg-hospital-blue text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
              لوحة الإدارة
            </span>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="text-left rtl:text-right hidden sm:block">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'Admin User'
                  }
                </p>
                {!permissionLoading && hasPermission && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 ml-1" />
                    إدمن
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              <LogOut className="h-4 w-4 ml-1" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
