'use client'

import { useState, useEffect } from 'react'
import { UniversalTable } from '@/components/ui/universal-table'
import { FormModal } from '@/components/ui/form-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { FormField, FormSection, FormGrid, TextInput, SelectInput, TextArea } from '@/components/ui/form-field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Badge } from '@/components/ui/badge'
import { Phone, MapPin, Calendar } from 'lucide-react'
import { useData } from '@/hooks/use-data'
import { usePatients } from '@/hooks/use-patients'
import { usePatientForm } from '@/hooks/use-patient-form'
import type { Patient, Hospital, Doctor } from '@/lib/services/data-service'

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['ذكر', 'أنثى']
const maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل']
const nationalities = ['عراقي', 'سوري', 'مصري', 'أردني', 'لبناني', 'سعودي', 'إماراتي', 'كويتي', 'قطري', 'بحريني', 'عماني', 'يمني', 'أخرى']

export default function PatientsPage() {
  console.log('🏗️ PatientsPage: Component rendering...')
  
  // Data fetching
  const { cities, hospitals, doctors, patients: dataPatients, loading: dataLoading, error: dataError } = useData()
  
  console.log('📊 PatientsPage: Data state:', {
    citiesCount: cities.length,
    hospitalsCount: hospitals.length,
    doctorsCount: doctors.length,
    patientsCount: dataPatients.length,
    dataLoading,
    dataError
  })
  
  // Patient operations
  const {
    patients,
    loading: patientsLoading,
    error: patientsError,
    createPatient,
    updatePatient,
    deletePatient,
    setPatients,
  } = usePatients({
    onSuccess: () => {
      console.log('✅ PatientsPage: Patient operation success')
      setShowAddForm(false)
      setEditingPatient(null)
      form.resetForm()
    },
  })

  console.log('👥 PatientsPage: Patients state:', {
    patientsCount: patients.length,
    patientsLoading,
    patientsError
  })

  // Form management
  const form = usePatientForm()

  // UI state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [patientImages, setPatientImages] = useState<Array<{
    id?: string
    imageUrl: string
    title?: string
    description?: string
    type?: string
  }>>([])

  // Debug: Log when patients change
  useEffect(() => {
    console.log('🔄 PatientsPage: DataPatients updated:', {
      count: dataPatients.length,
      patients: dataPatients.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, number: p.patientNumber }))
    })
  }, [dataPatients])

  const handleCityChange = (cityId: string) => {
    form.handleCityChange(cityId, hospitals)
  }

  const handleHospitalChange = (hospitalId: string) => {
    form.handleHospitalChange(hospitalId, doctors)
  }

  const handleAdd = () => {
    setEditingPatient(null)
    form.resetForm()
    setPatientImages([])
    setShowAddForm(true)
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    form.populateForm(patient)
    setShowAddForm(true)
  }

  const handleDelete = (patient: Patient) => {
    setDeletingPatient(patient)
  }

  const confirmDelete = async () => {
    if (deletingPatient) {
      await deletePatient(deletingPatient.id)
      setDeletingPatient(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const patientData = form.preparePatientData(form.formData)

    if (editingPatient) {
      await updatePatient(editingPatient.id, patientData)
    } else {
      await createPatient(patientData)
    }
  }

  const columns = [
    {
      key: 'patientNumber' as keyof Patient,
      label: 'رقم المريض',
      sortable: true,
      searchable: true
    },
    {
      key: 'firstName' as keyof Patient,
      label: 'الاسم',
      render: (value: string, patient: Patient) => (
        <div 
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => window.location.href = `/admin/patients/${patient.id}`}
        >
          <div className="font-semibold">{patient.firstName} {patient.lastName}</div>
          {patient.middleName && <div className="text-sm text-gray-500">{patient.middleName}</div>}
        </div>
      ),
      sortable: true,
      searchable: true
    },
    {
      key: 'gender' as keyof Patient,
      label: 'الجنس',
      render: (value: string, patient: Patient) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{patient.gender}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'phone' as keyof Patient,
      label: 'الهاتف',
      render: (value: string) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
      searchable: true
    },
    {
      key: 'hospital' as keyof Patient,
      label: 'المستشفى',
      render: (value: any, patient: Patient) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{patient.hospital.name}</span>
        </div>
      )
    },
    {
      key: 'bloodType' as keyof Patient,
      label: 'فصيلة الدم',
      render: (value: string) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'isActive' as keyof Patient,
      label: 'الحالة',
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    }
  ]

  const filters = [
    {
      key: 'hospitalId',
      label: 'المستشفى',
      type: 'select' as const,
      options: hospitals.map(h => ({ value: h.id, label: `${h.name} - ${h.city.name}` }))
    },
    {
      key: 'gender',
      label: 'الجنس',
      type: 'select' as const,
      options: genders.map(g => ({ value: g, label: g }))
    },
    {
      key: 'bloodType',
      label: 'فصيلة الدم',
      type: 'select' as const,
      options: bloodTypes.map(t => ({ value: t, label: t }))
    }
  ]

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">خطأ في تحميل البيانات: {dataError}</div>
      </div>
    )
  }

  console.log('🎯 PatientsPage: Rendering UniversalTable with:', {
    patientsCount: dataPatients.length,
    dataLoading,
    patients: dataPatients.slice(0, 2) // Show first 2 patients for debugging
  })

  return (
    <div className="space-y-6">
      <UniversalTable
        title="إدارة المرضى"
        data={dataPatients}
        columns={columns}
        searchFields={['firstName', 'lastName', 'patientNumber', 'phone', 'email']}
        filters={filters}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة مريض جديد"
        emptyMessage="لا توجد مرضى مسجلين"
        loading={dataLoading}
        itemsPerPage={30}
      />

      {/* Add/Edit Form Modal */}
      <FormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title={editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
        onSubmit={handleSubmit}
        submitText={editingPatient ? 'حفظ التغييرات' : 'إضافة المريض'}
        size="xl"
      >
        {/* Basic Information */}
        <FormSection title="المعلومات الأساسية">
          <FormGrid cols={3}>
            <FormField label="الاسم الأول" required>
              <TextInput
                value={form.formData.firstName}
                onChange={(value) => form.setFormData({ ...form.formData, firstName: value })}
                placeholder="الاسم الأول"
              />
            </FormField>
            <FormField label="الاسم الأخير" required>
              <TextInput
                value={form.formData.lastName}
                onChange={(value) => form.setFormData({ ...form.formData, lastName: value })}
                placeholder="الاسم الأخير"
              />
            </FormField>
            <FormField label="الاسم الأوسط">
              <TextInput
                value={form.formData.middleName}
                onChange={(value) => form.setFormData({ ...form.formData, middleName: value })}
                placeholder="الاسم الأوسط"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={3}>
            <FormField label="تاريخ الميلاد" required>
              <TextInput
                type="date"
                value={form.formData.dateOfBirth}
                onChange={(value) => form.setFormData({ ...form.formData, dateOfBirth: value })}
              />
            </FormField>
            <FormField label="الجنس" required>
              <SelectInput
                value={form.formData.gender}
                onChange={(value) => form.setFormData({ ...form.formData, gender: value })}
                placeholder="اختر الجنس"
                options={genders.map(g => ({ value: g, label: g }))}
              />
            </FormField>
            <FormField label="فصيلة الدم">
              <SelectInput
                value={form.formData.bloodType}
                onChange={(value) => form.setFormData({ ...form.formData, bloodType: value })}
                placeholder="اختر فصيلة الدم"
                options={bloodTypes.map(t => ({ value: t, label: t }))}
              />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* Contact Information */}
        <FormSection title="معلومات الاتصال">
          <FormGrid cols={2}>
            <FormField label="رقم الهاتف" required>
              <TextInput
                value={form.formData.phone}
                onChange={(value) => form.setFormData({ ...form.formData, phone: value })}
                placeholder="رقم الهاتف"
              />
            </FormField>
            <FormField label="البريد الإلكتروني">
              <TextInput
                type="email"
                value={form.formData.email}
                onChange={(value) => form.setFormData({ ...form.formData, email: value })}
                placeholder="البريد الإلكتروني"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={2}>
            <FormField label="العنوان" required>
              <TextInput
                value={form.formData.address}
                onChange={(value) => form.setFormData({ ...form.formData, address: value })}
                placeholder="العنوان"
              />
            </FormField>
            <FormField label="رقم الطوارئ" required>
              <TextInput
                value={form.formData.emergencyContact}
                onChange={(value) => form.setFormData({ ...form.formData, emergencyContact: value })}
                placeholder="رقم الطوارئ"
              />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* Medical Information */}
        <FormSection title="المعلومات الطبية">
          <FormGrid cols={2}>
            <FormField label="الحساسية">
              <TextInput
                value={form.formData.allergies}
                onChange={(value) => form.setFormData({ ...form.formData, allergies: value })}
                placeholder="الحساسية (مفصولة بفواصل)"
              />
            </FormField>
            <FormField label="المدينة" required>
              <SelectInput
                value={form.selectedCityId}
                onChange={handleCityChange}
                placeholder={dataLoading ? "جاري التحميل..." : "اختر المدينة أولاً"}
                options={cities.map(c => ({ value: c.id, label: c.name }))}
                disabled={dataLoading}
              />
            </FormField>
            <FormField label="المستشفى" required>
              <SelectInput
                value={form.selectedHospitalId}
                onChange={handleHospitalChange}
                placeholder={dataLoading ? "جاري التحميل..." : (form.selectedCityId ? "اختر المستشفى" : "اختر المدينة أولاً")}
                options={form.filteredHospitals.map(h => ({ value: h.id, label: h.name }))}
                disabled={!form.selectedCityId || dataLoading}
              />
            </FormField>
            <FormField label="الطبيب" required>
              <SelectInput
                value={form.formData.doctorId}
                onChange={(value) => form.setFormData({ ...form.formData, doctorId: value })}
                placeholder={dataLoading ? "جاري التحميل..." : (form.selectedHospitalId ? "اختر الطبيب" : "اختر المستشفى أولاً")}
                options={form.filteredDoctors.map(d => ({ value: d.id, label: `${d.firstName} ${d.lastName} - ${d.specialization}` }))}
                disabled={!form.selectedHospitalId || dataLoading}
              />
            </FormField>
          </FormGrid>
          <FormField label="التاريخ الطبي">
            <TextArea
              value={form.formData.medicalHistory}
              onChange={(value) => form.setFormData({ ...form.formData, medicalHistory: value })}
              placeholder="التاريخ الطبي السابق"
            />
          </FormField>
        </FormSection>

        {/* Patient Images */}
        <FormSection title="صور المريض">
          <ImageUpload
            images={patientImages}
            onImagesChange={setPatientImages}
            maxImages={10}
            className="w-full"
          />
        </FormSection>

        {/* Loading State */}
        {dataLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">جاري تحميل البيانات...</p>
          </div>
        )}

        {/* Additional Information */}
        <FormSection title="معلومات إضافية">
          <FormGrid cols={3}>
            <FormField label="الجنسية">
              <SelectInput
                value={form.formData.nationality}
                onChange={(value) => form.setFormData({ ...form.formData, nationality: value })}
                placeholder="اختر الجنسية"
                options={nationalities.map(n => ({ value: n, label: n }))}
              />
            </FormField>
            <FormField label="رقم الهوية">
              <TextInput
                value={form.formData.idNumber}
                onChange={(value) => form.setFormData({ ...form.formData, idNumber: value })}
                placeholder="رقم الهوية"
              />
            </FormField>
            <FormField label="رقم جواز السفر">
              <TextInput
                value={form.formData.passportNumber}
                onChange={(value) => form.setFormData({ ...form.formData, passportNumber: value })}
                placeholder="رقم جواز السفر"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={3}>
            <FormField label="الحالة الاجتماعية">
              <SelectInput
                value={form.formData.maritalStatus}
                onChange={(value) => form.setFormData({ ...form.formData, maritalStatus: value })}
                placeholder="اختر الحالة الاجتماعية"
                options={maritalStatuses.map(s => ({ value: s, label: s }))}
              />
            </FormField>
            <FormField label="المهنة">
              <TextInput
                value={form.formData.occupation}
                onChange={(value) => form.setFormData({ ...form.formData, occupation: value })}
                placeholder="المهنة"
              />
            </FormField>
            <FormField label="المدينة">
              <TextInput
                value={cities.find(c => c.id === form.formData.cityId)?.name || ''}
                onChange={() => {}} // Read-only, city is selected via dropdown
                placeholder="المدينة"
                disabled
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={2}>
            <FormField label="رقم التأمين">
              <TextInput
                value={form.formData.insuranceNumber}
                onChange={(value) => form.setFormData({ ...form.formData, insuranceNumber: value })}
                placeholder="رقم التأمين"
              />
            </FormField>
            <FormField label="شركة التأمين">
              <TextInput
                value={form.formData.insuranceCompany}
                onChange={(value) => form.setFormData({ ...form.formData, insuranceCompany: value })}
                placeholder="شركة التأمين"
              />
            </FormField>
          </FormGrid>
          <FormField label="ملاحظات">
            <TextArea
              value={form.formData.notes}
              onChange={(value) => form.setFormData({ ...form.formData, notes: value })}
              placeholder="ملاحظات إضافية"
            />
          </FormField>
        </FormSection>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المريض ${deletingPatient?.firstName} ${deletingPatient?.lastName}؟`}
        confirmText="حذف"
        type="danger"
      />
    </div>
  )
}