'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, getInitials } from '@/lib/utils'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'

export function PatientTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', currentPage, searchTerm],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/patients?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }

      return response.json()
    },
  })

  if (isLoading) {
    return (
      <Card className="hospital-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="loading-skeleton h-16 w-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="hospital-card">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading patients: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const patients = data?.data || []
  const pagination = data?.pagination

  return (
    <Card className="hospital-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Patient Records
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 hospital-input"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="hospital-table w-full">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Date of Birth</th>
                <th>Hospital</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient: any) => (
                <tr key={patient.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-hospital-blue text-white flex items-center justify-center font-medium">
                        {patient.profilePhoto ? (
                          <img
                            src={patient.profilePhoto}
                            alt={`${patient.firstName} ${patient.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(patient.firstName, patient.lastName)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {patient.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm text-gray-900">{patient.email || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{patient.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-900">
                      {formatDate(patient.dateOfBirth)}
                    </p>
                  </td>
                  <td>
                    <p className="text-sm text-gray-900">{patient.hospital?.name}</p>
                  </td>
                  <td>
                    <Badge className="status-scheduled">Active</Badge>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Edit Patient"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
