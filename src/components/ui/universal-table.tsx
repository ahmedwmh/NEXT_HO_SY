'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  searchable?: boolean
  render?: (value: any, item: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface FilterOption {
  key: string
  label: string
  type: 'select' | 'date' | 'text' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface UniversalTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title: string
  searchFields?: (keyof T | string)[]
  filters?: FilterOption[]
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  onRefresh?: () => void
  onExport?: () => void
  addButtonText?: string
  emptyMessage?: string
  loading?: boolean
  itemsPerPage?: number
  showPagination?: boolean
  showSearch?: boolean
  showFilters?: boolean
  showActions?: boolean
  customActions?: (item: T) => Array<{
    label: string
    onClick: () => void
    icon?: any
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  }>
  className?: string
}

export function UniversalTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchFields = [],
  filters = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onExport,
  addButtonText = 'إضافة جديد',
  emptyMessage = 'لا توجد بيانات متاحة',
  loading = false,
  itemsPerPage = 30,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  customActions,
  className = ''
}: UniversalTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = item[key]
          if (typeof value === 'string') {
            return itemValue && itemValue.toString().toLowerCase().includes(value.toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    return filtered
  }, [data, searchTerm, searchFields, activeFilters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortField, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchTerm('')
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">جاري التحميل...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            {showSearch && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-64"
                />
              </div>
            )}
            
            {showFilters && filters.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Filter className="h-4 w-4" />
                <span>فلترة</span>
                {Object.keys(activeFilters).length > 0 && (
                  <Badge variant="secondary" className="mr-1">
                    {Object.keys(activeFilters).length}
                  </Badge>
                )}
              </Button>
            )}
            
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {onExport && (
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {onAdd && (
              <Button onClick={onAdd} className="bg-hospital-blue hover:bg-hospital-darkBlue">
                <Plus className="h-4 w-4 ml-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && filters.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {filter.type === 'select' ? (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hospital-blue"
                    >
                      <option value="">جميع {filter.label}</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <Input
                      type="date"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <Input
                      type={filter.type}
                      placeholder={filter.placeholder || `البحث في ${filter.label}`}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          column.width ? `w-${column.width}` : ''
                        } ${column.align === 'center' ? 'text-center' : column.align === 'left' ? 'text-left' : 'text-right'}`}
                      >
                        {column.sortable ? (
                          <button
                            onClick={() => handleSort(column.key as string)}
                            className="flex items-center space-x-1 rtl:space-x-reverse hover:text-gray-700"
                          >
                            <span>{column.label}</span>
                            {sortField === column.key && (
                              <span className="text-hospital-blue">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        ) : (
                          column.label
                        )}
                      </th>
                    ))}
                    {showActions && (onEdit || onDelete || onView || customActions) && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        الإجراءات
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                            column.align === 'center' ? 'text-center' : column.align === 'left' ? 'text-left' : 'text-right'
                          }`}
                        >
                          {column.render
                            ? column.render(item[column.key], item, index)
                            : item[column.key]?.toString() || '-'
                          }
                        </td>
                      ))}
                      {showActions && (onEdit || onDelete || onView || customActions) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {customActions ? (
                              customActions(item).map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  variant={action.variant || "outline"}
                                  size="sm"
                                  onClick={action.onClick}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  {action.icon && <action.icon className="h-4 w-4" />}
                                  {action.label}
                                </Button>
                              ))
                            ) : (
                              <>
                                {onView && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onView(item)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {onEdit && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(item)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(item)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      عرض{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      إلى{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, sortedData.length)}
                      </span>{' '}
                      من{' '}
                      <span className="font-medium">{sortedData.length}</span>{' '}
                      نتيجة
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Button
                        variant="outline"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronsRight className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      
                      {getPageNumbers().map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          onClick={() => goToPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-hospital-blue border-hospital-blue text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronsLeft className="h-5 w-5" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
