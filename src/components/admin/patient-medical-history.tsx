'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Calendar, 
  Stethoscope, 
  AlertTriangle, 
  Heart, 
  Activity,
  Plus,
  Edit,
  Eye,
  Download
} from 'lucide-react'

interface PatientMedicalHistoryProps {
  patientId: string
}

interface MedicalRecord {
  id: string
  type: 'diagnosis' | 'treatment' | 'surgery' | 'allergy' | 'medication'
  title: string
  description: string
  date: string
  doctor: string
  status: 'active' | 'resolved' | 'chronic' | 'cancelled'
  severity: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
}

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchMedicalHistory()
  }, [patientId])

  const fetchMedicalHistory = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your API
      const mockData: MedicalRecord[] = [
        {
          id: '1',
          type: 'diagnosis',
          title: 'ارتفاع ضغط الدم',
          description: 'تشخيص ارتفاع ضغط الدم المزمن',
          date: '2024-01-15',
          doctor: 'د. أحمد محمد',
          status: 'chronic',
          severity: 'medium',
          notes: 'يحتاج متابعة دورية كل 3 أشهر'
        },
        {
          id: '2',
          type: 'treatment',
          title: 'علاج دوائي لضغط الدم',
          description: 'وصف دواء ليزينوبريل 10 مجم يومياً',
          date: '2024-01-15',
          doctor: 'د. أحمد محمد',
          status: 'active',
          severity: 'low',
          notes: 'يجب تناول الدواء في نفس الوقت يومياً'
        },
        {
          id: '3',
          type: 'allergy',
          title: 'حساسية البنسلين',
          description: 'حساسية شديدة للبنسلين ومشتقاته',
          date: '2023-12-10',
          doctor: 'د. فاطمة علي',
          status: 'active',
          severity: 'critical',
          notes: 'يجب تجنب جميع المضادات الحيوية من عائلة البنسلين'
        },
        {
          id: '4',
          type: 'surgery',
          title: 'استئصال الزائدة الدودية',
          description: 'جراحة طارئة لاستئصال الزائدة الدودية الملتهبة',
          date: '2023-08-20',
          doctor: 'د. خالد حسن',
          status: 'resolved',
          severity: 'high',
          notes: 'تمت الجراحة بنجاح، المريض يتعافى بشكل جيد'
        },
        {
          id: '5',
          type: 'medication',
          title: 'مكملات فيتامين د',
          description: 'وصف مكملات فيتامين د 1000 وحدة دولية يومياً',
          date: '2024-02-01',
          doctor: 'د. نور الدين',
          status: 'active',
          severity: 'low',
          notes: 'يؤخذ مع وجبة الإفطار'
        }
      ]
      
      setMedicalRecords(mockData)
    } catch (error) {
      console.error('خطأ في جلب التاريخ الطبي:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <Stethoscope className="h-4 w-4" />
      case 'treatment':
        return <Activity className="h-4 w-4" />
      case 'surgery':
        return <Heart className="h-4 w-4" />
      case 'allergy':
        return <AlertTriangle className="h-4 w-4" />
      case 'medication':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return 'تشخيص'
      case 'treatment':
        return 'علاج'
      case 'surgery':
        return 'جراحة'
      case 'allergy':
        return 'حساسية'
      case 'medication':
        return 'دواء'
      default:
        return 'سجل طبي'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      case 'chronic':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRecords = selectedType === 'all' 
    ? medicalRecords 
    : medicalRecords.filter(record => record.type === selectedType)

  const typeOptions = [
    { value: 'all', label: 'جميع السجلات' },
    { value: 'diagnosis', label: 'التشخيصات' },
    { value: 'treatment', label: 'العلاجات' },
    { value: 'surgery', label: 'الجراحات' },
    { value: 'allergy', label: 'الحساسيات' },
    { value: 'medication', label: 'الأدوية' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري تحميل التاريخ الطبي...</div>
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
              <FileText className="h-5 w-5" />
              <span>التاريخ الطبي</span>
            </CardTitle>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hospital-blue"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button size="sm" className="bg-hospital-blue hover:bg-hospital-darkBlue">
                <Plus className="h-4 w-4 ml-2" />
                إضافة سجل
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Medical Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد سجلات طبية متاحة</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(record.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(record.type)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{record.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(record.date).toLocaleDateString('ar-SA', { calendar: 'gregory' })}</span>
                        </div>
                        <span>•</span>
                        <span>د. {record.doctor}</span>
                        <span>•</span>
                        <Badge className={`text-xs ${getStatusColor(record.status)}`}>
                          {record.status === 'active' ? 'نشط' : 
                           record.status === 'resolved' ? 'محلول' :
                           record.status === 'chronic' ? 'مزمن' : 'ملغي'}
                        </Badge>
                        <Badge className={`text-xs ${getSeverityColor(record.severity)}`}>
                          {record.severity === 'low' ? 'منخفض' :
                           record.severity === 'medium' ? 'متوسط' :
                           record.severity === 'high' ? 'عالي' : 'حرج'}
                        </Badge>
                      </div>
                      {record.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>ملاحظات:</strong> {record.notes}
                          </p>
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
                <p className="text-sm font-medium text-gray-600">إجمالي السجلات</p>
                <p className="text-2xl font-bold text-gray-900">{medicalRecords.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">السجلات النشطة</p>
                <p className="text-2xl font-bold text-green-600">
                  {medicalRecords.filter(r => r.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الحالات المزمنة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {medicalRecords.filter(r => r.status === 'chronic').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الحالات الحرجة</p>
                <p className="text-2xl font-bold text-red-600">
                  {medicalRecords.filter(r => r.severity === 'critical').length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
