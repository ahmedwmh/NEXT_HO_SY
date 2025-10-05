'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'
import { 
  Users, 
  Activity, 
  TestTube, 
  Heart, 
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
  Pill,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  todayVisits: number
  pendingTests: number
  scheduledOperations: number
  totalTreatments: number
  totalHospitalTests: number
  totalHospitalOperations: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    time: string
    status: string
  }>
}

export default function DoctorDashboard() {
  const { hospitalId, loading: doctorLoading, error: doctorError } = useDoctorDataFilter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayVisits: 0,
    pendingTests: 0,
    scheduledOperations: 0,
    totalTreatments: 0,
    totalHospitalTests: 0,
    totalHospitalOperations: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hospitalId && !doctorLoading) {
      fetchDashboardData()
    }
  }, [hospitalId, doctorLoading])

  const fetchDashboardData = async () => {
    if (!hospitalId) return
    
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [
        patientsResponse,
        visitsResponse,
        testsResponse,
        operationsResponse,
        treatmentsResponse,
        hospitalTestsResponse,
        hospitalOperationsResponse
      ] = await Promise.all([
        fetch(`/api/patients?hospitalId=${hospitalId}&limit=1`),
        fetch(`/api/visits?hospitalId=${hospitalId}&limit=1`),
        fetch(`/api/tests?hospitalId=${hospitalId}&limit=1`),
        fetch(`/api/operations?hospitalId=${hospitalId}&limit=1`),
        fetch(`/api/treatments?hospitalId=${hospitalId}&limit=1`),
        fetch(`/api/hospital-tests?hospitalId=${hospitalId}&limit=1`),
        fetch(`/api/hospital-operations?hospitalId=${hospitalId}&limit=1`)
      ])

      const [
        patientsData,
        visitsData,
        testsData,
        operationsData,
        treatmentsData,
        hospitalTestsData,
        hospitalOperationsData
      ] = await Promise.all([
        patientsResponse.json(),
        visitsResponse.json(),
        testsResponse.json(),
        operationsResponse.json(),
        treatmentsResponse.json(),
        hospitalTestsResponse.json(),
        hospitalOperationsResponse.json()
      ])

      // Get today's date for filtering today's visits
      const today = new Date().toISOString().split('T')[0]
      
      // Count today's visits
      const todayVisitsResponse = await fetch(`/api/visits?hospitalId=${hospitalId}&date=${today}`)
      const todayVisitsData = await todayVisitsResponse.json()
      
      // Count pending tests
      const pendingTestsResponse = await fetch(`/api/tests?hospitalId=${hospitalId}&status=SCHEDULED`)
      const pendingTestsData = await pendingTestsResponse.json()
      
      // Count scheduled operations
      const scheduledOpsResponse = await fetch(`/api/operations?hospitalId=${hospitalId}&status=SCHEDULED`)
      const scheduledOpsData = await scheduledOpsResponse.json()

      setStats({
        totalPatients: patientsData.pagination?.total || 0,
        todayVisits: todayVisitsData.pagination?.total || 0,
        pendingTests: pendingTestsData.pagination?.total || 0,
        scheduledOperations: scheduledOpsData.pagination?.total || 0,
        totalTreatments: treatmentsData.pagination?.total || 0,
        totalHospitalTests: hospitalTestsData.pagination?.total || 0,
        totalHospitalOperations: hospitalOperationsData.pagination?.total || 0,
        recentActivity: [
          {
            id: '1',
            type: 'visit',
            description: `إجمالي المرضى: ${patientsData.pagination?.total || 0}`,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            status: 'completed'
          },
          {
            id: '2',
            type: 'test',
            description: `فحوصات معلقة: ${pendingTestsData.pagination?.total || 0}`,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            status: 'pending'
          },
          {
            id: '3',
            type: 'operation',
            description: `عمليات مجدولة: ${scheduledOpsData.pagination?.total || 0}`,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
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

  if (doctorLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">جاري تحميل بيانات لوحة التحكم...</div>
        </div>
      </div>
    )
  }

  if (doctorError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg text-red-600">خطأ في تحميل بيانات الطبيب</div>
          <p className="text-gray-600 mt-2">{doctorError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الطبيب</h1>
          <p className="text-gray-600 mt-2">مرحباً بك في نظام إدارة المستشفى</p>
        </div>
        <Button 
          onClick={fetchDashboardData} 
          disabled={loading}
          variant="outline"
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </Button>
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

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">العلاجات المتاحة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTreatments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TestTube className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">فحوصات المستشفى</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHospitalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">عمليات المستشفى</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHospitalOperations}</p>
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
