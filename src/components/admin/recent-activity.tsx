'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

const recentActivities = [
  {
    id: 1,
    type: 'visit',
    patient: 'John Doe',
    doctor: 'Dr. Smith',
    time: new Date(),
    status: 'completed',
  },
  {
    id: 2,
    type: 'test',
    patient: 'Jane Wilson',
    doctor: 'Dr. Johnson',
    time: new Date(Date.now() - 30 * 60 * 1000),
    status: 'in-progress',
  },
  {
    id: 3,
    type: 'treatment',
    patient: 'Mike Brown',
    doctor: 'Dr. Davis',
    time: new Date(Date.now() - 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    id: 4,
    type: 'operation',
    patient: 'Sarah Lee',
    doctor: 'Dr. Wilson',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800'
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'visit':
      return '🏥'
    case 'test':
      return '🧪'
    case 'treatment':
      return '💊'
    case 'operation':
      return '⚕️'
    default:
      return '📋'
  }
}

export function RecentActivity() {
  return (
    <Card className="hospital-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-2xl">
                {getTypeIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.patient}
                  </p>
                  <Badge
                    className={`text-xs ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} with {activity.doctor}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(activity.time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
