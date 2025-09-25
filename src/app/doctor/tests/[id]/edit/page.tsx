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

interface Test {
  id: string
  name: string
  description: string
  category: string
  cost: number
  duration: string
  isActive: boolean
}

export default function EditTestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
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
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/hospital-tests/${testId}`)
        if (response.ok) {
          const result = await response.json()
          const test: Test = result.data
          setFormData({
            name: test.name || '',
            description: test.description || '',
            category: test.category || '',
            cost: test.cost ? test.cost.toString() : '0',
            duration: test.duration ? (test.duration.includes(':') ? '' : test.duration) : '',
            isActive: test.isActive !== undefined ? test.isActive : true
          })
        } else {
          alert('فشل في تحميل بيانات الفحص')
          router.push('/doctor/tests')
        }
      } catch (error) {
        console.error('Error fetching test:', error)
        alert('حدث خطأ أثناء تحميل بيانات الفحص')
        router.push('/doctor/tests')
      } finally {
        setLoadingData(false)
      }
    }

    if (testId) {
      fetchTest()
    }
  }, [testId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/hospital-tests/${testId}`, {
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
        alert('تم تحديث الفحص بنجاح')
        router.push('/doctor/tests')
      } else {
        const error = await response.json()
        alert(`فشل في تحديث الفحص: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating test:', error)
      alert('حدث خطأ أثناء تحديث الفحص')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/doctor/tests')
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
            <span>تعديل الفحص</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم الفحص *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="أدخل اسم الفحص"
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
                    <SelectItem value="blood">فحص الدم</SelectItem>
                    <SelectItem value="urine">فحص البول</SelectItem>
                    <SelectItem value="xray">الأشعة</SelectItem>
                    <SelectItem value="ct">الأشعة المقطعية</SelectItem>
                    <SelectItem value="mri">الرنين المغناطيسي</SelectItem>
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
                placeholder="أدخل وصف الفحص"
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
                <Label htmlFor="duration">المدة (دقيقة)</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
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
