import { useState, useEffect, useCallback } from 'react'
import { dataService, type City, type Hospital, type Doctor, type Patient } from '@/lib/services/data-service'

interface UseDataReturn {
  cities: City[]
  hospitals: Hospital[]
  doctors: Doctor[]
  patients: Patient[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useData(): UseDataReturn {
  const [cities, setCities] = useState<City[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug: Monitor hospitals state changes
  useEffect(() => {
    console.log('🔄 useData: hospitals state changed to:', hospitals.length, 'hospitals')
  }, [hospitals])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      
      // Load each data source independently to handle individual failures
      const loadCities = dataService.getCities().then(data => {
        return data
      }).catch(err => {
        console.error('❌ useData: Cities failed:', err)
        return []
      })

      const loadHospitals = dataService.getHospitals().then(data => {
        console.log('🏥 useData: Hospitals loaded:', data)
        return data
      }).catch(err => {
        console.error('❌ useData: Hospitals failed:', err)
        return []
      })

      const loadDoctors = dataService.getDoctors().then(data => {
        console.log('👨‍⚕️ useData: Doctors loaded:', data)
        return data
      }).catch(err => {
        console.error('❌ useData: Doctors failed:', err)
        return []
      })

      const loadPatients = dataService.getPatients().then(data => {
        console.log('👥 useData: Patients loaded:', data)
        return data
      }).catch(err => {
        console.error('❌ useData: Patients failed:', err)
        return []
      })

      // Wait for all to complete (even if some fail)
      const [citiesData, hospitalsData, doctorsData, patientsData] = await Promise.allSettled([
        loadCities,
        loadHospitals,
        loadDoctors,
        loadPatients
      ])

      console.log('✅ useData: All data loading completed, updating state...')
      
      // Debug: Log the settled promises
      console.log('🔍 useData: Settled promises:', {
        citiesData: { status: citiesData.status, hasValue: citiesData.status === 'fulfilled' ? !!citiesData.value : false },
        hospitalsData: { status: hospitalsData.status, hasValue: hospitalsData.status === 'fulfilled' ? !!hospitalsData.value : false },
        doctorsData: { status: doctorsData.status, hasValue: doctorsData.status === 'fulfilled' ? !!doctorsData.value : false },
        patientsData: { status: patientsData.status, hasValue: patientsData.status === 'fulfilled' ? !!patientsData.value : false }
      })
      
      // Extract data from settled promises
      const citiesResult = citiesData.status === 'fulfilled' ? citiesData.value : []
      const hospitalsResult = hospitalsData.status === 'fulfilled' ? hospitalsData.value : []
      const doctorsResult = doctorsData.status === 'fulfilled' ? doctorsData.value : []
      const patientsResult = patientsData.status === 'fulfilled' ? patientsData.value : []
      
      console.log('🔍 useData: Raw results:', {
        citiesData: citiesData.status,
        hospitalsData: hospitalsData.status,
        doctorsData: doctorsData.status,
        patientsData: patientsData.status
      })
      
      console.log('🔍 useData: Extracted results:', {
        citiesResult: Array.isArray(citiesResult) ? citiesResult.length : 'not array',
        hospitalsResult: Array.isArray(hospitalsResult) ? hospitalsResult.length : 'not array',
        doctorsResult: Array.isArray(doctorsResult) ? doctorsResult.length : 'not array',
        patientsResult: Array.isArray(patientsResult) ? patientsResult.length : 'not array'
      })
      
      console.log('📊 useData: Extracted data:', {
        citiesCount: Array.isArray(citiesResult) ? citiesResult.length : 0,
        hospitalsCount: Array.isArray(hospitalsResult) ? hospitalsResult.length : 0,
        doctorsCount: Array.isArray(doctorsResult) ? doctorsResult.length : 0,
        patientsCount: Array.isArray(patientsResult) ? patientsResult.length : 0,
        patients: Array.isArray(patientsResult) ? patientsResult.slice(0, 2) : [] // Show first 2 patients
      })
      
      console.log('🔄 useData: Setting state...')
      setCities(Array.isArray(citiesResult) ? citiesResult : [])
      console.log('🔄 useData: Setting hospitals to:', Array.isArray(hospitalsResult) ? hospitalsResult.length : 'not array')
      setHospitals(Array.isArray(hospitalsResult) ? hospitalsResult : [])
      setDoctors(Array.isArray(doctorsResult) ? doctorsResult : [])
      setPatients(Array.isArray(patientsResult) ? patientsResult : [])
      
      console.log('✅ useData: State updated successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      console.error('❌ useData: Unexpected error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log('🔄 useData: Loading completed')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    cities,
    hospitals,
    doctors,
    patients,
    loading,
    error,
    refetch: loadData,
  }
}
