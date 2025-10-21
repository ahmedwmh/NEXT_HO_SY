'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Heart, Building, Filter, Plus, Edit, Trash2, X } from 'lucide-react'
import { useDoctorDataFilter } from '@/hooks/use-doctor-data'

interface Disease {
  id: string
  name: string
  description: string
  category: string
  severity: string
  isActive: boolean
  hospital: {
    id: string
    name: string
    city: {
      id: string
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

interface DiseaseForm {
  name: string
  description: string
  category: string
  severity: string
}

export default function DoctorDiseasesPage() {
  const { hospitalId, cityId, loading: doctorDataLoading } = useDoctorDataFilter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [formData, setFormData] = useState<DiseaseForm>({
    name: '',
    description: '',
    category: '',
    severity: ''
  })

  // Fetch diseases for the doctor's hospital
  const { data: diseases = [], isLoading, error } = useQuery({
    queryKey: ['hospital-diseases', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return []
      const response = await fetch(`/api/hospital-diseases?hospitalId=${hospitalId}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data || []
    },
    enabled: !!hospitalId && !doctorDataLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create disease mutation
  const createMutation = useMutation({
    mutationFn: async (diseaseData: DiseaseForm) => {
      const response = await fetch('/api/hospital-diseases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          diseases: [diseaseData]
        })
      })
      const data = await response.json()
      if (!data.message) throw new Error(data.error || 'Failed to create disease')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-diseases', hospitalId] })
      setShowForm(false)
      setFormData({ name: '', description: '', category: '', severity: '' })
    }
  })

  // Update disease mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: DiseaseForm }) => {
      const response = await fetch(`/api/hospital-diseases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (!result.message) throw new Error(result.error || 'Failed to update disease')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-diseases', hospitalId] })
      setShowForm(false)
      setEditingDisease(null)
      setFormData({ name: '', description: '', category: '', severity: '' })
    }
  })

  // Delete disease mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/hospital-diseases/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!data.message) throw new Error(data.error || 'Failed to delete disease')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-diseases', hospitalId] })
    }
  })

  // Filter diseases based on search and filters
  const filteredDiseases = diseases.filter((disease: Disease) => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disease.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || disease.category === selectedCategory
    const matchesSeverity = !selectedSeverity || disease.severity === selectedSeverity
    
    return matchesSearch && matchesCategory && matchesSeverity
  })

  // Get unique categories and severities for filters
  const categories = Array.from(new Set(diseases.map((d: Disease) => d.category).filter(Boolean))) as string[]
  const severities = Array.from(new Set(diseases.map((d: Disease) => d.severity).filter(Boolean))) as string[]

  // Form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDisease) {
      updateMutation.mutate({ id: editingDisease.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    setFormData({
      name: disease.name,
      description: disease.description || '',
      category: disease.category || '',
      severity: disease.severity || ''
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المرض؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDisease(null)
    setFormData({ name: '', description: '', category: '', severity: '' })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'منخفض':
        return 'bg-green-100 text-green-800'
      case 'medium':
      case 'متوسط':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
      case 'عالي':
        return 'bg-red-100 text-red-800'
      case 'critical':
      case 'حرج':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'cardiac':
      case 'قلبية':
        return 'bg-red-100 text-red-800'
      case 'neurological':
      case 'عصبية':
        return 'bg-blue-100 text-blue-800'
      case 'respiratory':
      case 'تنفسية':
        return 'bg-green-100 text-green-800'
      case 'digestive':
      case 'هضمية':
        return 'bg-yellow-100 text-yellow-800'
      case 'infectious':
      case 'معدية':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (doctorDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="w-8 h-8 ml-3 text-red-500" />
            الأمراض المتاحة
          </h1>
          <p className="text-gray-600 mt-2">
            قائمة الأمراض المتاحة في مستشفاك
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مرض جديد
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الأمراض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع المستويات</option>
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedSeverity('')
              }}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 ml-2" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diseases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredDiseases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد أمراض متاحة
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory || selectedSeverity
                ? 'لم يتم العثور على أمراض تطابق معايير البحث'
                : 'لا توجد أمراض مسجلة في مستشفاك بعد'
              }
            </p>
          </div>
        ) : (
          filteredDiseases.map((disease: Disease) => (
            <Card key={disease.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {disease.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={disease.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {disease.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(disease)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(disease.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {disease.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {disease.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {disease.category && (
                    <Badge className={getCategoryColor(disease.category)}>
                      {disease.category}
                    </Badge>
                  )}
                  {disease.severity && (
                    <Badge className={getSeverityColor(disease.severity)}>
                      {disease.severity}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <Building className="w-3 h-3 ml-1" />
                  <span>{disease.hospital.name}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {!isLoading && diseases.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{diseases.length}</div>
                <div className="text-sm text-gray-600">إجمالي الأمراض</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {diseases.filter((d: Disease) => d.isActive).length}
                </div>
                <div className="text-sm text-gray-600">أمراض نشطة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                <div className="text-sm text-gray-600">فئات مختلفة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{severities.length}</div>
                <div className="text-sm text-gray-600">مستويات خطورة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disease Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 ml-2 text-red-500" />
                  {editingDisease ? 'تعديل المرض' : 'إضافة مرض جديد'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المرض *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم المرض"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف المرض</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="أدخل وصف المرض"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">فئة المرض</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فئة المرض" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="قلبية">قلبية</SelectItem>
                        <SelectItem value="عصبية">عصبية</SelectItem>
                        <SelectItem value="تنفسية">تنفسية</SelectItem>
                        <SelectItem value="هضمية">هضمية</SelectItem>
                        <SelectItem value="معدية">معدية</SelectItem>
                        <SelectItem value="جلدية">جلدية</SelectItem>
                        <SelectItem value="عظمية">عظمية</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity">مستوى الخطورة</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى الخطورة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="منخفض">منخفض</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="عالي">عالي</SelectItem>
                        <SelectItem value="حرج">حرج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        {editingDisease ? 'جاري التحديث...' : 'جاري الإضافة...'}
                      </div>
                    ) : (
                      editingDisease ? 'تحديث المرض' : 'إضافة المرض'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
