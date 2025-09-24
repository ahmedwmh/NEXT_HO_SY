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
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  todayVisits: number
  pendingTests: number
  scheduledOperations: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    time: string
    status: string
  }>
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayVisits: 0,
    pendingTests: 0,
    scheduledOperations: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would fetch from API with doctor's hospital filter
      setStats({
        totalPatients: 45,
        todayVisits: 8,
        pendingTests: 12,
        scheduledOperations: 3,
        recentActivity: [
          {
            id: '1',
            type: 'visit',
            description: 'زيارة جديدة - أحمد محمد',
            time: '10:30 ص',
            status: 'completed'
          },
          {
            id: '2',
            type: 'test',
            description: 'نتائج فحص الدم - فاطمة علي',
            time: '09:15 ص',
            status: 'pending'
          },
          {
            id: '3',
            type: 'operation',
            description: 'عملية جراحية - محمد حسن',
            time: '08:00 ص',
            status: 'scheduled'
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
      case 'visit': return <Activity className="h-4 w-4" />
      case 'test': return <TestTube className="h-4 w-4" />
      case 'operation': return <Heart className="h-4 w-4" />
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
        <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الطبيب</h1>
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
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">زيارات اليوم</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TestTube className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">فحوصات معلقة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">عمليات مجدولة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledOperations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


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
