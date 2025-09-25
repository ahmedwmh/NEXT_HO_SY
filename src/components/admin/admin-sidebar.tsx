'use client'

import { ProtectedAdminSidebar } from './protected-sidebar'

interface AdminSidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isMobile = false, onClose }: AdminSidebarProps) {
  return <ProtectedAdminSidebar isMobile={isMobile} onClose={onClose} />
}

export function MobileSidebar() {
  return <ProtectedAdminSidebar isMobile={true} />
}