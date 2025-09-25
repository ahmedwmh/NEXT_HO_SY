'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PermissionGuard, PermissionButton, PermissionSection } from '@/components/ui/permission-guard'
import { usePermissions, useDoctorPermissions } from '@/hooks/use-permissions'
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  patientNumber: string
  hospitalId: string
}

interface PatientsPermissionsExampleProps {
  patients: Patient[]
  hospitalId: string
}

export default function PatientsPermissionsExample({ 
  patients, 
  hospitalId 
}: PatientsPermissionsExampleProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // استخدام hooks للصلاحيات
  const canReadPatients = usePermissions({
    resource: 'PATIENTS',
    action: 'READ',
    hospitalId
  })

  const canWritePatients = usePermissions({
    resource: 'PATIENTS',
    action: 'WRITE',
    hospitalId
  })

  const canDeletePatients = usePermissions({
    resource: 'PATIENTS',
    action: 'DELETE',
    hospitalId
  })

  const doctorPermissions = useDoctorPermissions(hospitalId)

  const handleAddPatient = () => {
    console.log('إضافة مريض جديد')
  }

  const handleEditPatient = (patient: Patient) => {
    console.log('تعديل المريض:', patient.id)
  }

  const handleDeletePatient = (patient: Patient) => {
    console.log('حذف المريض:', patient.id)
  }

  const handleViewPatient = (patient: Patient) => {
    console.log('عرض المريض:', patient.id)
  }

  if (canReadPatients.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الصلاحيات...</p>
        </div>
      </div>
    )
  }

  if (canReadPatients.error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>خطأ في تحميل الصلاحيات: {canReadPatients.error}</p>
      </div>
    )
  }

  if (!canReadPatients.hasPermission) {
    return (
      <div className="text-center text-gray-500 p-8">
        <h3 className="text-lg font-semibold mb-2">ليس لديك صلاحية لعرض المرضى</h3>
        <p>يرجى التواصل مع الإدمن للحصول على الصلاحيات المناسبة</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with permissions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المرضى</h1>
          <p className="text-gray-600 mt-1">
            {patients.length} مريض في المستشفى
          </p>
        </div>
        
        {/* Add Patient Button with Permission Check */}
        <PermissionButton
          resource="PATIENTS"
          action="WRITE"
          hospitalId={hospitalId}
          onClick={handleAddPatient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 rtl:space-x-reverse"
          fallback={
            <div className="text-gray-400 text-sm">
              ليس لديك صلاحية لإضافة مرضى
            </div>
          }
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مريض</span>
        </PermissionButton>
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {patient.firstName} {patient.lastName}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    رقم المريض: {patient.patientNumber}
                  </p>
                </div>
                
                {/* Action Buttons with Permission Checks */}
                <div className="flex space-x-2 rtl:space-x-reverse">
                  {/* View Button */}
                  <PermissionButton
                    resource="PATIENTS"
                    action="READ"
                    hospitalId={hospitalId}
                    onClick={() => handleViewPatient(patient)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    fallback={null}
                  >
                    <Eye className="h-4 w-4" />
                  </PermissionButton>

                  {/* Edit Button */}
                  <PermissionButton
                    resource="PATIENTS"
                    action="WRITE"
                    hospitalId={hospitalId}
                    onClick={() => handleEditPatient(patient)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                    fallback={null}
                  >
                    <Edit className="h-4 w-4" />
                  </PermissionButton>

                  {/* Delete Button */}
                  <PermissionButton
                    resource="PATIENTS"
                    action="DELETE"
                    hospitalId={hospitalId}
                    onClick={() => handleDeletePatient(patient)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                    fallback={null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </PermissionButton>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Patient Details with Permission Guards */}
              <div className="space-y-3">
                <PermissionSection
                  resource="PATIENTS"
                  action="READ"
                  hospitalId={hospitalId}
                  title="معلومات المريض"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">الاسم:</span>
                      <span className="mr-2">{patient.firstName} {patient.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium">رقم المريض:</span>
                      <span className="mr-2">{patient.patientNumber}</span>
                    </div>
                  </div>
                </PermissionSection>

                {/* Medical Actions Section */}
                <PermissionSection
                  resource="VISITS"
                  action="READ"
                  hospitalId={hospitalId}
                  title="الإجراءات الطبية"
                >
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <PermissionButton
                      resource="VISITS"
                      action="WRITE"
                      hospitalId={hospitalId}
                      onClick={() => console.log('إضافة زيارة')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                      fallback={null}
                    >
                      إضافة زيارة
                    </PermissionButton>

                    <PermissionButton
                      resource="TESTS"
                      action="WRITE"
                      hospitalId={hospitalId}
                      onClick={() => console.log('طلب فحص')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                      fallback={null}
                    >
                      طلب فحص
                    </PermissionButton>

                    <PermissionButton
                      resource="TREATMENTS"
                      action="WRITE"
                      hospitalId={hospitalId}
                      onClick={() => console.log('إضافة علاج')}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
                      fallback={null}
                    >
                      إضافة علاج
                    </PermissionButton>
                  </div>
                </PermissionSection>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {patients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            لا توجد مرضى
          </h3>
          <p className="text-gray-500 mb-4">
            ابدأ بإضافة مريض جديد
          </p>
          <PermissionButton
            resource="PATIENTS"
            action="WRITE"
            hospitalId={hospitalId}
            onClick={handleAddPatient}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            fallback={
              <div className="text-gray-400 text-sm">
                ليس لديك صلاحية لإضافة مرضى
              </div>
            }
          >
            إضافة مريض جديد
          </PermissionButton>
        </div>
      )}

      {/* Debug Information (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">معلومات الصلاحيات (للتطوير)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <span className="font-medium">قراءة المرضى:</span>
              <span className={`mr-2 ${canReadPatients.hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                {canReadPatients.hasPermission ? 'مسموح' : 'ممنوع'}
              </span>
            </div>
            <div>
              <span className="font-medium">كتابة المرضى:</span>
              <span className={`mr-2 ${canWritePatients.hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                {canWritePatients.hasPermission ? 'مسموح' : 'ممنوع'}
              </span>
            </div>
            <div>
              <span className="font-medium">حذف المرضى:</span>
              <span className={`mr-2 ${canDeletePatients.hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                {canDeletePatients.hasPermission ? 'مسموح' : 'ممنوع'}
              </span>
            </div>
            <div>
              <span className="font-medium">صلاحيات الطبيب:</span>
              <span className="mr-2">
                {Object.entries(doctorPermissions.results).map(([key, value]) => (
                  <span key={key} className={`mr-1 ${value ? 'text-green-600' : 'text-red-600'}`}>
                    {key}: {value ? '✓' : '✗'}
                  </span>
                ))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
