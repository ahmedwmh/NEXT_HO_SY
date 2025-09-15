import { useState, useCallback } from 'react'
import { type Patient, type Hospital, type Doctor } from '@/lib/services/data-service'

interface PatientFormData {
  firstName: string
  lastName: string
  middleName: string
  dateOfBirth: string
  gender: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies: string
  medicalHistory: string
  nationality: string
  idNumber: string
  passportNumber: string
  cityId: string
  hospitalId: string
  doctorId: string
  insuranceNumber: string
  insuranceCompany: string
  maritalStatus: string
  occupation: string
  notes: string
}

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  emergencyContact: '',
  bloodType: '',
  allergies: '',
  medicalHistory: '',
  nationality: '',
  idNumber: '',
  passportNumber: '',
  cityId: '',
  hospitalId: '',
  doctorId: '',
  insuranceNumber: '',
  insuranceCompany: '',
  maritalStatus: '',
  occupation: '',
  notes: '',
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
      middleName: patient.middleName || '',
      dateOfBirth: patient.dateOfBirth.split('T')[0],
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      bloodType: patient.bloodType,
      allergies: patient.allergies || '',
      medicalHistory: patient.medicalHistory || '',
      nationality: patient.nationality || '',
      idNumber: patient.idNumber || '',
      passportNumber: patient.passportNumber || '',
      cityId: patient.hospital?.city?.id || '',
      hospitalId: patient.hospitalId,
      doctorId: '', // This would need to be determined based on your data structure
      insuranceNumber: patient.insuranceNumber || '',
      insuranceCompany: patient.insuranceCompany || '',
      maritalStatus: patient.maritalStatus || '',
      occupation: patient.occupation || '',
      notes: patient.notes || '',
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

