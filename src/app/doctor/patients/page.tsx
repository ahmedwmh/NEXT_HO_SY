'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UniversalTable } from '@/components/ui/universal-table'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Calendar } from 'lucide-react'

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
  const { hospitalId, filteredData, loading, error } = useDoctorDataFilter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (filteredData.patients) {
      // Ensure patients have the required hospital and city properties
      const patientsWithRelations = filteredData.patients.map((patient: any) => ({
        ...patient,
        hospital: patient.hospital || { id: '', name: 'غير محدد' },
        city: patient.city || { id: '', name: 'غير محدد' }
      }))
      setPatients(patientsWithRelations)
    }
  }, [filteredData.patients])

  const fetchPatients = async () => {
    if (!hospitalId) return
    
    try {
      const response = await fetch(`/api/patients?hospitalId=${hospitalId}`)
      const data = await response.json()
      setPatients(data.data || data || [])
    } catch (error) {
      console.error('خطأ في جلب المرضى:', error)
    }
  }

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
        <div>
          <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
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

  return (
    <div className="w-full space-y-6">
      <UniversalTable
        title="مرضى المستشفى"
        data={patients}
        columns={columns}
        searchFields={['firstName', 'lastName', 'patientNumber']}
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
        loading={loading}
        itemsPerPage={10}
        showPagination={true}
        showSearch={true}
        showFilters={true}
        showActions={true}
      />
    </div>
  )
}
