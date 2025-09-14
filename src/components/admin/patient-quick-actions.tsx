'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Calendar, 
  TestTube, 
  Pill, 
  FileText, 
  Activity,
  Stethoscope,
  Heart,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  Edit,
  Eye
} from 'lucide-react'

interface PatientQuickActionsProps {
  patientId: string
}

export function PatientQuickActions({ patientId }: PatientQuickActionsProps) {
  const quickActions = [
    {
      id: 'new-visit',
      label: 'زيارة جديدة',
      description: 'إضافة زيارة طبية جديدة',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: `/admin/patients/${patientId}/visits/new`
    },
    {
      id: 'new-test',
      label: 'فحص جديد',
      description: 'إضافة فحص طبي جديد',
      icon: TestTube,
      color: 'bg-green-500 hover:bg-green-600',
      href: `/admin/patients/${patientId}/tests/new`
    },
    {
      id: 'new-prescription',
      label: 'وصفة طبية',
      description: 'إضافة وصفة طبية جديدة',
      icon: Pill,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: `/admin/patients/${patientId}/prescriptions/new`
    },
    {
      id: 'new-treatment',
      label: 'علاج جديد',
      description: 'إضافة علاج طبي جديد',
      icon: Stethoscope,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: `/admin/patients/${patientId}/treatments/new`
    },
    {
      id: 'new-operation',
      label: 'عملية جراحية',
      description: 'إضافة عملية جراحية جديدة',
      icon: Activity,
      color: 'bg-red-500 hover:bg-red-600',
      href: `/admin/patients/${patientId}/operations/new`
    },
    {
      id: 'medical-report',
      label: 'تقرير طبي',
      description: 'إنشاء تقرير طبي شامل',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      href: `/admin/patients/${patientId}/reports/new`
    }
  ]

  const secondaryActions = [
    {
      id: 'edit-patient',
      label: 'تعديل البيانات',
      icon: Edit,
      href: `/admin/patients/${patientId}/edit`
    },
    {
      id: 'view-history',
      label: 'عرض التاريخ',
      icon: Eye,
      href: `/admin/patients/${patientId}?tab=medical`
    },
    {
      id: 'download-report',
      label: 'تحميل التقرير',
      icon: Download,
      href: `/admin/patients/${patientId}/download`
    },
    {
      id: 'print-summary',
      label: 'طباعة الملخص',
      icon: Printer,
      href: `/admin/patients/${patientId}/print`
    },
    {
      id: 'share-profile',
      label: 'مشاركة الملف',
      icon: Share2,
      href: `/admin/patients/${patientId}/share`
    }
  ]

  const handleActionClick = (href: string) => {
    // In a real app, you would navigate to the href
    console.log('Navigating to:', href)
    // For now, we'll just show an alert
    alert(`سيتم الانتقال إلى: ${href}`)
  }

  return (
    <div className="space-y-6">
      {/* Primary Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Plus className="h-5 w-5" />
            <span>إجراءات سريعة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  onClick={() => handleActionClick(action.href)}
                  className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2 rtl:space-y-reverse`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{action.label}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <FileText className="h-5 w-5" />
            <span>إجراءات إضافية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {secondaryActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleActionClick(action.href)}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>إجراءات الطوارئ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>تنبيه طبي</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Heart className="h-4 w-4" />
              <span>حالة طوارئ</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Activity className="h-4 w-4" />
              <span>إسعاف فوري</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
