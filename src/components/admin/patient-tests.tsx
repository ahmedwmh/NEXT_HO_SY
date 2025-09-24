'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TestTube, 
  Calendar, 
  User, 
  FileText, 
  Plus,
  Edit,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface PatientTestsProps {
  patientId: string
}

interface Test {
  id: string
  name: string
  type: 'blood' | 'urine' | 'imaging' | 'cardiac' | 'other'
  date: string
  doctor: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  results?: string
  normalRange?: string
  value?: string
  unit?: string
  notes?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export function PatientTests({ patientId }: PatientTestsProps) {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchTests()
  }, [patientId])

  const fetchTests = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your API
      const mockData: Test[] = [
        {
          id: '1',
          name: 'تحليل الدم الشامل',
          type: 'blood',
          date: '2024-06-15',
          doctor: 'د. أحمد محمد',
          status: 'completed',
          results: 'طبيعي',
          normalRange: 'طبيعي',
          value: 'طبيعي',
          unit: '',
          notes: 'جميع القيم ضمن المعدل الطبيعي',
          priority: 'medium'
        },
        {
          id: '2',
          name: 'تحليل السكر في الدم',
          type: 'blood',
          date: '2024-06-15',
          doctor: 'د. أحمد محمد',
          status: 'completed',
          results: 'مرتفع قليلاً',
          normalRange: '70-100 mg/dL',
          value: '110',
          unit: 'mg/dL',
          notes: 'يحتاج متابعة وربما تعديل النظام الغذائي',
          priority: 'high'
        },
        {
          id: '3',
          name: 'تحليل البول',
          type: 'urine',
          date: '2024-06-10',
          doctor: 'د. فاطمة علي',
          status: 'completed',
          results: 'طبيعي',
          normalRange: 'طبيعي',
          value: 'طبيعي',
          unit: '',
          notes: 'لا توجد علامات على وجود عدوى',
          priority: 'low'
        },
        {
          id: '4',
          name: 'تخطيط القلب',
          type: 'cardiac',
          date: '2024-06-20',
          doctor: 'د. خالد حسن',
          status: 'scheduled',
          results: '',
          normalRange: '',
          value: '',
          unit: '',
          notes: 'مجدول لفحص وظائف القلب',
          priority: 'medium'
        },
        {
          id: '5',
          name: 'أشعة سينية للصدر',
          type: 'imaging',
          date: '2024-06-18',
          doctor: 'د. نور الدين',
          status: 'in_progress',
          results: '',
          normalRange: '',
          value: '',
          unit: '',
          notes: 'جاري تحليل النتائج',
          priority: 'high'
        },
        {
          id: '6',
          name: 'تحليل الكوليسترول',
          type: 'blood',
          date: '2024-06-15',
          doctor: 'د. أحمد محمد',
          status: 'completed',
          results: 'مرتفع',
          normalRange: '< 200 mg/dL',
          value: '250',
          unit: 'mg/dL',
          notes: 'يحتاج علاج دوائي ومتابعة',
          priority: 'urgent'
        }
      ]
      
      setTests(mockData)
    } catch (error) {
      console.error('خطأ في جلب الفحوصات:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blood':
        return 'تحليل الدم'
      case 'urine':
        return 'تحليل البول'
      case 'imaging':
        return 'الأشعة'
      case 'cardiac':
        return 'القلب'
      case 'other':
        return 'أخرى'
      default:
        return 'فحص'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blood':
        return 'bg-red-100 text-red-800'
      case 'urine':
        return 'bg-yellow-100 text-yellow-800'
      case 'imaging':
        return 'bg-blue-100 text-blue-800'
      case 'cardiac':
        return 'bg-green-100 text-green-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدول'
      case 'in_progress':
        return 'جاري'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغي'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'منخفض'
      case 'medium':
        return 'متوسط'
      case 'high':
        return 'عالي'
      case 'urgent':
        return 'عاجل'
      default:
        return 'غير محدد'
    }
  }

  const getResultColor = (results: string) => {
    if (results.includes('طبيعي') || results.includes('طبيعي')) {
      return 'text-green-600'
    } else if (results.includes('مرتفع') || results.includes('منخفض') || results.includes('غير طبيعي')) {
      return 'text-red-600'
    } else {
      return 'text-gray-600'
    }
  }

  const filteredTests = selectedStatus === 'all' 
    ? tests 
    : tests.filter(test => test.status === selectedStatus)

  const statusOptions = [
    { value: 'all', label: 'جميع الفحوصات' },
    { value: 'scheduled', label: 'مجدولة' },
    { value: 'in_progress', label: 'جارية' },
    { value: 'completed', label: 'مكتملة' },
    { value: 'cancelled', label: 'ملغية' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل الفحوصات...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <TestTube className="h-5 w-5" />
              <span>الفحوصات الطبية</span>
            </CardTitle>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hospital-blue"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button size="sm" className="bg-hospital-blue hover:bg-hospital-darkBlue">
                <Plus className="h-4 w-4 ml-2" />
                فحص جديد
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد فحوصات متاحة</p>
            </CardContent>
          </Card>
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <TestTube className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {test.name}
                        </h3>
                        <Badge className={`text-xs ${getTypeColor(test.type)}`}>
                          {getTypeLabel(test.type)}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                          <span className="mr-1">{getStatusLabel(test.status)}</span>
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(test.priority)}`}>
                          {getPriorityLabel(test.priority)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(test.date).toLocaleDateString('ar-SA', { calendar: 'gregory' })}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="h-4 w-4" />
                          <span>د. {test.doctor}</span>
                        </div>
                      </div>

                      {test.status === 'completed' && test.results && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">النتائج:</h4>
                          <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <span className={`font-semibold ${getResultColor(test.results)}`}>
                              {test.results}
                            </span>
                            {test.value && test.unit && (
                              <span className="text-sm text-gray-600">
                                ({test.value} {test.unit})
                              </span>
                            )}
                          </div>
                          {test.normalRange && (
                            <p className="text-xs text-gray-500 mt-1">
                              المعدل الطبيعي: {test.normalRange}
                            </p>
                          )}
                        </div>
                      )}

                      {test.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">ملاحظات:</h4>
                          <p className="text-sm text-gray-700">{test.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الفحوصات</p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الفحوصات المكتملة</p>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الفحوصات المجدولة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tests.filter(t => t.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الفحوصات العاجلة</p>
                <p className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
