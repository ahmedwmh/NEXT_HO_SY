'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text = 'جاري التحميل...', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-hospital-blue ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner text="جاري تحميل البيانات..." />
    </div>
  )
}
