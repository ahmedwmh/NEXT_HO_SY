'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger',
  loading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const typeStyles = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-yellow-600 bg-yellow-50',
    info: 'text-blue-600 bg-blue-50'
  }

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center space-x-3 rtl:space-x-reverse p-4 rounded-lg ${typeStyles[type]}`}>
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">{message}</p>
            </div>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                {cancelText}
              </Button>
              <Button 
                onClick={onConfirm}
                className={buttonStyles[type]}
                disabled={loading}
              >
                {loading ? 'جاري المعالجة...' : confirmText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
