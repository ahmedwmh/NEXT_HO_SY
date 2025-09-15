'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Eye, 
  Edit, 
  Trash2, 
  X,
  Image as ImageIcon
} from 'lucide-react'

interface ImageGalleryProps {
  images: Array<{
    id?: string
    imageUrl: string
    title?: string
    description?: string
    type?: string
  }>
  onEdit?: (index: number) => void
  onDelete?: (index: number) => void
  onAdd?: () => void
  maxImages?: number
  showActions?: boolean
  className?: string
}

export function ImageGallery({
  images = [],
  onEdit,
  onDelete,
  onAdd,
  maxImages = 10,
  showActions = true,
  className = ""
}: ImageGalleryProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }

  const closePreview = () => {
    setPreviewImage(null)
  }

  if (images.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">لا توجد صور</p>
        {onAdd && (
          <Button onClick={onAdd} variant="outline">
            إضافة صور
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Image Preview */}
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={image.title || `صورة ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openPreview(image.imageUrl)}
                />
                
                {/* Overlay Actions */}
                {showActions && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2 rtl:space-x-reverse">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => openPreview(image.imageUrl)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => onEdit(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => onDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="p-3">
                <h4 className="font-medium text-sm truncate mb-1">
                  {image.title || `صورة ${index + 1}`}
                </h4>
                {image.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {image.description}
                  </p>
                )}
                {image.type && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {image.type}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add More Button */}
        {onAdd && images.length < maxImages && (
          <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div 
                className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={onAdd}
              >
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">إضافة صورة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Counter */}
      <div className="text-center text-sm text-gray-500">
        {images.length} من {maxImages} صورة
      </div>

      {/* Full Screen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
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
    </div>
  )
}
