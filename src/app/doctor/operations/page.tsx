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
  Heart
} from 'lucide-react'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'

interface Operation {
  id: string
  name: string
  description: string
  category: string
  duration: string
  cost: number
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

export default function DoctorOperationsPage() {
  const { hospitalId, cityId, filteredData } = useDoctorDataFilter()
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOperations, setTotalOperations] = useState(0)

  // Fetch operations data for doctor's hospital only
  useEffect(() => {
    const fetchOperations = async () => {
      if (!hospitalId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/hospital-operations?hospitalId=${hospitalId}&page=${currentPage}&limit=10`)
        const data = await response.json()
        
        if (data.success) {
          setOperations(data.data)
          setTotalPages(data.pagination.pages)
          setTotalOperations(data.pagination.total)
        } else {
          console.error('Error fetching operations:', data.error)
        }
      } catch (error) {
        console.error('Error fetching operations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOperations()
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
      label: 'اسم العملية',
      render: (value: string, row: Operation) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-600" />
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
    // Navigate to add operation page
    window.location.href = '/doctor/operations/new'
  }

  const handleEdit = (operation: Operation) => {
    // Navigate to edit operation page
    window.location.href = `/doctor/operations/${operation.id}/edit`
  }

  const handleView = (operation: Operation) => {
    // Navigate to operation details
    window.location.href = `/doctor/operations/${operation.id}`
  }

  const handleDelete = async (operation: Operation) => {
    if (confirm('هل أنت متأكد من حذف هذه العملية؟')) {
      try {
        const response = await fetch(`/api/hospital-operations/${operation.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setOperations(prev => prev.filter(o => o.id !== operation.id))
          alert('تم حذف العملية بنجاح')
        } else {
          alert('فشل في حذف العملية')
        }
      } catch (error) {
        console.error('Error deleting operation:', error)
        alert('حدث خطأ أثناء حذف العملية')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العمليات</h1>
          <p className="text-gray-600">عرض وإدارة العمليات المتاحة في مستشفاك</p>
        </div>

        <UniversalTable
          data={operations}
          columns={columns}
          title="العمليات"
          searchFields={['name', 'description', 'category', 'hospital.name']}
          filters={[
            {
              key: 'category',
              label: 'الفئة',
              type: 'select',
              options: [
                { value: 'جراحة عامة', label: 'جراحة عامة' },
                { value: 'جراحة قلب', label: 'جراحة قلب' },
                { value: 'جراحة عظام', label: 'جراحة عظام' },
                { value: 'جراحة عيون', label: 'جراحة عيون' }
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
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          addButtonText="إضافة عملية جديدة"
          emptyMessage="لا توجد عمليات متاحة"
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
