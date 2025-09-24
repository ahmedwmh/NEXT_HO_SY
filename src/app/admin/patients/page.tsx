'use client'

import { useState, useEffect, useCallback } from 'react'
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
  
  // Data fetching
  const { cities, hospitals, doctors, patients: dataPatients, loading: dataLoading, error: dataError } = useData()
  
  
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
      setShowAddForm(false)
      setEditingPatient(null)
      form.resetForm()
    },
  })


  // Form management
  const form = usePatientForm()

  // UI state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  // Populate form when editing patient
  useEffect(() => {
    if (editingPatient && showAddForm) {
      console.log('🔄 useEffect: Populating form for editing patient')
      console.log('🏥 Patient hospital:', editingPatient.hospital)
      console.log('🏥 Available hospitals:', hospitals)
      console.log('👨‍⚕️ Available doctors:', doctors)
      
      // Use a timeout to ensure the form is ready
      const timeoutId = setTimeout(() => {
        form.populateForm(editingPatient, hospitals, doctors)
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, [editingPatient, showAddForm, hospitals, doctors])

  // Reset form when closing
  useEffect(() => {
    if (!showAddForm) {
      form.resetForm()
      setEditingPatient(null)
    }
  }, [showAddForm])

  // Debug effect to monitor form state
  useEffect(() => {
    if (editingPatient) {
      console.log('🔍 Form state after population:', {
        formData: form.formData,
        selectedCityId: form.selectedCityId,
        selectedHospitalId: form.selectedHospitalId,
        filteredHospitals: form.filteredHospitals.length,
        filteredDoctors: form.filteredDoctors.length
      })
    }
  }, [form.formData, form.selectedCityId, form.selectedHospitalId, form.filteredHospitals, form.filteredDoctors, editingPatient])

  // Force re-render when form data changes
  const [formKey, setFormKey] = useState(0)
  useEffect(() => {
    if (editingPatient && showAddForm) {
      setFormKey(prev => prev + 1)
    }
  }, [editingPatient, showAddForm])

  // Handle form submission with better error handling
  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('📝 Submitting form data:', formData)
      
      if (editingPatient) {
        await updatePatient(editingPatient.id, formData)
        console.log('✅ Patient updated successfully')
      } else {
        await createPatient(formData)
        console.log('✅ Patient created successfully')
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error)
      throw error
    }
  }

  // Enhanced form validation
  const validateForm = (data: any) => {
    const errors: string[] = []
    
    if (!data.firstName?.trim()) errors.push('الاسم الأول مطلوب')
    if (!data.lastName?.trim()) errors.push('الاسم الأخير مطلوب')
    if (!data.dateOfBirth) errors.push('تاريخ الميلاد مطلوب')
    if (!data.gender) errors.push('الجنس مطلوب')
    if (!data.phone?.trim()) errors.push('رقم الهاتف مطلوب')
    if (!data.address?.trim()) errors.push('العنوان مطلوب')
    if (!data.emergencyContact?.trim()) errors.push('رقم الطوارئ مطلوب')
    if (!data.cityId) errors.push('المدينة مطلوبة')
    if (!data.hospitalId) errors.push('المستشفى مطلوب')
    
    return errors
  }

  // Enhanced error handling
  const handleError = (error: any) => {
    console.error('❌ Form error:', error)
    
    if (error.message?.includes('رقم الهوية الوطنية')) {
      setIdNumberError(error.message)
    } else {
      setIdNumberError('')
    }
    
    // Show user-friendly error message
    alert(error.message || 'حدث خطأ أثناء حفظ البيانات')
  }
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [patientImages, setPatientImages] = useState<Array<{
    id?: string
    imageUrl: string
    title?: string
    description?: string
    type?: string
  }>>([])
  const [availableTests, setAvailableTests] = useState<any[]>([])
  const [selectedTests, setSelectedTests] = useState<any[]>([])
  const [loadingTests, setLoadingTests] = useState(false)
  const [idNumberError, setIdNumberError] = useState<string>('')
  const [checkingIdNumber, setCheckingIdNumber] = useState<boolean>(false)

  // Debug: Log when patients change
  useEffect(() => {
  }, [dataPatients])

  const handleCityChange = (cityId: string) => {
    form.handleCityChange(cityId, hospitals)
  }

  const handleHospitalChange = (hospitalId: string) => {
    console.log('🏥 Hospital changed to:', hospitalId)
    form.handleHospitalChange(hospitalId, doctors)
    fetchAvailableTests(hospitalId)
  }

  const fetchAvailableTests = async (hospitalId: string) => {
    try {
      console.log('🔬 Fetching tests for hospital:', hospitalId)
      setLoadingTests(true)
      const response = await fetch(`/api/hospital-tests?hospitalId=${hospitalId}`)
      if (!response.ok) throw new Error('Failed to fetch tests')
      const data = await response.json()
      console.log('🔬 Tests fetched:', data.data?.length || 0, 'tests')
      setAvailableTests(data.data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
      setAvailableTests([])
    } finally {
      setLoadingTests(false)
    }
  }

  const addTest = (test: any) => {
    if (!selectedTests.find(t => t.id === test.id)) {
      setSelectedTests([...selectedTests, test])
    }
  }

  const removeTest = (testId: string) => {
    setSelectedTests(selectedTests.filter(t => t.id !== testId))
  }

  // Check ID number uniqueness
  const checkIdNumberUniqueness = async (idNumber: string): Promise<boolean> => {
    if (!idNumber || idNumber.trim() === '') {
      setIdNumberError('')
      return true
    }

    setCheckingIdNumber(true)
    setIdNumberError('')

    try {
      const response = await fetch(`/api/patients?idNumber=${encodeURIComponent(idNumber.trim())}`)
      const result = await response.json()

      if (result.exists) {
        const existingPatient = result.patient
        // Don't show error if editing the same patient
        if (editingPatient && existingPatient.id === editingPatient.id) {
          setIdNumberError('')
          return true
        }
        setIdNumberError(`رقم الهوية الوطنية مستخدم بالفعل للمريض ${existingPatient.firstName} ${existingPatient.lastName} (${existingPatient.patientNumber})`)
        return false
      } else {
        setIdNumberError('')
        return true
      }
    } catch (error) {
      console.error('خطأ في التحقق من رقم الهوية:', error)
      setIdNumberError('خطأ في التحقق من رقم الهوية')
      return false
    } finally {
      setCheckingIdNumber(false)
    }
  }

  // Debounced ID number check
  const debouncedCheckIdNumber = useCallback(
    debounce((idNumber: string) => {
      checkIdNumberUniqueness(idNumber)
    }, 500),
    []
  )

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  }

  const handleAdd = () => {
    setEditingPatient(null)
    form.resetForm()
    setPatientImages([])
    setAvailableTests([])
    setSelectedTests([])
    setIdNumberError('')
    setShowAddForm(true)
  }

  const handleEdit = (patient: Patient) => {
    console.log('🔄 handleEdit called with patient:', patient)
    console.log('🏥 Available hospitals:', hospitals.length)
    console.log('👨‍⚕️ Available doctors:', doctors.length)
    
    setEditingPatient(patient)
    setIdNumberError('')
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
    
    try {
      // Check if there's an ID number error
      if (idNumberError) {
        alert('يرجى إصلاح خطأ رقم الهوية الوطنية قبل المتابعة')
        return
      }

      // Final check for ID number uniqueness before submission
      if (form.formData.idNumber && form.formData.idNumber.trim()) {
        const isUnique = await checkIdNumberUniqueness(form.formData.idNumber)
        if (!isUnique) {
          alert('رقم الهوية الوطنية مستخدم بالفعل')
          return
        }
      }
      
      const patientData = form.preparePatientData(form.formData)

      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData)
      } else {
        // Include selected tests when creating new patient
        const patientDataWithTests = {
          ...patientData,
          selectedTests: selectedTests
        }
        await createPatient(patientDataWithTests)
      }
    } catch (error) {
      handleError(error)
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
      key: 'dateOfBirth' as keyof Patient,
      label: 'تاريخ الميلاد',
      render: (value: string) => {
        if (!value) return '-'
        try {
          const date = new Date(value)
          if (isNaN(date.getTime())) return 'تاريخ غير صحيح'
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        } catch (error) {
          return 'تاريخ غير صحيح'
        }
      },
      sortable: true
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
      key: 'idNumber' as keyof Patient,
      label: 'رقم الهوية الوطنية',
      render: (value: string) => (
        <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
          {value || 'غير محدد'}
        </span>
      ),
      sortable: true,
      searchable: true
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
    },
    {
      key: 'idNumber',
      label: 'رقم الهوية الوطنية',
      type: 'text' as const,
      placeholder: 'ابحث برقم الهوية الوطنية...'
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


  return (
    <div className="space-y-6">
      <UniversalTable
        title="إدارة المرضى"
        data={dataPatients}
        columns={columns}
        searchFields={['firstName', 'lastName', 'patientNumber', 'idNumber', 'phone', 'email']}
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
        loading={patientsLoading || checkingIdNumber}
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
          </FormGrid>
          <FormField label="التاريخ الطبي">
            <TextArea
              value={form.formData.medicalHistory}
              onChange={(value) => form.setFormData({ ...form.formData, medicalHistory: value })}
              placeholder="التاريخ الطبي السابق"
            />
          </FormField>
        </FormSection>

        {/* Tests Selection */}
        {form.selectedHospitalId && (
          <FormSection title="اختيار الفحوصات (اختياري)">
            <div className="space-y-4">
              {/* Debug info */}
              <div className="text-xs text-gray-500 mb-2">
                Debug: selectedHospitalId = {form.selectedHospitalId}, availableTests = {availableTests.length}
              </div>
              {/* Available Tests */}
              {availableTests.length > 0 && (
                <div className="space-y-3">
                  <FormField label="الفحوصات المتاحة">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
                      {availableTests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{test.name}</div>
                            <div className="text-xs text-gray-500">{test.category}</div>
                            {test.description && (
                              <div className="text-xs text-gray-400 mt-1">{test.description}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => addTest(test)}
                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            إضافة
                          </button>
                        </div>
                      ))}
                    </div>
                  </FormField>
                </div>
              )}

              {/* Selected Tests */}
              {selectedTests.length > 0 && (
                <div className="space-y-3">
                  <FormField label={`الفحوصات المختارة (${selectedTests.length})`}>
                    <div className="space-y-2">
                      {selectedTests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-4 h-4 text-blue-600 mr-2">🔬</div>
                            <div>
                              <div className="font-medium text-sm">{test.name}</div>
                              <div className="text-xs text-gray-500">{test.category}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTest(test.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </FormField>
                </div>
              )}

              {loadingTests && (
                <div className="text-center py-4 text-gray-500">
                  جاري تحميل الفحوصات...
                </div>
              )}

              {!loadingTests && availableTests.length === 0 && form.selectedHospitalId && (
                <div className="text-center py-4 text-gray-500">
                  لا توجد فحوصات متاحة في هذا المستشفى
                </div>
              )}
            </div>
          </FormSection>
        )}

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
            <FormField label="رقم الهوية الوطنية">
              <div>
                <TextInput
                  value={form.formData.idNumber}
                  onChange={(value) => {
                    form.setFormData({ ...form.formData, idNumber: value })
                    debouncedCheckIdNumber(value)
                  }}
                  placeholder="رقم الهوية الوطنية"
                  className={idNumberError ? 'border-red-500' : ''}
                />
                {checkingIdNumber && (
                  <div className="text-sm text-blue-600 mt-1">جاري التحقق...</div>
                )}
                {idNumberError && (
                  <div className="text-sm text-red-600 mt-1">{idNumberError}</div>
                )}
              </div>
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
          </FormGrid>
          <FormGrid cols={2}>
            <FormField label="رقم التأمين">
              <TextInput
                value={form.formData.insuranceNumber}
                onChange={(value) => form.setFormData({ ...form.formData, insuranceNumber: value })}
                placeholder="رقم التأمين"
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