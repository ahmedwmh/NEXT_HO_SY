'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Plus,
  Users,
  UserCheck,
  Building2,
  FileText,
  Calendar,
  TestTube,
  Stethoscope,
} from 'lucide-react'

const quickActions = [
  {
    title: 'Add New Patient',
    description: 'Register a new patient in the system',
    href: '/admin/patients/new',
    icon: Users,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    title: 'Add Doctor',
    description: 'Register a new doctor',
    href: '/admin/doctors/new',
    icon: UserCheck,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    title: 'Add Hospital',
    description: 'Register a new hospital',
    href: '/admin/hospitals/new',
    icon: Building2,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    title: 'Schedule Visit',
    description: 'Schedule a patient visit',
    href: '/admin/visits/new',
    icon: Calendar,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    title: 'Schedule Test',
    description: 'Schedule a medical test',
    href: '/admin/tests/new',
    icon: TestTube,
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    title: 'Schedule Treatment',
    description: 'Schedule a treatment',
    href: '/admin/treatments/new',
    icon: Stethoscope,
    color: 'bg-teal-500 hover:bg-teal-600',
  },
  {
    title: 'Generate Report',
    description: 'Generate system reports',
    href: '/admin/reports',
    icon: FileText,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
]

export function QuickActions() {
  return (
    <Card className="hospital-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
