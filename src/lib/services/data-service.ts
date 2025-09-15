interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface City {
  id: string
  name: string
}

interface Hospital {
  id: string
  name: string
  cityId: string
  city: {
    id: string
    name: string
  }
}

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialization: string
  hospitalId: string
}

interface Patient {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: string
  phone: string
  email?: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies?: string
  medicalHistory?: string
  nationality?: string
  idNumber?: string
  passportNumber?: string
  city?: string
  insuranceNumber?: string
  insuranceCompany?: string
  maritalStatus?: string
  occupation?: string
  notes?: string
  isActive: boolean
  hospitalId: string
  hospital: Hospital
  createdAt: string
}

class DataService {
  private baseUrl = '/api'

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    }

    console.log('🚀 DataService Request:', {
      url,
      method: requestOptions.method || 'GET',
      headers: requestOptions.headers,
      body: requestOptions.body
    })

    try {
      const response = await fetch(url, requestOptions)
      
      console.log('📡 DataService Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        let errorData = {}
        try {
          const errorText = await response.text()
          console.log('❌ Error Response Body:', errorText)
          errorData = JSON.parse(errorText)
        } catch (parseError) {
          console.log('❌ Failed to parse error response:', parseError)
        }
        
        const errorMessage = (errorData as any).error || `HTTP error! status: ${response.status}`
        console.error('❌ DataService Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorData
        })
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ DataService Success:', {
        url,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        data: data
      })

      return data
    } catch (error) {
      console.error('💥 DataService Request Failed:', {
        url,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  // Debug
  async debug(): Promise<any> {
    console.log('🐛 DataService: Testing debug endpoint...')
    return this.request<any>('/debug')
  }

  // Cities
  async getCities(): Promise<City[]> {
    console.log('🏙️ DataService: Getting cities...')
    const response = await this.request<ApiResponse<City[]>>('/cities')
    return response.data
  }

  // Hospitals
  async getHospitals(): Promise<Hospital[]> {
    const response = await this.request<ApiResponse<Hospital[]>>('/hospitals')
    return response.data
  }

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    const response = await this.request<ApiResponse<Doctor[]>>('/doctors')
    return response.data
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    const response = await this.request<ApiResponse<Patient[]>>('/patients')
    console.log('🔍 DataService getPatients response:', {
      hasResponse: !!response,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
      response: response
    })
    return response.data
  }

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    })
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    })
  }

  async deletePatient(id: string): Promise<void> {
    await this.request<void>(`/patients/${id}`, {
      method: 'DELETE',
    })
  }
}

export const dataService = new DataService()
export type { City, Hospital, Doctor, Patient }
