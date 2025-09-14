'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart,
  Edit,
  Download,
  Printer,
  Share2,
  AlertTriangle
} from 'lucide-react'

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

interface PatientProfileHeaderProps {
  patient: Patient
}

export function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-hospital-blue to-hospital-lightBlue p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Patient Info */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-hospital-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {patient.firstName} {patient.lastName}
                {patient.middleName && ` ${patient.middleName}`}
              </h1>
              <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
                <span className="text-hospital-lightBlue text-sm">
                  رقم المريض: {patient.patientNumber}
                </span>
                <Badge variant="secondary" className="bg-white text-hospital-blue">
                  {calculateAge(patient.dateOfBirth)} سنة
                </Badge>
                <Badge variant={patient.isActive ? "default" : "secondary"} className="bg-white">
                  {patient.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 ml-2" />
              تحميل
            </Button>
            <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
              <Share2 className="h-4 w-4 ml-2" />
              مشاركة
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <User className="h-4 w-4 ml-2" />
              المعلومات الأساسية
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الجنس:</span>
                <span className="font-medium">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">تاريخ الميلاد:</span>
                <span className="font-medium">{formatDate(patient.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">فصيلة الدم:</span>
                <Badge variant="outline" className="text-xs">
                  {patient.bloodType || 'غير محدد'}
                </Badge>
              </div>
              {patient.nationality && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الجنسية:</span>
                  <span className="font-medium">{patient.nationality}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Phone className="h-4 w-4 ml-2" />
              معلومات الاتصال
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="h-3 w-3 text-gray-400" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span>{patient.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="truncate">{patient.address}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span>{patient.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Heart className="h-4 w-4 ml-2" />
              المعلومات الطبية
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">المستشفى:</span>
                <p className="font-medium">{patient.hospital.name}</p>
                <p className="text-xs text-gray-500">{patient.hospital.city.name}</p>
              </div>
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <span className="text-gray-500">الحساسية:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.allergies.slice(0, 2).map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                    {patient.allergies.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{patient.allergies.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 ml-2" />
              معلومات إضافية
            </h3>
            <div className="space-y-2 text-sm">
              {patient.maritalStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الحالة الاجتماعية:</span>
                  <span className="font-medium">{patient.maritalStatus}</span>
                </div>
              )}
              {patient.occupation && (
                <div className="flex justify-between">
                  <span className="text-gray-500">المهنة:</span>
                  <span className="font-medium">{patient.occupation}</span>
                </div>
              )}
              {patient.insuranceCompany && (
                <div className="flex justify-between">
                  <span className="text-gray-500">شركة التأمين:</span>
                  <span className="font-medium">{patient.insuranceCompany}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">تاريخ التسجيل:</span>
                <span className="font-medium">{formatDate(patient.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
