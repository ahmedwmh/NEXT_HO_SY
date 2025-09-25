'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UniversalTable } from '@/components/ui/universal-table'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Calendar, RefreshCw } from 'lucide-react'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  email: string | null
  address: string | null
  bloodType: string | null
  idNumber: string | null
  hospital: {
    id: string
    name: string
  }
  city: {
    id: string
    name: string
  }
  createdAt: string
}

export default function DoctorPatientsPage() {
  const { hospitalId, loading: doctorLoading, error: doctorError } = useDoctorDataFilter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [patientsError, setPatientsError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    if (!hospitalId) {
      setIsLoadingPatients(false)
      return
    }
    
    try {
      setIsLoadingPatients(true)
      setPatientsError(null)
      
      const response = await fetch(`/api/patients?hospitalId=${hospitalId}`)
      
      if (!response.ok) {
        throw new Error(`خطأ في الخادم: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        // Ensure patients have the required hospital and city properties
        const patientsWithRelations = data.data.map((patient: any) => ({
          ...patient,
          hospital: patient.hospital || { id: '', name: 'غير محدد' },
          city: patient.city || { id: '', name: 'غير محدد' }
        }))
        setPatients(patientsWithRelations)
      } else {
        setPatients([])
      }
    } catch (error) {
      console.error('خطأ في جلب المرضى:', error)
      setPatientsError(error instanceof Error ? error.message : 'حدث خطأ في جلب المرضى')
      setPatients([])
    } finally {
      setIsLoadingPatients(false)
    }
  }, [hospitalId])

  useEffect(() => {
    // Show loading while doctor data is being fetched
    if (doctorLoading) {
      setIsLoadingPatients(true)
      setPatientsError(null)
      return
    }
    
    // Once doctor data is loaded, start fetching patients
    if (hospitalId && !doctorLoading) {
      fetchPatients()
    }
  }, [hospitalId, doctorLoading, fetchPatients])


  const columns = [
    {
      key: 'patientNumber',
      label: 'رقم المريض',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    {
      key: 'name',
      label: 'اسم المريض',
      sortable: true,
      searchable: true,
      render: (value: any, patient: Patient) => (
        <div 
          className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
          onClick={() => handleViewPatient(patient)}
        >
          <p className="font-semibold text-blue-600 hover:text-blue-800">{patient.firstName} {patient.lastName}</p>
          <p className="text-sm text-gray-500">{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
        </div>
      )
    },
    {
      key: 'dateOfBirth',
      label: 'تاريخ الميلاد',
      sortable: true,
      render: (value: string) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear()
        return (
          <div>
            <p className="text-sm">{new Date(value).toLocaleDateString('ar-IQ')}</p>
            <p className="text-xs text-gray-500">{age} سنة</p>
          </div>
        )
      }
    },
    {
      key: 'contact',
      label: 'معلومات الاتصال',
      render: (value: any, patient: Patient) => (
        <div className="space-y-1">
          {patient.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 ml-1" />
              {patient.phone}
            </div>
          )}
          {patient.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-3 w-3 ml-1" />
              {patient.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'address',
      label: 'العنوان',
      render: (value: any, patient: Patient) => (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-3 w-3 ml-1" />
          <span className="truncate max-w-32">{patient.city.name}</span>
        </div>
      )
    },
    {
      key: 'bloodType',
      label: 'فصيلة الدم',
      render: (value: string | null) => (
        value ? (
          <Badge variant="secondary">{value}</Badge>
        ) : '-'
      )
    },
    {
      key: 'idNumber',
      label: 'رقم الهوية',
      render: (value: string | null) => (
        value ? (
          <span className="font-mono text-sm">{value}</span>
        ) : '-'
      )
    }
  ]

  const filters = [
    {
      key: 'gender',
      label: 'الجنس',
      type: 'select' as const,
      options: [
        { value: 'male', label: 'ذكر' },
        { value: 'female', label: 'أنثى' }
      ]
    },
    {
      key: 'bloodType',
      label: 'فصيلة الدم',
      type: 'select' as const,
      options: [
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' }
      ]
    }
  ]

  const handleViewPatient = (patient: Patient) => {
    // Navigate to patient details
    window.location.href = `/doctor/patients/${patient.id}`
  }

  const handleAddVisit = (patient: Patient) => {
    // Navigate to add visit for this patient
    window.location.href = `/doctor/visits/new?patientId=${patient.id}`
  }

  const handleAddTest = (patient: Patient) => {
    // Navigate to add test for this patient
    window.location.href = `/doctor/tests/new?patientId=${patient.id}`
  }

  const handleRefresh = useCallback(() => {
    if (hospitalId) {
      fetchPatients()
    }
  }, [hospitalId, fetchPatients])


  // Show error state
  if (doctorError) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">خطأ في تحميل البيانات</h3>
              <p className="text-gray-600 mb-4">{doctorError}</p>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show patients error
  if (patientsError) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">خطأ في جلب المرضى</h3>
              <p className="text-gray-600 mb-4">{patientsError}</p>
              <Button onClick={fetchPatients}>
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مرضى المستشفى</h1>
          <p className="text-gray-600 mt-1">
            {isLoadingPatients ? (
              'جاري التحميل...'
            ) : patients.length > 0 ? (
              `إجمالي المرضى: ${patients.length}`
            ) : (
              'لا توجد مرضى في مستشفاك'
            )}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoadingPatients}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingPatients ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <UniversalTable
        title=""
        data={patients}
        columns={columns}
        searchFields={['firstName', 'lastName', 'patientNumber', 'idNumber']}
        filters={filters}
        customActions={(patient: Patient) => [
          {
            label: 'عرض التفاصيل',
            onClick: () => handleViewPatient(patient),
            icon: Eye,
            variant: 'outline' as const
          },
          {
            label: 'إضافة زيارة',
            onClick: () => handleAddVisit(patient),
            icon: Calendar,
            variant: 'outline' as const
          },
          {
            label: 'طلب فحص',
            onClick: () => handleAddTest(patient),
            icon: Search,
            variant: 'outline' as const
          }
        ]}
        onAdd={() => window.location.href = '/doctor/patients/new'}
        addButtonText="إضافة مريض جديد"
        emptyMessage="لا توجد مرضى في مستشفاك"
        loading={isLoadingPatients}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />
    </div>
  )
}
