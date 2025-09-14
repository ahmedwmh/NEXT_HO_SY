import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 w-full" dir="rtl">
      <AdminHeader />
      <AdminSidebar />
      <main className="admin-main pt-16 pr-64 pl-0 rtl:pr-64 rtl:pl-0 min-h-screen w-full">
        <div className="admin-content p-4 lg:p-6 w-full max-w-none">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
