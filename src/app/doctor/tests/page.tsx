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
  TestTube
} from 'lucide-react'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'

interface Test {
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

export default function DoctorTestsPage() {
  const { hospitalId, cityId, filteredData } = useDoctorDataFilter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTests, setTotalTests] = useState(0)

  // Fetch tests data for doctor's hospital only
  useEffect(() => {
    const fetchTests = async () => {
      if (!hospitalId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/hospital-tests?hospitalId=${hospitalId}&page=${currentPage}&limit=10`)
        const data = await response.json()
        
        if (data.success) {
          setTests(data.data)
          setTotalPages(data.pagination.pages)
          setTotalTests(data.pagination.total)
        } else {
          console.error('Error fetching tests:', data.error)
        }
      } catch (error) {
        console.error('Error fetching tests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
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
      label: 'اسم الفحص',
      render: (value: string, row: Test) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <TestTube className="w-5 h-5 text-blue-600" />
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
    // Navigate to add test page
    window.location.href = '/doctor/tests/new'
  }

  const handleEdit = (test: Test) => {
    // Navigate to edit test page
    window.location.href = `/doctor/tests/${test.id}/edit`
  }

  const handleView = (test: Test) => {
    // Navigate to test details
    window.location.href = `/doctor/tests/${test.id}`
  }

  const handleDelete = async (test: Test) => {
    if (confirm('هل أنت متأكد من حذف هذا الفحص؟')) {
      try {
        const response = await fetch(`/api/hospital-tests/${test.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setTests(prev => prev.filter(t => t.id !== test.id))
          alert('تم حذف الفحص بنجاح')
        } else {
          alert('فشل في حذف الفحص')
        }
      } catch (error) {
        console.error('Error deleting test:', error)
        alert('حدث خطأ أثناء حذف الفحص')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الفحوصات</h1>
          <p className="text-gray-600">عرض وإدارة الفحوصات المتاحة في مستشفاك</p>
        </div>

        <UniversalTable
          data={tests}
          columns={columns}
          title="الفحوصات"
          searchFields={['name', 'description', 'category', 'hospital.name']}
          filters={[
            {
              key: 'category',
              label: 'الفئة',
              type: 'select',
              options: [
                { value: 'فحص دم', label: 'فحص دم' },
                { value: 'فحص بول', label: 'فحص بول' },
                { value: 'أشعة', label: 'أشعة' },
                { value: 'رنين مغناطيسي', label: 'رنين مغناطيسي' }
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
          addButtonText="إضافة فحص جديد"
          emptyMessage="لا توجد فحوصات متاحة"
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
