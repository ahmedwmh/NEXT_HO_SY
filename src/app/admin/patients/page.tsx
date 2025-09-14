'use client'

import { useState, useEffect } from 'react'
import { UniversalTable } from '@/components/ui/universal-table'
import { FormModal } from '@/components/ui/form-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { FormField, FormSection, FormGrid, TextInput, SelectInput, TextArea } from '@/components/ui/form-field'
import { useCrud } from '@/hooks/use-crud'
import { Badge } from '@/components/ui/badge'
import { Users, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react'

interface Hospital {
  id: string
  name: string
  city: {
    id: string
    name: string
  }
}

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
  hospital: Hospital
  createdAt: string
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['ذكر', 'أنثى']
const maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل']
const nationalities = ['عراقي', 'سوري', 'مصري', 'أردني', 'لبناني', 'سعودي', 'إماراتي', 'كويتي', 'قطري', 'بحريني', 'عماني', 'يمني', 'أخرى']

export default function PatientsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    nationality: '',
    idNumber: '',
    passportNumber: '',
    city: '',
    insuranceNumber: '',
    insuranceCompany: '',
    maritalStatus: '',
    occupation: '',
    notes: '',
    hospitalId: ''
  })

  const {
    data: patients,
    loading,
    create,
    update,
    delete: deletePatient,
    fetch
  } = useCrud<Patient>({
    endpoint: '/api/patients',
    onSuccess: () => {
      setShowAddForm(false)
      setEditingPatient(null)
      setFormData({
        firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: '',
        phone: '', email: '', address: '', emergencyContact: '', bloodType: '',
        allergies: '', medicalHistory: '', nationality: '', idNumber: '',
        passportNumber: '', city: '', insuranceNumber: '', insuranceCompany: '',
        maritalStatus: '', occupation: '', notes: '', hospitalId: ''
      })
    }
  })

  useEffect(() => {
    fetchHospitals()
    fetch()
  }, [])

  const fetchHospitals = async () => {
    try {
      const response = await (globalThis as any).fetch('/api/hospitals')
      const data = await response.json()
      setHospitals(data)
    } catch (error) {
      console.error('خطأ في جلب المستشفيات:', error)
    }
  }

  const handleAdd = () => {
    setEditingPatient(null)
    setFormData({
      firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: '',
      phone: '', email: '', address: '', emergencyContact: '', bloodType: '',
      allergies: '', medicalHistory: '', nationality: '', idNumber: '',
      passportNumber: '', city: '', insuranceNumber: '', insuranceCompany: '',
      maritalStatus: '', occupation: '', notes: '', hospitalId: ''
    })
    setShowAddForm(true)
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      middleName: patient.middleName || '',
      dateOfBirth: patient.dateOfBirth.split('T')[0],
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      bloodType: patient.bloodType,
      allergies: patient.allergies?.join(', ') || '',
      medicalHistory: patient.medicalHistory || '',
      nationality: patient.nationality || '',
      idNumber: patient.idNumber || '',
      passportNumber: patient.passportNumber || '',
      city: patient.city || '',
      insuranceNumber: patient.insuranceNumber || '',
      insuranceCompany: patient.insuranceCompany || '',
      maritalStatus: patient.maritalStatus || '',
      occupation: patient.occupation || '',
      notes: patient.notes || '',
      hospitalId: patient.hospitalId
    })
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
    
    const allergies = formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : []
    const patientData = {
      ...formData,
      allergies: allergies.length > 0 ? allergies : undefined
    }

    if (editingPatient) {
      await update(editingPatient.id, patientData)
    } else {
      await create(patientData)
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

  return (
    <div className="space-y-6">
      <UniversalTable
        title="إدارة المرضى"
        data={patients}
        columns={columns}
        searchFields={['firstName', 'lastName', 'patientNumber', 'phone', 'email']}
        filters={filters}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة مريض جديد"
        emptyMessage="لا توجد مرضى مسجلين"
        loading={loading}
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
                value={formData.firstName}
                onChange={(value) => setFormData({ ...formData, firstName: value })}
                placeholder="الاسم الأول"
              />
            </FormField>
            <FormField label="الاسم الأخير" required>
              <TextInput
                value={formData.lastName}
                onChange={(value) => setFormData({ ...formData, lastName: value })}
                placeholder="الاسم الأخير"
              />
            </FormField>
            <FormField label="الاسم الأوسط">
              <TextInput
                value={formData.middleName}
                onChange={(value) => setFormData({ ...formData, middleName: value })}
                placeholder="الاسم الأوسط"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={3}>
            <FormField label="تاريخ الميلاد" required>
              <TextInput
                type="date"
                value={formData.dateOfBirth}
                onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
              />
            </FormField>
            <FormField label="الجنس" required>
              <SelectInput
                value={formData.gender}
                onChange={(value) => setFormData({ ...formData, gender: value })}
                placeholder="اختر الجنس"
                options={genders.map(g => ({ value: g, label: g }))}
              />
            </FormField>
            <FormField label="فصيلة الدم">
              <SelectInput
                value={formData.bloodType}
                onChange={(value) => setFormData({ ...formData, bloodType: value })}
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
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="رقم الهاتف"
              />
            </FormField>
            <FormField label="البريد الإلكتروني">
              <TextInput
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="البريد الإلكتروني"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={2}>
            <FormField label="العنوان" required>
              <TextInput
                value={formData.address}
                onChange={(value) => setFormData({ ...formData, address: value })}
                placeholder="العنوان"
              />
            </FormField>
            <FormField label="رقم الطوارئ" required>
              <TextInput
                value={formData.emergencyContact}
                onChange={(value) => setFormData({ ...formData, emergencyContact: value })}
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
                value={formData.allergies}
                onChange={(value) => setFormData({ ...formData, allergies: value })}
                placeholder="الحساسية (مفصولة بفواصل)"
              />
            </FormField>
            <FormField label="المستشفى" required>
              <SelectInput
                value={formData.hospitalId}
                onChange={(value) => setFormData({ ...formData, hospitalId: value })}
                placeholder="اختر المستشفى"
                options={hospitals.map(h => ({ value: h.id, label: `${h.name} - ${h.city.name}` }))}
              />
            </FormField>
          </FormGrid>
          <FormField label="التاريخ الطبي">
            <TextArea
              value={formData.medicalHistory}
              onChange={(value) => setFormData({ ...formData, medicalHistory: value })}
              placeholder="التاريخ الطبي السابق"
            />
          </FormField>
        </FormSection>

        {/* Additional Information */}
        <FormSection title="معلومات إضافية">
          <FormGrid cols={3}>
            <FormField label="الجنسية">
              <SelectInput
                value={formData.nationality}
                onChange={(value) => setFormData({ ...formData, nationality: value })}
                placeholder="اختر الجنسية"
                options={nationalities.map(n => ({ value: n, label: n }))}
              />
            </FormField>
            <FormField label="رقم الهوية">
              <TextInput
                value={formData.idNumber}
                onChange={(value) => setFormData({ ...formData, idNumber: value })}
                placeholder="رقم الهوية"
              />
            </FormField>
            <FormField label="رقم جواز السفر">
              <TextInput
                value={formData.passportNumber}
                onChange={(value) => setFormData({ ...formData, passportNumber: value })}
                placeholder="رقم جواز السفر"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={3}>
            <FormField label="الحالة الاجتماعية">
              <SelectInput
                value={formData.maritalStatus}
                onChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                placeholder="اختر الحالة الاجتماعية"
                options={maritalStatuses.map(s => ({ value: s, label: s }))}
              />
            </FormField>
            <FormField label="المهنة">
              <TextInput
                value={formData.occupation}
                onChange={(value) => setFormData({ ...formData, occupation: value })}
                placeholder="المهنة"
              />
            </FormField>
            <FormField label="المدينة">
              <TextInput
                value={formData.city}
                onChange={(value) => setFormData({ ...formData, city: value })}
                placeholder="المدينة"
              />
            </FormField>
          </FormGrid>
          <FormGrid cols={2}>
            <FormField label="رقم التأمين">
              <TextInput
                value={formData.insuranceNumber}
                onChange={(value) => setFormData({ ...formData, insuranceNumber: value })}
                placeholder="رقم التأمين"
              />
            </FormField>
            <FormField label="شركة التأمين">
              <TextInput
                value={formData.insuranceCompany}
                onChange={(value) => setFormData({ ...formData, insuranceCompany: value })}
                placeholder="شركة التأمين"
              />
            </FormField>
          </FormGrid>
          <FormField label="ملاحظات">
            <TextArea
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
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