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

interface Operation {
  id: string
  name: string
  description: string
  category: string
  cost: number
  duration: string
  isActive: boolean
}

export default function EditOperationPage() {
  const router = useRouter()
  const params = useParams()
  const operationId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cost: '',
    duration: '',
    isActive: true
  })

  useEffect(() => {
    const fetchOperation = async () => {
      try {
        const response = await fetch(`/api/hospital-operations/${operationId}`)
        if (response.ok) {
          const result = await response.json()
          const operation: Operation = result.data
          setFormData({
            name: operation.name || '',
            description: operation.description || '',
            category: operation.category || '',
            cost: operation.cost ? operation.cost.toString() : '0',
            duration: operation.duration ? (operation.duration.includes(':') ? '' : operation.duration) : '',
            isActive: operation.isActive !== undefined ? operation.isActive : true
          })
        } else {
          alert('فشل في تحميل بيانات العملية')
          router.push('/doctor/operations')
        }
      } catch (error) {
        console.error('Error fetching operation:', error)
        alert('حدث خطأ أثناء تحميل بيانات العملية')
        router.push('/doctor/operations')
      } finally {
        setLoadingData(false)
      }
    }

    if (operationId) {
      fetchOperation()
    }
  }, [operationId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/hospital-operations/${operationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: parseFloat(formData.cost) || 0
        })
      })

      if (response.ok) {
        alert('تم تحديث العملية بنجاح')
        router.push('/doctor/operations')
      } else {
        const error = await response.json()
        alert(`فشل في تحديث العملية: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating operation:', error)
      alert('حدث خطأ أثناء تحديث العملية')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/doctor/operations')
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
            <span>تعديل العملية</span>
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
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
