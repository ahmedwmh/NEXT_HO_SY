'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DoctorProvider } from '@/contexts/doctor-context'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  Settings,
  LogOut,
  Stethoscope,
  Activity,
  TestTube,
  Heart,
  Pill
} from 'lucide-react'

const navigation = [
  { name: 'لوحة التحكم', href: '/doctor', icon: LayoutDashboard },
  { name: 'المرضى', href: '/doctor/patients', icon: Users },
  { name: 'إضافة مريض', href: '/doctor/patients/new', icon: UserPlus },
  { name: 'العلاجات', href: '/doctor/treatments', icon: Pill },
  { name: 'الفحوصات', href: '/doctor/tests', icon: TestTube },
  { name: 'العمليات', href: '/doctor/operations', icon: Heart },
  { name: 'التقارير', href: '/doctor/reports', icon: FileText },
  { name: 'الإعدادات', href: '/doctor/settings', icon: Settings },
]

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // TODO: Get doctorId from authentication context
  const doctorId = 'cmfnt092h006l7szhg1lkb3ci' // This should come from auth

  return (
    <DoctorProvider doctorId={doctorId}>
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Stethoscope className="h-8 w-8 text-hospital-blue" />
            <h1 className="text-xl font-bold text-gray-900">نظام الأطباء</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            ×
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-hospital-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 ml-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // Handle logout
              window.location.href = '/auth/login'
            }}
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                ☰
              </Button>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-sm text-gray-500">مرحباً، د. أحمد محمد</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
    </DoctorProvider>
  )
}
