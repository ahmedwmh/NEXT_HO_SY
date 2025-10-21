'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PermissionGuard } from '@/components/ui/permission-guard'
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Building,
  UserCheck,
  UserPlus,
  FileText,
  Calendar,
  TestTube,
  Stethoscope,
  Activity,
  Menu,
  Shield,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface NavigationItem {
  name: string
  href: string
  icon: any
  submenu?: NavigationItem[]
  requiredPermission?: {
    resource: 'USERS' | 'HOSPITALS' | 'CITIES' | 'PATIENTS' | 'VISITS' | 'TESTS' | 'TREATMENTS' | 'OPERATIONS' | 'DISEASES' | 'REPORTS' | 'SETTINGS'
    action: 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
  }
}

const navigation: NavigationItem[] = [
  { 
    name: 'لوحة التحكم', 
    href: '/admin', 
    icon: LayoutDashboard,
    requiredPermission: { resource: 'USERS', action: 'READ' }
  },
  { 
    name: 'المدن', 
    href: '/admin/cities', 
    icon: MapPin,
    requiredPermission: { resource: 'CITIES', action: 'MANAGE' }
  },
  { 
    name: 'المستشفيات', 
    href: '/admin/hospitals', 
    icon: Building,
    requiredPermission: { resource: 'HOSPITALS', action: 'MANAGE' }
  },
  { 
    name: 'الأطباء', 
    href: '/admin/doctors', 
    icon: UserCheck,
    requiredPermission: { resource: 'USERS', action: 'MANAGE' }
  },
  { 
    name: 'الموظفين', 
    href: '/admin/staff', 
    icon: UserPlus,
    requiredPermission: { resource: 'USERS', action: 'MANAGE' }
  },
  { 
    name: 'المرضى', 
    href: '/admin/patients', 
    icon: Users,
    requiredPermission: { resource: 'PATIENTS', action: 'READ' }
  },
  { 
    name: 'الأمراض', 
    href: '/admin/diseases', 
    icon: Heart,
    requiredPermission: { resource: 'DISEASES', action: 'READ' }
  },
  { 
    name: 'التقارير', 
    href: '/admin/reports', 
    icon: FileText,
    requiredPermission: { resource: 'REPORTS', action: 'READ' }
  },
  { 
    name: 'إدارة الصلاحيات', 
    href: '/admin/permissions', 
    icon: Shield,
    requiredPermission: { resource: 'USERS', action: 'MANAGE' }
  },
]

interface ProtectedSidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export function ProtectedAdminSidebar({ isMobile = false, onClose }: ProtectedSidebarProps) {
  const pathname = usePathname()

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = pathname === item.href
    const hasSubmenu = item.submenu && item.submenu.length > 0

    if (hasSubmenu) {
      return (
        <PermissionGuard
          key={item.name}
          resource={item.requiredPermission!.resource}
          action={item.requiredPermission!.action}
          fallback={null}
        >
          <div className="space-y-1">
            <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
              <item.icon className="h-5 w-5 ml-3" />
              {item.name}
            </div>
            <div className="mr-6 space-y-1">
              {item.submenu!.map((subItem) => (
                <PermissionGuard
                  key={subItem.name}
                  resource={subItem.requiredPermission!.resource}
                  action={subItem.requiredPermission!.action}
                  fallback={null}
                >
                  <Link
                    href={subItem.href}
                    onClick={isMobile ? onClose : undefined}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm rounded-lg transition-colors',
                      pathname === subItem.href
                        ? 'bg-hospital-blue text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <subItem.icon className="h-4 w-4 ml-2" />
                    {subItem.name}
                  </Link>
                </PermissionGuard>
              ))}
            </div>
          </div>
        </PermissionGuard>
      )
    }

    return (
      <PermissionGuard
        key={item.name}
        resource={item.requiredPermission!.resource}
        action={item.requiredPermission!.action}
        fallback={null}
      >
        <Link
          href={item.href}
          onClick={isMobile ? onClose : undefined}
          className={cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            isActive
              ? 'bg-hospital-blue text-white'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <item.icon className="h-5 w-5 ml-3" />
          {item.name}
        </Link>
      </PermissionGuard>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Building2 className="h-8 w-8 text-hospital-blue" />
          <h1 className="text-xl font-bold text-gray-900">لوحة الإدارة</h1>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ×
          </Button>
        )}
      </div>

      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          نظام إدارة المستشفى الذكي
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg">
      {sidebarContent}
    </div>
  )
}
