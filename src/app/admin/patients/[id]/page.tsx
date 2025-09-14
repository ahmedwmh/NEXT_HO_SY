'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Heart, 
  Activity,
  Stethoscope,
  TestTube,
  Pill,
  AlertTriangle,
  Edit,
  Download,
  Printer,
  Share2,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { PatientProfileHeader } from '@/components/admin/patient-profile-header'
import { PatientQuickActions } from '@/components/admin/patient-quick-actions'
import { PatientCharts } from '@/components/admin/patient-charts'
import { PatientMedicalHistory } from '@/components/admin/patient-medical-history'
import { PatientVisits } from '@/components/admin/patient-visits'
import { PatientTests } from '@/components/admin/patient-tests'
import { PatientPrescriptions } from '@/components/admin/patient-prescriptions'

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: string
  phone: string
  email?: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies?: string[]
  medicalHistory?: string
  nationality?: string
  idNumber?: string
  passportNumber?: string
  city?: string
  insuranceNumber?: string
  insuranceCompany?: string
  maritalStatus?: string
  occupation?: string
  notes?: string
  isActive: boolean
  hospitalId: string
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

export default function PatientProfilePage() {
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (params.id) {
      fetchPatient()
    }
  }, [params.id])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data)
      } else {
        console.error('خطأ في جلب بيانات المريض')
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المريض:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">لم يتم العثور على المريض</div>
      </div>
    )
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Eye },
    { id: 'medical', label: 'التاريخ الطبي', icon: FileText },
    { id: 'visits', label: 'الزيارات', icon: Calendar },
    { id: 'tests', label: 'الفحوصات', icon: TestTube },
    { id: 'prescriptions', label: 'الوصفات', icon: Pill },
    { id: 'charts', label: 'الرسوم البيانية', icon: Activity }
  ]

  return (
    <div className="w-full space-y-6">
      {/* Patient Profile Header */}
      <PatientProfileHeader patient={patient} />

      {/* Quick Actions */}
      <PatientQuickActions patientId={patient.id} />

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 rtl:space-x-reverse px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-hospital-blue text-hospital-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="h-5 w-5" />
                  <span>المعلومات الأساسية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                    <p className="text-sm font-semibold">
                      {patient.firstName} {patient.lastName}
                      {patient.middleName && ` ${patient.middleName}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">رقم المريض</label>
                    <p className="text-sm font-semibold text-hospital-blue">{patient.patientNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">العمر</label>
                    <p className="text-sm font-semibold">{calculateAge(patient.dateOfBirth)} سنة</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">الجنس</label>
                    <p className="text-sm font-semibold">{patient.gender}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">فصيلة الدم</label>
                    <Badge variant="outline">{patient.bloodType || 'غير محدد'}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">الحالة</label>
                    <Badge variant={patient.isActive ? "default" : "secondary"}>
                      {patient.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Phone className="h-5 w-5" />
                  <span>معلومات الاتصال</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm">{patient.emergencyContact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Heart className="h-5 w-5" />
                  <span>المعلومات الطبية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">المستشفى</label>
                  <p className="text-sm font-semibold">{patient.hospital.name}</p>
                  <p className="text-xs text-gray-500">{patient.hospital.city.name}</p>
                </div>
                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">الحساسية</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient.medicalHistory && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">التاريخ الطبي</label>
                    <p className="text-sm text-gray-700 mt-1">{patient.medicalHistory}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'medical' && <PatientMedicalHistory patientId={patient.id} />}
        {activeTab === 'visits' && <PatientVisits patientId={patient.id} />}
        {activeTab === 'tests' && <PatientTests patientId={patient.id} />}
        {activeTab === 'prescriptions' && <PatientPrescriptions patientId={patient.id} />}
        {activeTab === 'charts' && <PatientCharts patientId={patient.id} />}
      </div>
    </div>
  )
}
