'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UniversalSearch } from '@/components/ui/universal-search'
import { 
  Users, 
  Building, 
  UserCheck, 
  Activity, 
  Calendar, 
  TestTube, 
  Stethoscope, 
  FileText,
  Plus,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  Heart,
  Pill,
  MapPin,
  Settings,
  BarChart3,
  Download,
  Printer,
  Share2
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  totalHospitals: number
  totalDoctors: number
  totalStaff: number
  totalVisits: number
  totalTests: number
  totalTreatments: number
  totalOperations: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalHospitals: 0,
    totalDoctors: 0,
    totalStaff: 0,
    totalVisits: 0,
    totalTests: 0,
    totalTreatments: 0,
    totalOperations: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (response.ok && data) {
        setStats(data)
      } else {
        console.error('خطأ في جلب الإحصائيات:', data.error || 'خطأ غير معروف')
        // Keep default stats on error
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error)
      // Keep default stats on error
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  const quickActions = [
    {
      id: 'new-patient',
      label: 'إضافة مريض جديد',
      description: 'تسجيل مريض جديد في النظام',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/admin/patients/new'
    },
    {
      id: 'view-patients',
      label: 'عرض المرضى',
      description: 'عرض وإدارة قائمة المرضى',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: '/admin/patients'
    },
    {
      id: 'view-doctors',
      label: 'عرض الأطباء',
      description: 'عرض وإدارة قائمة الأطباء',
      icon: UserCheck,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/admin/doctors'
    },
    {
      id: 'view-hospitals',
      label: 'عرض المستشفيات',
      description: 'عرض وإدارة قائمة المستشفيات',
      icon: Building,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/admin/hospitals'
    },
    {
      id: 'view-cities',
      label: 'عرض المدن',
      description: 'عرض وإدارة قائمة المدن',
      icon: MapPin,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      href: '/admin/cities'
    },
    {
      id: 'view-staff',
      label: 'عرض الموظفين',
      description: 'عرض وإدارة قائمة الموظفين',
      icon: Users,
      color: 'bg-gray-500 hover:bg-gray-600',
      href: '/admin/staff'
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'patient',
      title: 'تم تسجيل مريض جديد',
      description: 'أحمد محمد - رقم المريض: P001',
      time: 'منذ 5 دقائق',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'visit',
      title: 'زيارة طبية مكتملة',
      description: 'زيارة د. فاطمة علي - مريض: سارة أحمد',
      time: 'منذ 15 دقيقة',
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      id: '3',
      type: 'test',
      title: 'نتائج فحص جاهزة',
      description: 'تحليل الدم - مريض: محمد حسن',
      time: 'منذ 30 دقيقة',
      icon: TestTube,
      color: 'text-orange-500'
    },
    {
      id: '4',
      type: 'prescription',
      title: 'وصفة طبية جديدة',
      description: 'د. خالد محمد - مريض: نور الدين',
      time: 'منذ ساعة',
      icon: Pill,
      color: 'text-purple-500'
    }
  ]

  const handleQuickAction = (href: string) => {
    router.push(href)
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600">مرحباً بك في نظام إدارة المستشفى الذكي</p>
        </div>
        <div className="w-full lg:w-96">
          <UniversalSearch placeholder="البحث في جميع البيانات..." />
        </div>
      </div>

      {/* Quick Actions */}
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
                  onClick={() => handleQuickAction(action.href)}
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

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/patients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المرضى</CardTitle>
            <Users className="h-4 w-4 text-hospital-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hospital-blue">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              مرضى مسجلين في النظام
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 mr-1">+12% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/hospitals')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستشفيات</CardTitle>
            <Building className="h-4 w-4 text-hospital-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hospital-blue">{stats.totalHospitals}</div>
            <p className="text-xs text-muted-foreground">
              مستشفى في النظام
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 mr-1">+5% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/doctors')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأطباء</CardTitle>
            <UserCheck className="h-4 w-4 text-hospital-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hospital-blue">{stats.totalDoctors}</div>
            <p className="text-xs text-muted-foreground">
              طبيب في النظام
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 mr-1">+8% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/staff')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
            <Users className="h-4 w-4 text-hospital-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hospital-blue">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              موظف في النظام
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 mr-1">+3% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/patients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الزيارات</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              زيارة طبية
            </p>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-600 mr-1">15 زيارة اليوم</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/patients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفحوصات</CardTitle>
            <TestTube className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              فحص طبي
            </p>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 mr-1">8 نتائج في الانتظار</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/patients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العلاجات</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTreatments}</div>
            <p className="text-xs text-muted-foreground">
              علاج طبي
            </p>
            <div className="flex items-center mt-2">
              <Heart className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-600 mr-1">5 علاجات نشطة</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/patients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمليات</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalOperations}</div>
            <p className="text-xs text-muted-foreground">
              عملية جراحية
            </p>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-orange-600 mr-1">2 عمليات مجدولة</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Quick Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="h-5 w-5" />
              <span>الأنشطة الأخيرة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className={`flex-shrink-0 ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <BarChart3 className="h-5 w-5" />
              <span>التقارير السريعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 ml-2" />
                تقرير المرضى الشهري
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 ml-2" />
                تقرير الزيارات اليومية
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 ml-2" />
                تقرير الفحوصات المعلقة
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 ml-2" />
                تقرير الأداء الشامل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
