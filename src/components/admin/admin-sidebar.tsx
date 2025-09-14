'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
  Settings,
  Menu,
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

const navigation = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { name: 'المدن', href: '/admin/cities', icon: MapPin },
  { name: 'المستشفيات', href: '/admin/hospitals', icon: Building },
  { name: 'الأطباء', href: '/admin/doctors', icon: UserCheck },
  { name: 'الموظفين', href: '/admin/staff', icon: UserPlus },
  { name: 'المرضى', href: '/admin/patients', icon: Users },
  { name: 'الزيارات', href: '/admin/visits', icon: Calendar },
  { name: 'الفحوصات', href: '/admin/tests', icon: TestTube },
  { name: 'العلاجات', href: '/admin/treatments', icon: Stethoscope },
  { name: 'العمليات', href: '/admin/operations', icon: Activity },
  { name: 'الأمراض', href: '/admin/diseases', icon: Activity },
  { name: 'الوصفات الطبية', href: '/admin/prescriptions', icon: FileText },
  { name: 'التقارير', href: '/admin/reports', icon: FileText },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isMobile = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <nav className="mt-8 px-4">
      <ul className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-hospital-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="ml-3 h-5 w-5 rtl:ml-0 rtl:mr-3" />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  if (isMobile) {
    return <SidebarContent />
  }

  return (
    <div className="admin-sidebar bg-white shadow-lg hidden lg:block">
      <SidebarContent />
    </div>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>القائمة</SheetTitle>
          <SheetDescription>
            اختر الصفحة التي تريد الانتقال إليها
          </SheetDescription>
        </SheetHeader>
        <AdminSidebar isMobile={true} />
      </SheetContent>
    </Sheet>
  )
}
