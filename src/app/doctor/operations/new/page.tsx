'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Save, X } from 'lucide-react'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'

export default function NewOperationPage() {
  const router = useRouter()
  const { hospitalId } = useDoctorDataFilter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cost: '',
    duration: '',
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId) {
      alert('يرجى اختيار مستشفى أولاً')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/hospital-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          hospitalId,
          cost: parseFloat(formData.cost) || 0
        })
      })

      if (response.ok) {
        alert('تم إضافة العملية بنجاح')
        router.push('/doctor/operations')
      } else {
        const error = await response.json()
        alert(`فشل في إضافة العملية: ${error.message}`)
      }
    } catch (error) {
      console.error('Error adding operation:', error)
      alert('حدث خطأ أثناء إضافة العملية')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/doctor/operations')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <ArrowRight className="h-5 w-5" />
            <span>إضافة عملية جديدة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم العملية *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="أدخل اسم العملية"
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiac">جراحة القلب</SelectItem>
                    <SelectItem value="orthopedic">جراحة العظام</SelectItem>
                    <SelectItem value="neurological">جراحة الأعصاب</SelectItem>
                    <SelectItem value="general">جراحة عامة</SelectItem>
                    <SelectItem value="plastic">جراحة التجميل</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف العملية"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">التكلفة (دينار) *</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="duration">المدة (ساعة)</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
