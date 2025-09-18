'use client'

import { useState, useCallback } from 'react'

interface UseCrudOptions<T> {
  endpoint: string
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

interface UseCrudReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  create: (item: Partial<T>) => Promise<T | null>
  update: (id: string, item: Partial<T>) => Promise<T | null>
  delete: (id: string) => Promise<boolean>
  fetch: () => Promise<void>
  setData: (data: T[]) => void
}

export function useCrud<T extends { id: string }>({
  endpoint,
  onSuccess,
  onError
}: UseCrudOptions<T>): UseCrudReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: any) => {
    const errorMessage = err.message || 'حدث خطأ غير متوقع'
    setError(errorMessage)
    onError?.(errorMessage)
  }, [onError])

  const create = useCallback(async (item: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await (globalThis as any).fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إنشاء العنصر')
      }

      const newItem = await response.json()
      setData(prev => [...prev, newItem])
      onSuccess?.(newItem)
      return newItem
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [endpoint, onSuccess, handleError])

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await (globalThis as any).fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في تحديث العنصر')
      }

      const updatedItem = await response.json()
      setData(prev => prev.map(item => item.id === id ? updatedItem : item))
      onSuccess?.(updatedItem)
      return updatedItem
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [endpoint, onSuccess, handleError])

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await (globalThis as any).fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حذف العنصر')
      }

      setData(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      handleError(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [endpoint, handleError])

  const fetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await (globalThis as any).fetch(endpoint)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في جلب البيانات')
      }

      const fetchedData = await response.json()
      console.log('useCrud fetch data received:', fetchedData)
      setData(fetchedData)
    } catch (err) {
      console.error('useCrud fetch error:', err)
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [endpoint, handleError])

  return {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteItem,
    fetch,
    setData
  }
}
