'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormModal } from '@/components/ui/form-modal'
import { TestTube, Calendar, User, FileText } from 'lucide-react'

interface TestFormProps {
  patientId: string
  patientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function TestForm({ patientId, patientName, isOpen, onClose, onSuccess }: TestFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scheduledAt: '',
    status: 'SCHEDULED',
    results: '',
    notes: '',
    doctorId: '',
    hospitalId: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/doctors', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const result = await response.json()
      return result.data || []
    },
  })

  // Fetch hospitals
  const { data: hospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/hospitals', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const result = await response.json()
      return result.data || []
    },
  })

  const createTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          patientId,
          scheduledAt: new Date(data.scheduledAt).toISOString()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create test')
      }

      return response.json()
    },
    onSuccess: () => {
      onSuccess?.()
      onClose()
      setFormData({
        name: '',
        description: '',
        scheduledAt: '',
        status: 'SCHEDULED',
        results: '',
        notes: '',
        doctorId: '',
        hospitalId: ''
      })
    },
  })

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name) {
      errors.name = 'نوع الفحص مطلوب'
    }
    if (!formData.scheduledAt) {
      errors.scheduledAt = 'تاريخ ووقت الفحص مطلوب'
    }
    if (!formData.doctorId) {
      errors.doctorId = 'الطبيب المسؤول مطلوب'
    }
    if (!formData.hospitalId) {
      errors.hospitalId = 'المستشفى مطلوب'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    await createTestMutation.mutateAsync(formData)
  }

  const statusOptions = [
    { value: 'SCHEDULED', label: 'مجدول' },
    { value: 'IN_PROGRESS', label: 'جاري' },
    { value: 'COMPLETED', label: 'مكتمل' },
    { value: 'CANCELLED', label: 'ملغي' }
  ]

  const testTypes = [
    'تحليل دم شامل',
    'تحليل بول',
    'تحليل براز',
    'أشعة سينية',
    'أشعة مقطعية',
    'رنين مغناطيسي',
    'تخطيط قلب',
    'تخطيط دماغ',
    'فحص عيون',
    'فحص أذن',
    'فحص أسنان',
    'فحص جلد',
    'فحص عظام',
    'فحص أعصاب',
    'فحص نفسي',
    'فحص نسائي',
    'فحص ذكوري',
    'فحص أطفال',
    'فحص مسنين',
    'فحص آخر'
  ]

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة فحص جديد - ${patientName}`}
      onSubmit={handleSubmit}
      submitText="حفظ الفحص"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <TestTube className="h-5 w-5" />
              <span>معلومات الفحص الأساسية</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">نوع الفحص *</Label>
                <Select value={formData.name} onValueChange={(value) => setFormData({ ...formData, name: value })}>
                  <SelectTrigger className={`hospital-input ${validationErrors.name ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="اختر نوع الفحص" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.name && (
                  <p className="text-red-500 text-sm">{validationErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">تاريخ ووقت الفحص *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className={`hospital-input ${validationErrors.scheduledAt ? 'border-red-500' : ''}`}
                />
                {validationErrors.scheduledAt && (
                  <p className="text-red-500 text-sm">{validationErrors.scheduledAt}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الفحص</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="hospital-input"
                placeholder="وصف تفصيلي للفحص المطلوب"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">الطبيب المسؤول *</Label>
                <Select value={formData.doctorId} onValueChange={(value) => setFormData({ ...formData, doctorId: value })}>
                  <SelectTrigger className={`hospital-input ${validationErrors.doctorId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        د. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.doctorId && (
                  <p className="text-red-500 text-sm">{validationErrors.doctorId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalId">المستشفى *</Label>
                <Select value={formData.hospitalId} onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}>
                  <SelectTrigger className={`hospital-input ${validationErrors.hospitalId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="اختر المستشفى" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((hospital: any) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.hospitalId && (
                  <p className="text-red-500 text-sm">{validationErrors.hospitalId}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <FileText className="h-5 w-5" />
              <span>نتائج الفحص</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">حالة الفحص</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="hospital-input">
                  <SelectValue placeholder="اختر حالة الفحص" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="results">النتائج</Label>
              <Textarea
                id="results"
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                className="hospital-input"
                placeholder="نتائج الفحص التفصيلية"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="hospital-input"
                placeholder="ملاحظات إضافية حول الفحص"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </FormModal>
  )
}

