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
  Edit,
  Trash2,
  Plus,
  Pill
} from 'lucide-react'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'

interface Treatment {
  id: string
  name: string
  description: string
  category: string
  duration: string
  cost: number
  quantity: number
  reservedQuantity: number
  deliveredQuantity: number
  expiredate: string
  isActive: boolean
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

export default function DoctorTreatmentsPage() {
  const { hospitalId, cityId, filteredData } = useDoctorDataFilter()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTreatments, setTotalTreatments] = useState(0)

  // Fetch treatments data for doctor's hospital only
  useEffect(() => {
    const fetchTreatments = async () => {
      if (!hospitalId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/hospital-treatments?hospitalId=${hospitalId}&page=${currentPage}&limit=10`)
        const data = await response.json()
        
        if (data.success) {
          setTreatments(data.data)
          setTotalPages(data.pagination.pages)
          setTotalTreatments(data.pagination.total)
        } else {
          console.error('Error fetching treatments:', data.error)
        }
      } catch (error) {
        console.error('Error fetching treatments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTreatments()
  }, [hospitalId, currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'IQD'
    }).format(amount)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'نشط' : 'غير نشط'
  }

  const columns = [
    {
      key: 'name',
      label: 'اسم العلاج',
      render: (value: string, row: Treatment) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {value || 'لا يوجد وصف'}
          </p>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'الكمية المتاحة',
      render: (value: number, row: Treatment) => (
        <div className="text-center">
          <p className="font-medium text-gray-900">{row.quantity || 0}</p>
          <p className="text-xs text-gray-500">
            محجوز: {row.reservedQuantity || 0} | مسلم: {row.deliveredQuantity || 0}
          </p>
        </div>
      )
    },
    {
      key: 'cost',
      label: 'التكلفة',
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'duration',
      label: 'المدة',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value || 'غير محدد'}
        </span>
      )
    },
    {
      key: 'expiredate',
      label: 'تاريخ الانتهاء',
      render: (value: string) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean) => (
        <Badge className={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      )
    }
  ]

  const handleAdd = () => {
    // Navigate to add treatment page
    window.location.href = '/doctor/treatments/new'
  }

  const handleEdit = (treatment: Treatment) => {
    // Navigate to edit treatment page
    window.location.href = `/doctor/treatments/${treatment.id}/edit`
  }


  const handleDelete = async (treatment: Treatment) => {
    if (confirm('هل أنت متأكد من حذف هذا العلاج؟')) {
      try {
        const response = await fetch(`/api/hospital-treatments/${treatment.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setTreatments(prev => prev.filter(t => t.id !== treatment.id))
          alert('تم حذف العلاج بنجاح')
        } else {
          alert('فشل في حذف العلاج')
        }
      } catch (error) {
        console.error('Error deleting treatment:', error)
        alert('حدث خطأ أثناء حذف العلاج')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العلاجات</h1>
          <p className="text-gray-600">عرض وإدارة العلاجات المتاحة في مستشفاك</p>
        </div>

        <UniversalTable
          data={treatments}
          columns={columns}
          title="العلاجات"
          searchFields={['name', 'description', 'category', 'hospital.name']}
          filters={[
            {
              key: 'category',
              label: 'الفئة',
              type: 'select',
              options: [
                { value: 'دواء', label: 'دواء' },
                { value: 'علاج', label: 'علاج' },
                { value: 'جراحة', label: 'جراحة' },
                { value: 'فحص', label: 'فحص' }
              ]
            },
            {
              key: 'isActive',
              label: 'الحالة',
              type: 'select',
              options: [
                { value: 'true', label: 'نشط' },
                { value: 'false', label: 'غير نشط' }
              ]
            }
          ]}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          addButtonText="إضافة علاج جديد"
          emptyMessage="لا توجد علاجات متاحة"
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
