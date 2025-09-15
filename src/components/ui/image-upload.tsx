'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  Image as ImageIcon,
  Plus
} from 'lucide-react'

interface ImageUploadProps {
  images: Array<{
    id?: string
    imageUrl: string
    title?: string
    description?: string
    type?: string
  }>
  onImagesChange: (images: Array<{
    id?: string
    imageUrl: string
    title?: string
    description?: string
    type?: string
  }>) => void
  maxImages?: number
  accept?: string
  className?: string
}

export function ImageUpload({
  images = [],
  onImagesChange,
  maxImages = 10,
  accept = "image/*",
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      alert(`يمكن رفع ${maxImages} صورة كحد أقصى`)
      return
    }

    setIsUploading(true)
    const newImages = [...images]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى رفع ملفات صور فقط')
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
        continue
      }

      try {
        // Upload file to server
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Add to images array
          newImages.push({
            imageUrl: result.imageUrl,
            title: file.name.split('.')[0],
            description: '',
            type: 'medical'
          })
        } else {
          alert(`خطأ في رفع ${file.name}: ${result.error}`)
        }
      } catch (error) {
        console.error('خطأ في رفع الملف:', error)
        // Fallback to local preview
        const imageUrl = URL.createObjectURL(file)
        newImages.push({
          imageUrl,
          title: file.name.split('.')[0],
          description: '',
          type: 'medical'
        })
      }
    }

    onImagesChange(newImages)
    setIsUploading(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const updateImage = (index: number, updates: Partial<{
    title: string
    description: string
    type: string
  }>) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], ...updates }
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }

  const closePreview = () => {
    setPreviewImage(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="space-y-2">
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <p className="text-lg font-medium text-gray-700">
            اسحب الصور هنا أو انقر للرفع
          </p>
          <p className="text-sm text-gray-500">
            يمكنك رفع عدة صور مرة واحدة (PNG, JPG, JPEG)
          </p>
          <p className="text-xs text-gray-400">
            الحد الأقصى: {maxImages} صورة، 5 ميجابايت لكل صورة
          </p>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.imageUrl}
                    alt={image.title || `صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1 rtl:space-x-reverse">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => openPreview(image.imageUrl)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingImage(editingImage === image.imageUrl ? null : image.imageUrl)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image Details */}
                <div className="p-3">
                  {editingImage === image.imageUrl ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`title-${index}`} className="text-xs">العنوان</Label>
                        <Input
                          id={`title-${index}`}
                          value={image.title || ''}
                          onChange={(e) => updateImage(index, { title: e.target.value })}
                          placeholder="عنوان الصورة"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${index}`} className="text-xs">الوصف</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={image.description || ''}
                          onChange={(e) => updateImage(index, { description: e.target.value })}
                          placeholder="وصف الصورة"
                          className="text-xs h-16"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`type-${index}`} className="text-xs">النوع</Label>
                        <select
                          id={`type-${index}`}
                          value={image.type || 'medical'}
                          onChange={(e) => updateImage(index, { type: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                        >
                          <option value="profile">صورة شخصية</option>
                          <option value="document">وثيقة</option>
                          <option value="medical">طبية</option>
                          <option value="xray">أشعة</option>
                          <option value="lab">مختبر</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm truncate">
                        {image.title || `صورة ${index + 1}`}
                      </h4>
                      {image.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      {image.type && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {image.type}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          {images.length} من {maxImages} صورة
        </div>
      )}

      {/* Full Screen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={closePreview}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={previewImage}
              alt="معاينة الصورة"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">جاري رفع الصور...</p>
        </div>
      )}
    </div>
  )
}
