'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { MobileSidebar } from './admin-sidebar'

export function AdminHeader() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
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
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email || 'Admin User'
                }
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
