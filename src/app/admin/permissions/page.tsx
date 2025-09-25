import PermissionsManagement from '@/components/admin/permissions-management'
import { SensitiveAdminGuard } from '@/lib/admin-guard'

export default function AdminPermissionsPage() {
  return (
    <SensitiveAdminGuard>
      <PermissionsManagement />
    </SensitiveAdminGuard>
  )
}
