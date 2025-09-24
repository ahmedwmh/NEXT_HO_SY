'use client'

import { useState, useEffect } from 'react'
import { UniversalTable } from '@/components/ui/universal-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  User, 
  Stethoscope, 
  Building, 
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  TestTube,
  Pill,
  Heart,
  CheckCircle
} from 'lucide-react'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'
import ComprehensiveVisitSystem from '@/components/admin/comprehensive-visit-system'

interface Visit {
  id: string
  patientId: string
  doctorId?: string
  hospitalId?: string
  cityId?: string
  scheduledAt: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DRAFT'
  currentStep: number
  notes?: string
  diagnosis?: string
  symptoms?: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    patientNumber: string
    profilePhoto?: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialization: string
  }
  hospital?: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  city?: {
    id: string
    name: string
  }
  tests?: Array<{
    id: string
    name: string
    description: string
    status: string
    results?: string
    scheduledAt: string
  }>
  treatments?: Array<{
    id: string
    name: string
    description: string
    status: string
    scheduledAt: string
  }>
  operations?: Array<{
    id: string
    name: string
    description: string
    status: string
    scheduledAt: string
  }>
  medications?: Array<{
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
  diseases?: Array<{
    id: string
    name: string
    description: string
    diagnosedAt: string
    severity: string
    status: string
  }>
  createdAt: string
  updatedAt: string
}

export default function DoctorVisitsPage() {
  const { hospitalId, cityId, filteredData } = useDoctorDataFilter()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVisits, setTotalVisits] = useState(0)

  // Fetch visits data for doctor's hospital only
  useEffect(() => {
    const fetchVisits = async () => {
      if (!hospitalId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/visits?hospitalId=${encodeURIComponent(hospitalId)}&page=${currentPage}&limit=10`)
        const data = await response.json()
        
        if (data.success) {
          setVisits(data.data)
          setTotalPages(data.pagination.pages)
          setTotalVisits(data.pagination.total)
        } else {
          console.error('Error fetching visits:', data.error)
        }
      } catch (error) {
        console.error('Error fetching visits:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVisits()
  }, [hospitalId, currentPage])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'مجدولة'
      case 'IN_PROGRESS': return 'جارية'
      case 'COMPLETED': return 'مكتملة'
      case 'CANCELLED': return 'ملغية'
      case 'DRAFT': return 'مسودة'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory'
    })
  }

  const columns = [
    {
      key: 'patient',
      label: 'المريض',
      render: (value: any, row: Visit) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.patient?.firstName} {row.patient?.lastName}
            </p>
            <p className="text-sm text-gray-500">#{row.patient?.patientNumber}</p>
          </div>
        </div>
      )
    },
    {
      key: 'scheduledAt',
      label: 'التاريخ والوقت',
      render: (value: string) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'doctor',
      label: 'الطبيب',
      render: (value: any, row: Visit) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Stethoscope className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {row.doctor?.firstName} {row.doctor?.lastName}
            </p>
            <p className="text-xs text-gray-500">{row.doctor?.specialization}</p>
          </div>
        </div>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      render: (value: any, row: Visit) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Building className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium">{row.hospital?.name}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="w-3 h-3 ml-1" />
              {row.hospital?.city?.name}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'symptoms',
      label: 'الأعراض',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {value || 'لا توجد أعراض'}
          </p>
        </div>
      )
    },
    {
      key: 'diagnosis',
      label: 'التشخيص',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {value || 'لم يتم التشخيص'}
          </p>
        </div>
      )
    },
    {
      key: 'tests',
      label: 'الفحوصات',
      render: (value: any[], row: Visit) => (
        <div className="max-w-xs">
          {row.tests && row.tests.length > 0 ? (
            <div className="space-y-1">
              {row.tests.slice(0, 2).map((test, index) => (
                <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <TestTube className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-gray-600 truncate">{test.name}</span>
                </div>
              ))}
              {row.tests.length > 2 && (
                <p className="text-xs text-gray-500">+{row.tests.length - 2} أخرى</p>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">لا توجد فحوصات</span>
          )}
        </div>
      )
    },
    {
      key: 'treatments',
      label: 'العلاجات',
      render: (value: any[], row: Visit) => (
        <div className="max-w-xs">
          {row.treatments && row.treatments.length > 0 ? (
            <div className="space-y-1">
              {row.treatments.slice(0, 2).map((treatment, index) => (
                <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Pill className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600 truncate">{treatment.name}</span>
                </div>
              ))}
              {row.treatments.length > 2 && (
                <p className="text-xs text-gray-500">+{row.treatments.length - 2} أخرى</p>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">لا توجد علاجات</span>
          )}
        </div>
      )
    },
    {
      key: 'operations',
      label: 'العمليات',
      render: (value: any[], row: Visit) => (
        <div className="max-w-xs">
          {row.operations && row.operations.length > 0 ? (
            <div className="space-y-1">
              {row.operations.slice(0, 2).map((operation, index) => (
                <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-gray-600 truncate">{operation.name}</span>
                </div>
              ))}
              {row.operations.length > 2 && (
                <p className="text-xs text-gray-500">+{row.operations.length - 2} أخرى</p>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">لا توجد عمليات</span>
          )}
        </div>
      )
    }
  ]

  const handleAdd = () => {
    setEditingVisitId(null)
    setShowVisitForm(true)
  }

  const handleEdit = (visit: Visit) => {
    setEditingVisitId(visit.id)
    setShowVisitForm(true)
  }

  const handleView = (visit: Visit) => {
    // Navigate to visit details or open in modal
    console.log('View visit:', visit.id)
  }

  const handleDelete = async (visit: Visit) => {
    if (confirm('هل أنت متأكد من حذف هذه الزيارة؟')) {
      try {
        const response = await fetch(`/api/visits/${visit.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setVisits(prev => prev.filter(v => v.id !== visit.id))
          alert('تم حذف الزيارة بنجاح')
        } else {
          alert('فشل في حذف الزيارة')
        }
      } catch (error) {
        console.error('Error deleting visit:', error)
        alert('حدث خطأ أثناء حذف الزيارة')
      }
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الزيارات</h1>
          <p className="text-gray-600">عرض وإدارة زيارات المرضى في مستشفاك مع التفاصيل الطبية الكاملة</p>
        </div>


        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الزيارات</p>
                  <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مجدولة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visits.filter(v => v.status === 'SCHEDULED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visits.filter(v => v.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TestTube className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">الفحوصات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visits.reduce((acc, v) => acc + (v.tests?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <UniversalTable
          data={visits}
          columns={columns}
          title="الزيارات"
          searchFields={['patient.firstName', 'patient.lastName', 'doctor.firstName', 'doctor.lastName', 'symptoms', 'diagnosis']}
          filters={[
            {
              key: 'status',
              label: 'الحالة',
              type: 'select',
              options: [
                { value: 'SCHEDULED', label: 'مجدولة' },
                { value: 'IN_PROGRESS', label: 'جارية' },
                { value: 'COMPLETED', label: 'مكتملة' },
                { value: 'CANCELLED', label: 'ملغية' },
                { value: 'DRAFT', label: 'مسودة' }
              ]
            }
          ]}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          addButtonText="إضافة زيارة جديدة"
          emptyMessage="لا توجد زيارات متاحة"
          loading={loading}
          showPagination={true}
          showSearch={true}
          showFilters={true}
          showActions={true}
        />

        {/* Comprehensive Visit System Modal */}
        {showVisitForm && (
          <ComprehensiveVisitSystem
            patientId={undefined} // Will be selected in the form
            isOpen={showVisitForm}
            onClose={() => {
              setShowVisitForm(false)
              setEditingVisitId(null)
              // Refresh visits
              window.location.reload()
            }}
            visitId={editingVisitId || undefined}
            // Pre-fill hospital and city for doctor
            defaultHospitalId={hospitalId}
            defaultCityId={cityId}
          />
        )}
      </div>
    </div>
  )
}
