'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  TrendingUp,
  Users,
  Building,
  MapPin,
  User,
  Calendar,
  FileText,
  TestTube,
  Pill,
  Activity
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'patient' | 'doctor' | 'hospital' | 'visit' | 'test' | 'prescription' | 'city'
  title: string
  subtitle: string
  description?: string
  url: string
  icon: React.ComponentType<any>
  metadata?: Record<string, any>
}

interface UniversalSearchProps {
  onResultClick?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export function UniversalSearch({ 
  onResultClick, 
  placeholder = "البحث في جميع البيانات...",
  className = ""
}: UniversalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (term: string) => {
    if (term.trim() && !recentSearches.includes(term)) {
      const updated = [term, ...recentSearches].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }

  // Search function
  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // Simulate API calls to different endpoints
      const searchPromises = [
        searchPatients(term),
        searchDoctors(term),
        searchHospitals(term),
        searchCities(term),
        searchVisits(term),
        searchTests(term),
        searchPrescriptions(term)
      ]

      const results = await Promise.all(searchPromises)
      const allResults = results.flat()
      
      setSearchResults(allResults)
    } catch (error) {
      console.error('خطأ في البحث:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // Search functions for different data types
  const searchPatients = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(term)}`)
      const patients = await response.json()
      return patients.map((patient: any) => ({
        id: patient.id,
        type: 'patient' as const,
        title: `${patient.firstName} ${patient.lastName}`,
        subtitle: `رقم المريض: ${patient.patientNumber}`,
        description: patient.hospital?.name,
        url: `/admin/patients/${patient.id}`,
        icon: User,
        metadata: { patientNumber: patient.patientNumber, hospital: patient.hospital?.name }
      }))
    } catch {
      return []
    }
  }

  const searchDoctors = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/doctors?search=${encodeURIComponent(term)}`)
      const doctors = await response.json()
      return doctors.map((doctor: any) => ({
        id: doctor.id,
        type: 'doctor' as const,
        title: `د. ${doctor.firstName} ${doctor.lastName}`,
        subtitle: doctor.specialization,
        description: doctor.hospital?.name,
        url: `/admin/doctors/${doctor.id}`,
        icon: User,
        metadata: { specialization: doctor.specialization, hospital: doctor.hospital?.name }
      }))
    } catch {
      return []
    }
  }

  const searchHospitals = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/hospitals?search=${encodeURIComponent(term)}`)
      const hospitals = await response.json()
      return hospitals.map((hospital: any) => ({
        id: hospital.id,
        type: 'hospital' as const,
        title: hospital.name,
        subtitle: hospital.city?.name,
        description: hospital.address,
        url: `/admin/hospitals/${hospital.id}`,
        icon: Building,
        metadata: { city: hospital.city?.name, address: hospital.address }
      }))
    } catch {
      return []
    }
  }

  const searchCities = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/cities?search=${encodeURIComponent(term)}`)
      const cities = await response.json()
      return cities.map((city: any) => ({
        id: city.id,
        type: 'city' as const,
        title: city.name,
        subtitle: `${city.hospitals?.length || 0} مستشفى`,
        description: 'مدينة',
        url: `/admin/cities/${city.id}`,
        icon: MapPin,
        metadata: { hospitalCount: city.hospitals?.length || 0 }
      }))
    } catch {
      return []
    }
  }

  const searchVisits = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/visits?search=${encodeURIComponent(term)}`)
      const visits = await response.json()
      return visits.map((visit: any) => ({
        id: visit.id,
        type: 'visit' as const,
        title: `زيارة - ${visit.patient?.firstName} ${visit.patient?.lastName}`,
        subtitle: new Date(visit.scheduledAt).toLocaleDateString('ar-IQ'),
        description: visit.doctor?.firstName ? `د. ${visit.doctor.firstName} ${visit.doctor.lastName}` : '',
        url: `/admin/visits/${visit.id}`,
        icon: Calendar,
        metadata: { patient: visit.patient, doctor: visit.doctor, date: visit.scheduledAt }
      }))
    } catch {
      return []
    }
  }

  const searchTests = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/tests?search=${encodeURIComponent(term)}`)
      const tests = await response.json()
      return tests.map((test: any) => ({
        id: test.id,
        type: 'test' as const,
        title: test.name,
        subtitle: test.patient?.firstName ? `${test.patient.firstName} ${test.patient.lastName}` : '',
        description: new Date(test.scheduledAt).toLocaleDateString('ar-IQ'),
        url: `/admin/tests/${test.id}`,
        icon: TestTube,
        metadata: { patient: test.patient, date: test.scheduledAt, status: test.status }
      }))
    } catch {
      return []
    }
  }

  const searchPrescriptions = async (term: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`/api/prescriptions?search=${encodeURIComponent(term)}`)
      const prescriptions = await response.json()
      return prescriptions.map((prescription: any) => ({
        id: prescription.id,
        type: 'prescription' as const,
        title: prescription.medication,
        subtitle: prescription.patient?.firstName ? `${prescription.patient.firstName} ${prescription.patient.lastName}` : '',
        description: `الجرعة: ${prescription.dosage}`,
        url: `/admin/prescriptions/${prescription.id}`,
        icon: Pill,
        metadata: { patient: prescription.patient, medication: prescription.medication, dosage: prescription.dosage }
      }))
    } catch {
      return []
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm)
        saveRecentSearch(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result)
    } else {
      window.location.href = result.url
    }
    setIsOpen(false)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setIsOpen(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4 text-blue-500" />
      case 'doctor':
        return <User className="h-4 w-4 text-green-500" />
      case 'hospital':
        return <Building className="h-4 w-4 text-purple-500" />
      case 'city':
        return <MapPin className="h-4 w-4 text-orange-500" />
      case 'visit':
        return <Calendar className="h-4 w-4 text-indigo-500" />
      case 'test':
        return <TestTube className="h-4 w-4 text-red-500" />
      case 'prescription':
        return <Pill className="h-4 w-4 text-pink-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'patient':
        return 'مريض'
      case 'doctor':
        return 'طبيب'
      case 'hospital':
        return 'مستشفى'
      case 'city':
        return 'مدينة'
      case 'visit':
        return 'زيارة'
      case 'test':
        return 'فحص'
      case 'prescription':
        return 'وصفة طبية'
      default:
        return 'سجل'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pr-10 w-full"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              جاري البحث...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result) => {
                const Icon = result.icon
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-start space-x-3 rtl:space-x-reverse"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {result.subtitle}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-400 truncate">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500">
              لا توجد نتائج للبحث عن "{searchTerm}"
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                البحث الأخير
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(search)
                    performSearch(search)
                  }}
                  className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
