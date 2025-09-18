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
  Plus
} from 'lucide-react'

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
  createdAt: string
  updatedAt: string
}

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch visits data
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/visits')
        const data = await response.json()
        
        if (data.success) {
          setVisits(data.data)
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
  }, [])

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
      minute: '2-digit'
    })
  }

  const columns = [
    {
      key: 'patient',
      label: 'المريض',
      searchable: true,
      render: (value: any, item: Visit) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">
              {item.patient?.firstName} {item.patient?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              رقم المريض: {item.patient?.patientNumber}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'doctor',
      label: 'الطبيب',
      searchable: true,
      render: (value: any, item: Visit) => (
        item.doctor ? (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Stethoscope className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">
                د. {item.doctor.firstName} {item.doctor.lastName}
              </div>
              <div className="text-sm text-gray-500">
                {item.doctor.specialization}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">لم يتم اختيار طبيب</span>
        )
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      searchable: true,
      render: (value: any, item: Visit) => (
        item.hospital ? (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">{item.hospital.name}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 ml-1" />
                {item.hospital.city?.name}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">لم يتم اختيار مستشفى</span>
        )
      )
    },
    {
      key: 'scheduledAt',
      label: 'تاريخ ووقت الزيارة',
      sortable: true,
      render: (value: any, item: Visit) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDate(item.scheduledAt)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (value: any, item: Visit) => (
        <Badge className={getStatusColor(item.status)}>
          {getStatusText(item.status)}
        </Badge>
      )
    },
    {
      key: 'currentStep',
      label: 'الخطوة الحالية',
      render: (value: any, item: Visit) => (
        item.status === 'DRAFT' ? (
          <span className="text-sm text-orange-600">
            الخطوة {item.currentStep} من 5
          </span>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )
      )
    },
    {
      key: 'symptoms',
      label: 'الأعراض',
      searchable: true,
      render: (value: any, item: Visit) => (
        item.symptoms ? (
          <div className="max-w-xs truncate" title={item.symptoms}>
            {item.symptoms}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    }
  ]

  const handleAdd = () => {
    // Navigate to new visit page
    window.location.href = '/admin/patients'
  }

  const handleEdit = (visit: Visit) => {
    // Navigate to edit visit page
    window.location.href = `/admin/patients/${visit.patientId}`
  }

  const handleView = (visit: Visit) => {
    // Navigate to view visit details
    window.location.href = `/admin/patients/${visit.patientId}`
  }

  const handleDelete = async (visit: Visit) => {
    if (confirm('هل أنت متأكد من حذف هذه الزيارة؟')) {
      try {
        const response = await fetch(`/api/visits/${visit.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setVisits(visits.filter(v => v.id !== visit.id))
        } else {
          alert('حدث خطأ في حذف الزيارة')
        }
      } catch (error) {
        console.error('Error deleting visit:', error)
        alert('حدث خطأ في حذف الزيارة')
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
          <p className="text-gray-600">عرض وإدارة جميع زيارات المرضى</p>
        </div>

        <UniversalTable
          data={visits}
          columns={columns}
          title="الزيارات"
          searchFields={['patient.firstName', 'patient.lastName', 'doctor.firstName', 'doctor.lastName', 'hospital.name', 'symptoms']}
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
      </div>
    </div>
  )
}
