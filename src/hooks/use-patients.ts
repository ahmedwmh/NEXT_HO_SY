import { useState, useCallback } from 'react'
import { dataService, type Patient } from '@/lib/services/data-service'

interface UsePatientsOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UsePatientsReturn {
  patients: Patient[]
  loading: boolean
  error: string | null
  createPatient: (patient: Partial<Patient>) => Promise<Patient | null>
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<Patient | null>
  deletePatient: (id: string) => Promise<boolean>
  setPatients: (patients: Patient[]) => void
}

export function usePatients({
  onSuccess,
  onError,
}: UsePatientsOptions = {}): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback(
    (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      onError?.(errorMessage)
    },
    [onError]
  )

  const createPatient = useCallback(
    async (patient: Partial<Patient>): Promise<Patient | null> => {
      try {
        setLoading(true)
        setError(null)

        const newPatient = await dataService.createPatient(patient)
        setPatients(prev => [...prev, newPatient])
        onSuccess?.()
        return newPatient
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, handleError]
  )

  const updatePatient = useCallback(
    async (id: string, patient: Partial<Patient>): Promise<Patient | null> => {
      try {
        setLoading(true)
        setError(null)

        const updatedPatient = await dataService.updatePatient(id, patient)
        setPatients(prev => prev.map(p => (p.id === id ? updatedPatient : p)))
        onSuccess?.()
        return updatedPatient
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, handleError]
  )

  const deletePatient = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        await dataService.deletePatient(id)
        setPatients(prev => prev.filter(p => p.id !== id))
        return true
      } catch (err) {
        handleError(err)
        return false
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    setPatients,
  }
}

