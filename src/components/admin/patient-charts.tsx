'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Heart, 
  TestTube, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface PatientChartsProps {
  patientId: string
}

interface ChartData {
  visits: Array<{
    date: string
    count: number
    type: string
  }>
  tests: Array<{
    date: string
    count: number
    status: string
  }>
  prescriptions: Array<{
    date: string
    count: number
    status: string
  }>
  vitalSigns: Array<{
    date: string
    bloodPressure: { systolic: number; diastolic: number }
    heartRate: number
    temperature: number
    weight: number
  }>
}

export function PatientCharts({ patientId }: PatientChartsProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6months')

  useEffect(() => {
    fetchChartData()
  }, [patientId, selectedPeriod])

  const fetchChartData = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your API
      const mockData: ChartData = {
        visits: [
          { date: '2024-01', count: 3, type: 'عام' },
          { date: '2024-02', count: 2, type: 'متابعة' },
          { date: '2024-03', count: 4, type: 'طوارئ' },
          { date: '2024-04', count: 1, type: 'عام' },
          { date: '2024-05', count: 3, type: 'متابعة' },
          { date: '2024-06', count: 2, type: 'عام' }
        ],
        tests: [
          { date: '2024-01', count: 5, status: 'مكتمل' },
          { date: '2024-02', count: 3, status: 'مكتمل' },
          { date: '2024-03', count: 7, status: 'مكتمل' },
          { date: '2024-04', count: 2, status: 'مكتمل' },
          { date: '2024-05', count: 4, status: 'مكتمل' },
          { date: '2024-06', count: 3, status: 'مكتمل' }
        ],
        prescriptions: [
          { date: '2024-01', count: 8, status: 'نشط' },
          { date: '2024-02', count: 5, status: 'نشط' },
          { date: '2024-03', count: 12, status: 'نشط' },
          { date: '2024-04', count: 3, status: 'نشط' },
          { date: '2024-05', count: 7, status: 'نشط' },
          { date: '2024-06', count: 4, status: 'نشط' }
        ],
        vitalSigns: [
          { date: '2024-01-15', bloodPressure: { systolic: 120, diastolic: 80 }, heartRate: 72, temperature: 36.5, weight: 70 },
          { date: '2024-02-15', bloodPressure: { systolic: 125, diastolic: 82 }, heartRate: 75, temperature: 36.7, weight: 71 },
          { date: '2024-03-15', bloodPressure: { systolic: 118, diastolic: 78 }, heartRate: 70, temperature: 36.4, weight: 69 },
          { date: '2024-04-15', bloodPressure: { systolic: 130, diastolic: 85 }, heartRate: 78, temperature: 36.8, weight: 72 },
          { date: '2024-05-15', bloodPressure: { systolic: 122, diastolic: 80 }, heartRate: 73, temperature: 36.6, weight: 70 },
          { date: '2024-06-15', bloodPressure: { systolic: 128, diastolic: 83 }, heartRate: 76, temperature: 36.9, weight: 71 }
        ]
      }
      
      setChartData(mockData)
    } catch (error) {
      console.error('خطأ في جلب بيانات الرسوم البيانية:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل':
      case 'نشط':
        return 'bg-green-100 text-green-800'
      case 'معلق':
        return 'bg-yellow-100 text-yellow-800'
      case 'ملغي':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل الرسوم البيانية...</div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد بيانات متاحة للعرض
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Activity className="h-5 w-5" />
            <span>الرسوم البيانية والتحليلات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 rtl:space-x-reverse">
            {[
              { value: '1month', label: 'شهر واحد' },
              { value: '3months', label: '3 أشهر' },
              { value: '6months', label: '6 أشهر' },
              { value: '1year', label: 'سنة واحدة' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-hospital-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الزيارات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.visits.reduce((sum, v) => sum + v.count, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(15, 12)}
              <span className="text-sm text-gray-600 mr-2">+25% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الفحوصات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.tests.reduce((sum, t) => sum + t.count, 0)}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(24, 20)}
              <span className="text-sm text-gray-600 mr-2">+20% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الوصفات الطبية</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.prescriptions.reduce((sum, p) => sum + p.count, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(39, 35)}
              <span className="text-sm text-gray-600 mr-2">+11% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل الزيارات</p>
                <p className="text-2xl font-bold text-gray-900">2.5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600 mr-2">معدل صحي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="h-5 w-5" />
              <span>الزيارات الشهرية</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.visits.map((visit, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{visit.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">{visit.count} زيارة</span>
                    <Badge variant="outline" className="text-xs">{visit.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tests Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <TestTube className="h-5 w-5" />
              <span>الفحوصات الطبية</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{test.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">{test.count} فحص</span>
                    <Badge className={`text-xs ${getStatusColor(test.status)}`}>
                      {test.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Heart className="h-5 w-5" />
              <span>العلامات الحيوية</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.vitalSigns.slice(-3).map((vital, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{vital.date}</span>
                    <Badge variant="outline" className="text-xs">آخر قياس</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ضغط الدم:</span>
                      <span className="font-medium mr-2">
                        {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">معدل النبض:</span>
                      <span className="font-medium mr-2">{vital.heartRate} bpm</span>
                    </div>
                    <div>
                      <span className="text-gray-600">درجة الحرارة:</span>
                      <span className="font-medium mr-2">{vital.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الوزن:</span>
                      <span className="font-medium mr-2">{vital.weight} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Activity className="h-5 w-5" />
              <span>الوصفات الطبية</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.prescriptions.map((prescription, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">{prescription.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">{prescription.count} وصفة</span>
                    <Badge className={`text-xs ${getStatusColor(prescription.status)}`}>
                      {prescription.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Heart className="h-5 w-5" />
            <span>ملخص الحالة الصحية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">الحالة العامة</h3>
              <p className="text-sm text-gray-600">مستقرة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">آخر زيارة</h3>
              <p className="text-sm text-gray-600">منذ 5 أيام</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">معدل النشاط</h3>
              <p className="text-sm text-gray-600">عادي</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
