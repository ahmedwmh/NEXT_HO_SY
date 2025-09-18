'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createPatientSchema, type CreatePatientInput } from '@/lib/validations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { uploadPatientPhoto, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/lib/storage'

export function PatientForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<string>('')
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('')
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
  })

  // Fetch cities for the select dropdown
  const [cities, setCities] = useState<any[]>([])
  const [loadingCities, setLoadingCities] = useState(true)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      setLoadingCities(true)
      const response = await fetch('/api/cities')
      if (!response.ok) throw new Error('Failed to fetch cities')
      const data = await response.json()
      setCities(data.data || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const fetchHospitals = async (cityId: string) => {
    try {
      setLoadingHospitals(true)
      const response = await fetch(`/api/hospitals?cityId=${cityId}`)
      if (!response.ok) throw new Error('Failed to fetch hospitals')
      const data = await response.json()
      setHospitals(data || [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setHospitals([])
    } finally {
      setLoadingHospitals(false)
    }
  }

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId)
    setSelectedHospitalId('')
    setValue('hospitalId', '')
    setHospitals([])
    
    if (cityId) {
      fetchHospitals(cityId)
    }
  }

  const createPatientMutation = useMutation({
    mutationFn: async (data: CreatePatientInput) => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          profilePhoto: uploadedPhotoUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create patient')
      }

      return response.json()
    },
    onSuccess: () => {
      router.push('/admin/patients')
    },
  })

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    
    try {
      // Generate a temporary patient ID for file naming
      const tempPatientId = `temp-${Date.now()}`
      const result = await uploadPatientPhoto(file, tempPatientId)
      setUploadedPhotoUrl(result.url)
    } catch (error) {
      console.error('Upload failed:', error)
      // Handle upload error
    }
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setUploadedPhotoUrl(null)
  }

  const onSubmit = async (data: CreatePatientInput) => {
    try {
      await createPatientMutation.mutateAsync(data)
    } catch (error) {
      console.error('Failed to create patient:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="hospital-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                accept="image/*"
                maxSize={MAX_IMAGE_SIZE_MB * 1024 * 1024}
              />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className="hospital-input"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className="hospital-input"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className="hospital-input"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => setValue('gender', value)}>
                  <SelectTrigger className="hospital-input">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="hospital-input"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="hospital-input"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                className="hospital-input"
                placeholder="Enter address"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select onValueChange={(value) => setValue('bloodType', value)}>
                  <SelectTrigger className="hospital-input">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bloodType && (
                  <p className="text-sm text-red-600">{errors.bloodType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  className="hospital-input"
                  placeholder="Enter emergency contact"
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-600">{errors.emergencyContact.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                {...register('allergies')}
                className="hospital-input"
                placeholder="Enter known allergies"
              />
              {errors.allergies && (
                <p className="text-sm text-red-600">{errors.allergies.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <textarea
                id="medicalHistory"
                {...register('medicalHistory')}
                className="hospital-input min-h-[100px] resize-y"
                placeholder="Enter medical history"
              />
              {errors.medicalHistory && (
                <p className="text-sm text-red-600">{errors.medicalHistory.message}</p>
              )}
            </div>

            {/* City and Hospital Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cityId">City *</Label>
                <Select 
                  value={selectedCityId}
                  onValueChange={handleCityChange}
                  disabled={loadingCities}
                >
                  <SelectTrigger className="hospital-input">
                    <SelectValue placeholder={loadingCities ? "Loading..." : "Select city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cityId && (
                  <p className="text-sm text-red-600">{errors.cityId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospitalId">Hospital *</Label>
                <Select 
                  value={selectedHospitalId}
                  onValueChange={(value) => {
                    setValue('hospitalId', value)
                    setSelectedHospitalId(value)
                  }}
                  disabled={!selectedCityId || loadingHospitals}
                >
                  <SelectTrigger className="hospital-input">
                    <SelectValue placeholder={
                      loadingHospitals ? "Loading..." : 
                      !selectedCityId ? "Select city first" : 
                      "Select hospital"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital: any) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hospitalId && (
                  <p className="text-sm text-red-600">{errors.hospitalId.message}</p>
                )}
                {!selectedCityId && (
                  <p className="text-sm text-gray-500">Please select a city first</p>
                )}
              </div>
            </div>


            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="hospital-button"
                disabled={createPatientMutation.isPending}
              >
                {createPatientMutation.isPending ? 'Creating...' : 'Create Patient'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
