'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, Plus, Eye, Edit, Trash2 } from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
}

interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  searchFields?: (keyof T)[]
  filters?: FilterOption[]
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  addButtonText?: string
  emptyMessage?: string
  loading?: boolean
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  searchFields = [],
  filters = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  addButtonText = 'إضافة جديد',
  emptyMessage = 'لا توجد بيانات',
  loading = false
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filter and search data
  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm) {
      const searchFieldsToUse = searchFields.length > 0 ? searchFields : columns.map(col => col.key)
      const matchesSearch = searchFieldsToUse.some(field => {
        const value = item[field]
        return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
      if (!matchesSearch) return false
    }

    // Active filters
    return Object.entries(activeFilters).every(([key, value]) => {
      if (!value) return true
      const itemValue = item[key as keyof T]
      return itemValue && String(itemValue) === value
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchTerm('')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          {filters.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="rtl:btn-icon"
            >
              <Filter className="h-4 w-4 rtl:ml-2" />
              فلترة
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="bg-hospital-blue hover:bg-hospital-darkBlue">
              <Plus className="h-4 w-4 rtl:ml-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>فلترة البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium mb-2">{filter.label}</label>
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">جميع {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  مسح الفلاتر
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة البيانات ({sortedData.length})</CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 rtl:search-icon" />
              <Input
                placeholder="البحث في البيانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={`text-right p-3 font-semibold ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span>{column.label}</span>
                        {column.sortable && sortField === column.key && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={String(column.key)} className="p-3">
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '')
                        }
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {onView && (
                          <Button size="sm" variant="outline" onClick={() => onView(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || Object.values(activeFilters).some(v => v) 
                ? 'لم يتم العثور على بيانات تطابق البحث' 
                : emptyMessage
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
