'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Activity, 
  TestTube, 
  Heart, 
  FileText,
  Calendar,
  Phone,
  Clock,
  AlertCircle,
  Briefcase
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingTasks: number
  completedTasks: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    time: string
    status: string
  }>
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingTasks: 0,
    completedTasks: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would fetch from API with employee's hospital filter
      setStats({
        totalPatients: 32,
        todayAppointments: 12,
        pendingTasks: 8,
        completedTasks: 15,
        recentActivity: [
          {
            id: '1',
            type: 'appointment',
            description: 'موعد جديد - أحمد محمد',
            time: '10:30 ص',
            status: 'scheduled'
          },
          {
            id: '2',
            type: 'patient',
            description: 'تسجيل مريض جديد - فاطمة علي',
            time: '09:15 ص',
            status: 'completed'
          },
          {
            id: '3',
            type: 'call',
            description: 'مكالمة هاتفية - محمد حسن',
            time: '08:45 ص',
            status: 'completed'
          },
          {
            id: '4',
            type: 'task',
            description: 'تحديث بيانات المريض',
            time: '08:00 ص',
            status: 'pending'
          }
        ]
      })
    } catch (error) {
      console.error('خطأ في جلب بيانات لوحة التحكم:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-4 w-4" />
      case 'patient': return <Users className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'task': return <Briefcase className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الموظف</h1>
        <p className="text-gray-600 mt-2">مرحباً بك في نظام إدارة المستشفى</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المرضى</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">مواعيد اليوم</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">مهام معلقة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">مهام مكتملة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>عرض المرضى</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>إدارة المواعيد</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Phone className="h-6 w-6" />
              <span>المكالمات</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>التقارير</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 ml-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status === 'completed' && 'مكتمل'}
                  {activity.status === 'pending' && 'معلق'}
                  {activity.status === 'scheduled' && 'مجدول'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
