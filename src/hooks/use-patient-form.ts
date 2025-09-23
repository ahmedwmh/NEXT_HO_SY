import { useState, useCallback } from 'react'
import { type Patient, type Hospital, type Doctor } from '@/lib/services/data-service'

interface PatientFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies: string
  medicalHistory: string
  nationality: string
  idNumber: string
  cityId: string
  hospitalId: string
  doctorId: string
  insuranceNumber: string
  maritalStatus: string
  occupation: string
  notes: string
  selectedTests?: any[]
}

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  address: '',
  emergencyContact: '',
  bloodType: '',
  allergies: '',
  medicalHistory: '',
  nationality: '',
  idNumber: '',
  cityId: '',
  hospitalId: '',
  doctorId: '',
  insuranceNumber: '',
  maritalStatus: '',
  occupation: '',
  notes: '',
  selectedTests: []
}

export function usePatientForm() {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData)
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setSelectedCityId('')
    setSelectedHospitalId('')
    setFilteredHospitals([])
    setFilteredDoctors([])
  }, [])

  const populateForm = useCallback((patient: Patient) => {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth.split('T')[0],
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      bloodType: patient.bloodType,
      allergies: patient.allergies || '',
      medicalHistory: patient.medicalHistory || '',
      nationality: patient.nationality || '',
      idNumber: patient.idNumber || '',
      cityId: patient.hospital?.city?.id || '',
      hospitalId: patient.hospitalId,
      doctorId: '', // This would need to be determined based on your data structure
      insuranceNumber: patient.insuranceNumber || '',
      maritalStatus: patient.maritalStatus || '',
      occupation: patient.occupation || '',
      notes: patient.notes || '',
      selectedTests: []
    })
    setSelectedCityId(patient.hospital?.city?.id || '')
    setSelectedHospitalId(patient.hospitalId)
  }, [])

  const handleCityChange = useCallback(
    (cityId: string, hospitals: Hospital[]) => {
      setSelectedCityId(cityId)
      setSelectedHospitalId('')
      setFormData(prev => ({ ...prev, cityId, hospitalId: '', doctorId: '' }))
      
      const cityHospitals = hospitals.filter(hospital => hospital.cityId === cityId)
      setFilteredHospitals(cityHospitals)
      setFilteredDoctors([])
    },
    []
  )

  const handleHospitalChange = useCallback(
    (hospitalId: string, doctors: Doctor[]) => {
      console.log('🏥 usePatientForm: Hospital changed to:', hospitalId)
      setSelectedHospitalId(hospitalId)
      setFormData(prev => ({ ...prev, hospitalId, doctorId: '' }))
      
      const hospitalDoctors = doctors.filter(doctor => doctor.hospitalId === hospitalId)
      setFilteredDoctors(hospitalDoctors)
    },
    []
  )

  const preparePatientData = useCallback((data: PatientFormData) => {
    const allergies = data.allergies
      ? data.allergies.split(',').map(a => a.trim()).filter(a => a).join(', ')
      : undefined

    return {
      ...data,
      allergies,
    }
  }, [])

  return {
    formData,
    setFormData,
    selectedCityId,
    selectedHospitalId,
    filteredHospitals,
    filteredDoctors,
    resetForm,
    populateForm,
    handleCityChange,
    handleHospitalChange,
    preparePatientData,
  }
}

