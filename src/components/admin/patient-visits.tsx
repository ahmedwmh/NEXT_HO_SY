'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  Plus,
  Edit,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface PatientVisitsProps {
  patientId: string
}

interface Visit {
  id: string
  date: string
  time: string
  doctor: string
  doctorSpecialty: string
  type: 'general' | 'followup' | 'emergency' | 'consultation'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  diagnosis?: string
  symptoms?: string
  treatment?: string
  notes?: string
  vitalSigns?: {
    bloodPressure: string
    heartRate: number
    temperature: number
    weight: number
  }
}

export function PatientVisits({ patientId }: PatientVisitsProps) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchVisits()
  }, [patientId])

  const fetchVisits = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your API
      const mockData: Visit[] = [
        {
          id: '1',
          date: '2024-06-15',
          time: '10:00',
          doctor: 'د. أحمد محمد',
          doctorSpecialty: 'أمراض القلب',
          type: 'followup',
          status: 'completed',
          diagnosis: 'ارتفاع ضغط الدم',
          symptoms: 'صداع، دوخة، تعب',
          treatment: 'تعديل جرعة الدواء',
          notes: 'المريض يستجيب جيداً للعلاج',
          vitalSigns: {
            bloodPressure: '130/85',
            heartRate: 75,
            temperature: 36.5,
            weight: 70
          }
        },
        {
          id: '2',
          date: '2024-06-10',
          time: '14:30',
          doctor: 'د. فاطمة علي',
          doctorSpecialty: 'الباطنية',
          type: 'general',
          status: 'completed',
          diagnosis: 'نزلة برد',
          symptoms: 'سعال، سيلان الأنف، حرارة خفيفة',
          treatment: 'راحة، سوائل، مسكنات',
          notes: 'الحالة مستقرة',
          vitalSigns: {
            bloodPressure: '120/80',
            heartRate: 72,
            temperature: 37.2,
            weight: 70
          }
        },
        {
          id: '3',
          date: '2024-06-20',
          time: '09:00',
          doctor: 'د. خالد حسن',
          doctorSpecialty: 'الجراحة',
          type: 'consultation',
          status: 'scheduled',
          diagnosis: '',
          symptoms: '',
          treatment: '',
          notes: 'استشارة جراحية لاستئصال المرارة'
        },
        {
          id: '4',
          date: '2024-05-25',
          time: '16:00',
          doctor: 'د. نور الدين',
          doctorSpecialty: 'العظام',
          type: 'emergency',
          status: 'completed',
          diagnosis: 'كسر في الساعد',
          symptoms: 'ألم شديد، تورم، عدم القدرة على الحركة',
          treatment: 'جبيرة، مسكنات، راحة',
          notes: 'تم وضع الجبيرة، يحتاج متابعة أسبوعية'
        }
      ]
      
      setVisits(mockData)
    } catch (error) {
      console.error('خطأ في جلب الزيارات:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'عامة'
      case 'followup':
        return 'متابعة'
      case 'emergency':
        return 'طوارئ'
      case 'consultation':
        return 'استشارة'
      default:
        return 'زيارة'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800'
      case 'followup':
        return 'bg-green-100 text-green-800'
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'consultation':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة'
      case 'in_progress':
        return 'جارية'
      case 'completed':
        return 'مكتملة'
      case 'cancelled':
        return 'ملغية'
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
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredVisits = selectedStatus === 'all' 
    ? visits 
    : visits.filter(visit => visit.status === selectedStatus)

  const statusOptions = [
    { value: 'all', label: 'جميع الزيارات' },
    { value: 'scheduled', label: 'مجدولة' },
    { value: 'in_progress', label: 'جارية' },
    { value: 'completed', label: 'مكتملة' },
    { value: 'cancelled', label: 'ملغية' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل الزيارات...</div>
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
              <Calendar className="h-5 w-5" />
              <span>الزيارات الطبية</span>
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
                زيارة جديدة
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد زيارات متاحة</p>
            </CardContent>
          </Card>
        ) : (
          filteredVisits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {new Date(visit.date).toLocaleDateString('ar-IQ')} - {visit.time}
                        </h3>
                        <Badge className={`text-xs ${getTypeColor(visit.type)}`}>
                          {getTypeLabel(visit.type)}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(visit.status)}`}>
                          {getStatusIcon(visit.status)}
                          <span className="mr-1">{getStatusLabel(visit.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="h-4 w-4" />
                          <span>د. {visit.doctor} - {visit.doctorSpecialty}</span>
                        </div>
                      </div>

                      {visit.diagnosis && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">التشخيص:</h4>
                          <p className="text-sm text-gray-700">{visit.diagnosis}</p>
                        </div>
                      )}

                      {visit.symptoms && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">الأعراض:</h4>
                          <p className="text-sm text-gray-700">{visit.symptoms}</p>
                        </div>
                      )}

                      {visit.treatment && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">العلاج:</h4>
                          <p className="text-sm text-gray-700">{visit.treatment}</p>
                        </div>
                      )}

                      {visit.vitalSigns && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">العلامات الحيوية:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">ضغط الدم:</span>
                              <span className="font-medium mr-2">{visit.vitalSigns.bloodPressure}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">معدل النبض:</span>
                              <span className="font-medium mr-2">{visit.vitalSigns.heartRate} bpm</span>
                            </div>
                            <div>
                              <span className="text-gray-600">درجة الحرارة:</span>
                              <span className="font-medium mr-2">{visit.vitalSigns.temperature}°C</span>
                            </div>
                            <div>
                              <span className="text-gray-600">الوزن:</span>
                              <span className="font-medium mr-2">{visit.vitalSigns.weight} kg</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {visit.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">ملاحظات الطبيب:</h4>
                          <p className="text-sm text-gray-700">{visit.notes}</p>
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
                <p className="text-sm font-medium text-gray-600">إجمالي الزيارات</p>
                <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الزيارات المكتملة</p>
                <p className="text-2xl font-bold text-green-600">
                  {visits.filter(v => v.status === 'completed').length}
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
                <p className="text-sm font-medium text-gray-600">الزيارات المجدولة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {visits.filter(v => v.status === 'scheduled').length}
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
                <p className="text-sm font-medium text-gray-600">زيارات الطوارئ</p>
                <p className="text-2xl font-bold text-red-600">
                  {visits.filter(v => v.type === 'emergency').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
