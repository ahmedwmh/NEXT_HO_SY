import { useState, useEffect } from 'react'
import { useDoctorData } from '@/contexts/doctor-context'
import type { Patient, Hospital, Doctor, City } from '@/types'

interface UseDoctorDataOptions {
  doctorId?: string
}

export function useDoctorDataFilter(options: UseDoctorDataOptions = {}) {
  const { doctor, hospital, city, hospitalId, cityId, loading, error } = useDoctorData()
  const [filteredData, setFilteredData] = useState<{
    patients: Patient[]
    hospitals: Hospital[]
    doctors: Doctor[]
    cities: City[]
  }>({
    patients: [],
    hospitals: [],
    doctors: [],
    cities: []
  })

  // Fetch data filtered by doctor's hospital
  const fetchFilteredData = async () => {
    if (!hospitalId || !cityId) return

    try {
      // Fetch patients from doctor's hospital only
      const patientsResponse = await fetch(`/api/patients?hospitalId=${hospitalId}`)
      const patientsData = await patientsResponse.json()
      
      // For doctors, only show their hospital
      const hospitalsData = { data: hospital ? [hospital] : [] }
      
      // Fetch doctors from doctor's hospital only
      const doctorsResponse = await fetch(`/api/doctors?hospitalId=${hospitalId}`)
      const doctorsData = await doctorsResponse.json()
      
      // For doctors, only show their city
      const citiesData = { data: city ? [city] : [] }

      setFilteredData({
        patients: patientsData.data || [],
        hospitals: hospitalsData.data || [],
        doctors: doctorsData.data || [],
        cities: citiesData.data || []
      })
    } catch (err) {
      console.error('خطأ في جلب البيانات المفلترة:', err)
    }
  }

  useEffect(() => {
    if (hospitalId && cityId) {
      fetchFilteredData()
    }
  }, [hospitalId, cityId])

  return {
    doctor,
    hospital,
    city,
    hospitalId,
    cityId,
    loading,
    error,
    filteredData,
    refreshData: fetchFilteredData,
    // Helper functions
    canAccessHospital: (targetHospitalId: string) => {
      return hospitalId === targetHospitalId
    },
    canAccessCity: (targetCityId: string) => {
      return cityId === targetCityId
    },
    // Get default values for forms
    getDefaultFormValues: () => ({
      cityId: cityId || '',
      hospitalId: hospitalId || '',
      doctorId: doctor?.id || ''
    })
  }
}

// Hook for checking permissions
export function useDoctorPermissions() {
  const { doctor, hospital, city, hospitalId } = useDoctorData()

  return {
    canView: (resource: 'patients' | 'visits' | 'tests' | 'treatments' | 'operations') => {
      // Doctor can view all resources in their hospital
      return !!hospitalId
    },
    canCreate: (resource: 'patients' | 'visits' | 'tests' | 'treatments' | 'operations') => {
      // Doctor can create all resources in their hospital
      return !!hospitalId
    },
    canEdit: (resource: 'patients' | 'visits' | 'tests' | 'treatments' | 'operations', resourceHospitalId?: string) => {
      // Doctor can edit resources in their hospital only
      return !!hospitalId && (!resourceHospitalId || resourceHospitalId === hospitalId)
    },
    canDelete: (resource: 'patients' | 'visits' | 'tests' | 'treatments' | 'operations', resourceHospitalId?: string) => {
      // Doctor can delete resources in their hospital only
      return !!hospitalId && (!resourceHospitalId || resourceHospitalId === hospitalId)
    },
    // Get filtered options for selects
    getFilteredOptions: () => ({
      cities: city ? [{ value: city.id, label: city.name }] : [],
      hospitals: hospital ? [{ value: hospital.id, label: hospital.name }] : [],
      doctors: doctor ? [{ value: doctor.id, label: `د. ${doctor.firstName} ${doctor.lastName}` }] : []
    })
  }
}
