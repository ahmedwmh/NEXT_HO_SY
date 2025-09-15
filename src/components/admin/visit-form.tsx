'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createVisitSchema, type CreateVisitInput } from '@/lib/validations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormModal } from '@/components/ui/form-modal'
import { Activity, Calendar, User, Stethoscope } from 'lucide-react'

interface VisitFormProps {
  patientId: string
  patientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function VisitForm({ patientId, patientName, isOpen, onClose, onSuccess }: VisitFormProps) {
  const [formData, setFormData] = useState({
    scheduledAt: '',
    status: 'SCHEDULED',
    notes: '',
    diagnosis: '',
    prescription: '',
    symptoms: '',
    vitalSigns: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    weight: '',
    height: '',
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

  const createVisitMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/visits', {
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
        throw new Error(error.message || 'Failed to create visit')
      }

      return response.json()
    },
    onSuccess: () => {
      onSuccess?.()
      onClose()
      setFormData({
        scheduledAt: '',
        status: 'SCHEDULED',
        notes: '',
        diagnosis: '',
        prescription: '',
        symptoms: '',
        vitalSigns: '',
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        weight: '',
        height: '',
        doctorId: '',
        hospitalId: ''
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createVisitMutation.mutateAsync(formData)
  }

  const statusOptions = [
    { value: 'SCHEDULED', label: 'مجدولة' },
    { value: 'IN_PROGRESS', label: 'جارية' },
    { value: 'COMPLETED', label: 'مكتملة' },
    { value: 'CANCELLED', label: 'ملغية' }
  ]

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة زيارة جديدة - ${patientName}`}
      onSubmit={handleSubmit}
      submitText="حفظ الزيارة"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Activity className="h-5 w-5" />
              <span>معلومات الزيارة الأساسية</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">تاريخ ووقت الزيارة *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="hospital-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">حالة الزيارة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="hospital-input">
                    <SelectValue placeholder="اختر حالة الزيارة" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">الطبيب *</Label>
                <Select value={formData.doctorId} onValueChange={(value) => setFormData({ ...formData, doctorId: value })}>
                  <SelectTrigger className="hospital-input">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalId">المستشفى *</Label>
                <Select value={formData.hospitalId} onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}>
                  <SelectTrigger className="hospital-input">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Stethoscope className="h-5 w-5" />
              <span>المعلومات الطبية</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">الأعراض</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="hospital-input"
                placeholder="وصف الأعراض التي يشكو منها المريض"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">التشخيص</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="hospital-input"
                placeholder="تشخيص الحالة"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">الوصفة الطبية</Label>
              <Textarea
                id="prescription"
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                className="hospital-input"
                placeholder="الأدوية والجرعات الموصوفة"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Activity className="h-5 w-5" />
              <span>العلامات الحيوية</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">درجة الحرارة</Label>
                <Input
                  id="temperature"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="hospital-input"
                  placeholder="°C"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">ضغط الدم</Label>
                <Input
                  id="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  className="hospital-input"
                  placeholder="120/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">معدل النبض</Label>
                <Input
                  id="heartRate"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  className="hospital-input"
                  placeholder="bpm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">الوزن</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="hospital-input"
                  placeholder="kg"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="height">الطول</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="hospital-input"
                  placeholder="cm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="h-5 w-5" />
              <span>ملاحظات إضافية</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="hospital-input"
                placeholder="أي ملاحظات إضافية حول الزيارة"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </FormModal>
  )
}

