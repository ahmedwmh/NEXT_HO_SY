'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  UserCheck,
  UserPlus,
  Building2,
  Calendar,
  TestTube,
  Stethoscope,
  Activity,
} from 'lucide-react'

const statCards = [
  {
    title: 'Total Patients',
    value: 'totalPatients',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Doctors',
    value: 'totalDoctors',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Staff Members',
    value: 'totalStaff',
    icon: UserPlus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Hospitals',
    value: 'totalHospitals',
    icon: Building2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Total Visits',
    value: 'totalVisits',
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    title: 'Medical Tests',
    value: 'totalTests',
    icon: TestTube,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'Treatments',
    value: 'totalTreatments',
    icon: Stethoscope,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    title: 'Operations',
    value: 'totalOperations',
    icon: Activity,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const result = await response.json()
      return result.data
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="hospital-card">
            <CardContent className="p-6">
              <div className="loading-skeleton h-4 w-20 mb-2"></div>
              <div className="loading-skeleton h-8 w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const value = stats?.[stat.value] || 0
        
        return (
          <Card key={stat.title} className="hospital-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
