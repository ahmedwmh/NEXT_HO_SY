'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { prisma } from '@/lib/db'
import type { Doctor, Hospital, City } from '@/types'

interface DoctorContextType {
  doctor: Doctor | null
  hospital: Hospital | null
  city: City | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined)

interface DoctorProviderProps {
  children: React.ReactNode
  doctorId?: string
}

export function DoctorProvider({ children, doctorId }: DoctorProviderProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctorData = async () => {
    if (!doctorId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/doctors/${doctorId}`)
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الطبيب')
      }

      const data = await response.json()
      setDoctor(data.doctor)
      setHospital(data.hospital)
      setCity(data.city)
    } catch (err) {
      console.error('خطأ في جلب بيانات الطبيب:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    await fetchDoctorData()
  }

  useEffect(() => {
    fetchDoctorData()
  }, [doctorId])

  const value: DoctorContextType = {
    doctor,
    hospital,
    city,
    loading,
    error,
    refreshData
  }

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  )
}

export function useDoctor() {
  const context = useContext(DoctorContext)
  if (context === undefined) {
    throw new Error('useDoctor must be used within a DoctorProvider')
  }
  return context
}

// Hook for getting filtered data based on doctor's hospital
export function useDoctorData() {
  const { doctor, hospital, city, loading, error } = useDoctor()
  
  return {
    doctor,
    hospital,
    city,
    hospitalId: hospital?.id,
    cityId: city?.id,
    loading,
    error,
    // Helper functions
    canAccessHospital: (targetHospitalId: string) => {
      return hospital?.id === targetHospitalId
    },
    canAccessCity: (targetCityId: string) => {
      return city?.id === targetCityId
    }
  }
}
