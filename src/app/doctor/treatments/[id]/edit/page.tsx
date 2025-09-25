'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Save, X } from 'lucide-react'

interface Treatment {
  id: string
  name: string
  description: string
  category: string
  cost: number
  duration: string
  quantity: number
  expiredate: string
  isActive: boolean
}

export default function EditTreatmentPage() {
  const router = useRouter()
  const params = useParams()
  const treatmentId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cost: '',
    duration: '',
    quantity: '',
    expiredate: '',
    isActive: true
  })

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const response = await fetch(`/api/hospital-treatments/${treatmentId}`)
        if (response.ok) {
          const result = await response.json()
          console.log('API Response:', result)
          const treatment: Treatment = result.data
          console.log('Treatment data:', treatment)
          setFormData({
            name: treatment.name || '',
            description: treatment.description || '',
            category: treatment.category || '',
            cost: treatment.cost ? treatment.cost.toString() : '0',
            duration: treatment.duration ? (treatment.duration.includes(':') ? '' : treatment.duration) : '',
            quantity: treatment.quantity ? treatment.quantity.toString() : '0',
            expiredate: treatment.expiredate ? new Date(treatment.expiredate).toISOString().split('T')[0] : '',
            isActive: treatment.isActive !== undefined ? treatment.isActive : true
          })
        } else {
          alert('فشل في تحميل بيانات العلاج')
          router.push('/doctor/treatments')
        }
      } catch (error) {
        console.error('Error fetching treatment:', error)
        alert('حدث خطأ أثناء تحميل بيانات العلاج')
        router.push('/doctor/treatments')
      } finally {
        setLoadingData(false)
      }
    }

    if (treatmentId) {
      fetchTreatment()
    }
  }, [treatmentId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/hospital-treatments/${treatmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: parseFloat(formData.cost) || 0,
          quantity: parseInt(formData.quantity) || 0
        })
      })

      if (response.ok) {
        alert('تم تحديث العلاج بنجاح')
        router.push('/doctor/treatments')
      } else {
        const error = await response.json()
        alert(`فشل في تحديث العلاج: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating treatment:', error)
      alert('حدث خطأ أثناء تحديث العلاج')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/doctor/treatments')
  }

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">جاري تحميل البيانات...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <ArrowRight className="h-5 w-5" />
            <span>تعديل العلاج</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم العلاج *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="أدخل اسم العلاج"
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
                    <SelectItem value="antibiotic">مضاد حيوي</SelectItem>
                    <SelectItem value="painkiller">مسكن</SelectItem>
                    <SelectItem value="vitamin">فيتامين</SelectItem>
                    <SelectItem value="supplement">مكمل غذائي</SelectItem>
                    <SelectItem value="injection">حقنة</SelectItem>
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
                placeholder="أدخل وصف العلاج"
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
                <Label htmlFor="duration">مدة العلاج (يوم)</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="7"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">الكمية *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="expiredate">تاريخ الانتهاء</Label>
                <Input
                  id="expiredate"
                  type="date"
                  value={formData.expiredate}
                  onChange={(e) => setFormData({ ...formData, expiredate: e.target.value })}
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
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
