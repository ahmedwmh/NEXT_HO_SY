'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Pill, 
  Calendar, 
  User, 
  Clock, 
  Plus,
  Edit,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface PatientPrescriptionsProps {
  patientId: string
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  startDate: string
  endDate?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  doctor: {
    firstName: string
    lastName: string
  }
  notes?: string
}

export function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchPrescriptions()
  }, [patientId])

  const fetchPrescriptions = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your API
      const mockData: Prescription[] = [
        {
          id: '1',
          medication: 'أموكسيسيلين',
          dosage: '500 مجم',
          frequency: '3 مرات يومياً',
          duration: '7 أيام',
          instructions: 'يؤخذ مع الطعام',
          startDate: '2024-06-15',
          endDate: '2024-06-22',
          status: 'ACTIVE',
          doctor: {
            firstName: 'أحمد',
            lastName: 'محمد'
          },
          notes: 'متابعة الحالة بعد انتهاء العلاج'
        },
        {
          id: '2',
          medication: 'باراسيتامول',
          dosage: '1000 مجم',
          frequency: 'عند الحاجة',
          duration: '5 أيام',
          instructions: 'لا يتجاوز 4 جرعات يومياً',
          startDate: '2024-06-10',
          endDate: '2024-06-15',
          status: 'COMPLETED',
          doctor: {
            firstName: 'فاطمة',
            lastName: 'علي'
          }
        },
        {
          id: '3',
          medication: 'أوميبرازول',
          dosage: '20 مجم',
          frequency: 'مرة واحدة يومياً',
          duration: '30 يوم',
          instructions: 'يؤخذ على معدة فارغة',
          startDate: '2024-06-01',
          status: 'ACTIVE',
          doctor: {
            firstName: 'خالد',
            lastName: 'حسن'
          }
        }
      ]
      
      setPrescriptions(mockData)
    } catch (error) {
      console.error('خطأ في جلب الوصفات الطبية:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'نشط'
      case 'COMPLETED':
        return 'مكتمل'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredPrescriptions = selectedStatus === 'all' 
    ? prescriptions 
    : prescriptions.filter(prescription => prescription.status === selectedStatus)

  const statusOptions = [
    { value: 'all', label: 'جميع الوصفات' },
    { value: 'ACTIVE', label: 'نشط' },
    { value: 'COMPLETED', label: 'مكتمل' },
    { value: 'CANCELLED', label: 'ملغي' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل الوصفات الطبية...</div>
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
              <Pill className="h-5 w-5" />
              <span>الوصفات الطبية</span>
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
                وصفة جديدة
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد وصفات طبية متاحة</p>
            </CardContent>
          </Card>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Pill className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.medication}
                        </h3>
                        <Badge className={`text-xs ${getStatusColor(prescription.status)}`}>
                          {getStatusIcon(prescription.status)}
                          <span className="mr-1">{getStatusLabel(prescription.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="text-gray-600">الجرعة:</span>
                            <span className="font-medium">{prescription.dosage}</span>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="text-gray-600">التكرار:</span>
                            <span className="font-medium">{prescription.frequency}</span>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="text-gray-600">المدة:</span>
                            <span className="font-medium">{prescription.duration}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">تاريخ البداية:</span>
                            <span className="font-medium">{new Date(prescription.startDate).toLocaleDateString('ar-SA', { calendar: 'gregory' })}</span>
                          </div>
                          {prescription.endDate && (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">تاريخ النهاية:</span>
                              <span className="font-medium">{new Date(prescription.endDate).toLocaleDateString('ar-SA', { calendar: 'gregory' })}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">الطبيب:</span>
                            <span className="font-medium">د. {prescription.doctor.firstName} {prescription.doctor.lastName}</span>
                          </div>
                        </div>
                      </div>

                      {prescription.instructions && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">التعليمات:</h4>
                          <p className="text-sm text-gray-700">{prescription.instructions}</p>
                        </div>
                      )}

                      {prescription.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">ملاحظات الطبيب:</h4>
                          <p className="text-sm text-gray-700">{prescription.notes}</p>
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
                <p className="text-sm font-medium text-gray-600">إجمالي الوصفات</p>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الوصفات النشطة</p>
                <p className="text-2xl font-bold text-green-600">
                  {prescriptions.filter(p => p.status === 'ACTIVE').length}
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
                <p className="text-sm font-medium text-gray-600">الوصفات المكتملة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {prescriptions.filter(p => p.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الوصفات الملغية</p>
                <p className="text-2xl font-bold text-red-600">
                  {prescriptions.filter(p => p.status === 'CANCELLED').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
