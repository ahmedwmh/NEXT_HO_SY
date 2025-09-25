'use client'

import { useState, useEffect } from 'react'
import { SensitiveAdminGuard } from '@/lib/admin-guard'
import { DataTable } from '@/components/ui/data-table'
import { FormModal } from '@/components/ui/form-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { FormField, FormSection, FormGrid, TextInput, SelectInput } from '@/components/ui/form-field'
import { useCrud } from '@/hooks/use-crud'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Phone, Mail, MapPin, Briefcase } from 'lucide-react'

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  cityId: string
  city: {
    id: string
    name: string
  }
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  phone: string
  hospitalId: string
  hospital: Hospital
  user: {
    email: string
  }
  createdAt: string
}

const staffPositions = [
  'ممرض',
  'فني مختبر',
  'فني أشعة',
  'صيدلي',
  'موظف إداري',
  'موظف استقبال',
  'حارس أمن',
  'فني صيانة',
  'دعم تقني',
  'محاسب'
]

function StaffPageContent() {
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [selectedCityId, setSelectedCityId] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    phone: '',
    email: '',
    password: '',
    hospitalId: ''
  })

  const {
    data: staff,
    loading,
    create,
    update,
    delete: deleteStaff,
    fetch
  } = useCrud<Staff>({
    endpoint: '/api/staff',
    onSuccess: () => {
      setShowAddForm(false)
      setEditingStaff(null)
      setFormData({
        firstName: '', lastName: '', position: '', phone: '', email: '', password: '', hospitalId: ''
      })
    }
  })

  useEffect(() => {
    fetchCities()
    fetchHospitals()
    fetch()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await (globalThis as any).fetch('/api/cities')
      const data = await response.json()
      setCities(data.data || data || [])
    } catch (error) {
      console.error('خطأ في جلب المدن:', error)
    }
  }

  const fetchHospitals = async () => {
    try {
      const response = await (globalThis as any).fetch('/api/hospitals')
      const data = await response.json()
      setHospitals(data.data || data || [])
    } catch (error) {
      console.error('خطأ في جلب المستشفيات:', error)
    }
  }

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId)
    setFormData({ ...formData, hospitalId: '' })
    const cityHospitals = hospitals.filter(hospital => hospital.cityId === cityId)
    setFilteredHospitals(cityHospitals)
  }

  const handleAdd = () => {
    setEditingStaff(null)
    setFormData({
      firstName: '', lastName: '', position: '', phone: '', email: '', password: '', hospitalId: ''
    })
    setSelectedCityId('')
    setFilteredHospitals([])
    setShowAddForm(true)
  }

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff)
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      position: staff.position,
      phone: staff.phone,
      email: staff.user.email,
      password: '',
      hospitalId: staff.hospitalId
    })
    setShowAddForm(true)
  }

  const handleDelete = (staff: Staff) => {
    setDeletingStaff(staff)
  }

  const confirmDelete = async () => {
    if (deletingStaff) {
      await deleteStaff(deletingStaff.id)
      setDeletingStaff(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingStaff) {
      await update(editingStaff.id, formData)
    } else {
      await create(formData)
    }
  }

  const columns = [
    {
      key: 'firstName' as keyof Staff,
      label: 'الاسم',
      render: (value: string, staff: Staff) => (
        <div className="font-semibold">{staff.firstName} {staff.lastName}</div>
      ),
      sortable: true,
      searchable: true
    },
    {
      key: 'position' as keyof Staff,
      label: 'المنصب',
      render: (value: string) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'phone' as keyof Staff,
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
      key: 'user' as keyof Staff,
      label: 'البريد الإلكتروني',
      render: (value: any, staff: Staff) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{staff.user.email}</span>
        </div>
      ),
      searchable: true
    },
    {
      key: 'hospital' as keyof Staff,
      label: 'المستشفى',
      render: (value: any, staff: Staff) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{staff.hospital.name}</span>
        </div>
      )
    }
  ]

  const filters = [
    {
      key: 'hospitalId',
      label: 'المستشفى',
      options: hospitals.map(h => ({ value: h.id, label: `${h.name} - ${h.city.name}` }))
    },
    {
      key: 'position',
      label: 'المنصب',
      options: staffPositions.map(p => ({ value: p, label: p }))
    }
  ]

  return (
    <div className="space-y-6">
      <DataTable
        title="إدارة الموظفين"
        data={staff}
        columns={columns}
        searchFields={['firstName', 'lastName', 'position', 'phone']}
        filters={filters}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة موظف جديد"
        emptyMessage="لا توجد موظفين مسجلين"
        loading={loading}
      />

      {/* Add/Edit Form Modal */}
      <FormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title={editingStaff ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
        onSubmit={handleSubmit}
        submitText={editingStaff ? 'حفظ التغييرات' : 'إضافة الموظف'}
        size="lg"
      >
        <FormSection title="المعلومات الأساسية">
          <FormGrid cols={2}>
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
          </FormGrid>
          <FormGrid cols={2}>
            <FormField label="المنصب" required>
              <SelectInput
                value={formData.position}
                onChange={(value) => setFormData({ ...formData, position: value })}
                placeholder="اختر المنصب"
                options={staffPositions.map(p => ({ value: p, label: p }))}
              />
            </FormField>
            <FormField label="المدينة" required>
              <SelectInput
                value={selectedCityId}
                onChange={handleCityChange}
                placeholder="اختر المدينة أولاً"
                options={cities.map(c => ({ value: c.id, label: c.name }))}
              />
            </FormField>
            <FormField label="المستشفى" required>
              <SelectInput
                value={formData.hospitalId}
                onChange={(value) => setFormData({ ...formData, hospitalId: value })}
                placeholder={selectedCityId ? "اختر المستشفى" : "اختر المدينة أولاً"}
                options={filteredHospitals.map(h => ({ value: h.id, label: h.name }))}
                disabled={!selectedCityId}
              />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="معلومات الاتصال">
          <FormGrid cols={2}>
            <FormField label="رقم الهاتف" required>
              <TextInput
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="رقم الهاتف"
              />
            </FormField>
            <FormField label="البريد الإلكتروني" required>
              <TextInput
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="البريد الإلكتروني"
              />
            </FormField>
          </FormGrid>
          {!editingStaff && (
            <FormField label="كلمة المرور" required>
              <TextInput
                type="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                placeholder="كلمة المرور"
              />
            </FormField>
          )}
        </FormSection>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الموظف ${deletingStaff?.firstName} ${deletingStaff?.lastName}؟`}
        confirmText="حذف"
        type="danger"
      />
    </div>
  )
}

export default function StaffPage() {
  return (
    <SensitiveAdminGuard>
      <StaffPageContent />
    </SensitiveAdminGuard>
  )
}
