'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
// import { Switch } from '@/components/ui/switch' // Switch component not available
import { Textarea } from '@/components/ui/textarea'
import { UniversalTable } from '@/components/ui/universal-table'
import { 
  Shield, 
  User, 
  Building, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Check,
  AlertTriangle
} from 'lucide-react'
import type { ResourceType, PermissionType } from '@prisma/client'

interface Permission {
  id: string
  name: string
  description: string
  resource: ResourceType
  action: PermissionType
  isActive: boolean
}

interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
  isActive: boolean
  permissions: Permission[]
}

interface User {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  hospital?: {
    id: string
    name: string
  }
  permissions: UserPermission[]
}

interface UserPermission {
  id: string
  permission: Permission
  granted: boolean
  hospitalId?: string
  expiresAt?: string
  reason?: string
}

interface Hospital {
  id: string
  name: string
}

export default function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles' | 'users'>('permissions')
  
  // Forms
  const [showPermissionForm, setShowPermissionForm] = useState(false)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [showUserPermissionForm, setShowUserPermissionForm] = useState(false)
  
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    description: '',
    resource: '' as ResourceType | '',
    action: '' as PermissionType | ''
  })
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  
  const [userPermissionForm, setUserPermissionForm] = useState({
    userId: '',
    permissionId: '',
    hospitalId: '',
    granted: true,
    expiresAt: '',
    reason: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [permissionsRes, rolesRes, usersRes, hospitalsRes] = await Promise.all([
        fetch('/api/permissions'),
        fetch('/api/roles'),
        fetch('/api/users'),
        fetch('/api/hospitals')
      ])

      const [permissionsData, rolesData, usersData, hospitalsData] = await Promise.all([
        permissionsRes.ok ? permissionsRes.json() : { data: [] },
        rolesRes.ok ? rolesRes.json() : { data: [] },
        usersRes.ok ? usersRes.json() : { data: [] },
        hospitalsRes.ok ? hospitalsRes.json() : { data: [] }
      ])

      setPermissions(permissionsData.data || [])
      setRoles(rolesData.data || [])
      setUsers(usersData.data || [])
      setHospitals(hospitalsData.data || [])
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePermission = async () => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionForm)
      })

      if (response.ok) {
        setShowPermissionForm(false)
        setPermissionForm({ name: '', description: '', resource: '', action: '' })
        fetchData()
      }
    } catch (error) {
      console.error('خطأ في إنشاء الصلاحية:', error)
    }
  }

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      })

      if (response.ok) {
        setShowRoleForm(false)
        setRoleForm({ name: '', description: '', permissions: [] })
        fetchData()
      }
    } catch (error) {
      console.error('خطأ في إنشاء الدور:', error)
    }
  }

  const handleGrantUserPermission = async () => {
    try {
      const response = await fetch('/api/user-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userPermissionForm,
          expiresAt: userPermissionForm.expiresAt ? new Date(userPermissionForm.expiresAt) : null
        })
      })

      if (response.ok) {
        setShowUserPermissionForm(false)
        setUserPermissionForm({ userId: '', permissionId: '', hospitalId: '', granted: true, expiresAt: '', reason: '' })
        fetchData()
      }
    } catch (error) {
      console.error('خطأ في منح الصلاحية:', error)
    }
  }

  const permissionColumns = [
    {
      key: 'name',
      label: 'اسم الصلاحية',
      render: (value: string, row: Permission) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'لا يوجد وصف'}</span>
      )
    },
    {
      key: 'resource',
      label: 'المورد',
      render: (value: ResourceType) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'action',
      label: 'الإجراء',
      render: (value: PermissionType) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    }
  ]

  const roleColumns = [
    {
      key: 'name',
      label: 'اسم الدور',
      render: (value: string, row: Role) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <User className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{value}</span>
          {row.isSystem && <Badge variant="outline">نظام</Badge>}
        </div>
      )
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'لا يوجد وصف'}</span>
      )
    },
    {
      key: 'permissions',
      label: 'الصلاحيات',
      render: (value: Permission[], row: Role) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map(permission => (
            <Badge key={permission.id} variant="outline" className="text-xs">
              {permission.name}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 3} أخرى
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    }
  ]

  const userColumns = [
    {
      key: 'name',
      label: 'المستخدم',
      render: (value: any, row: User) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <User className="h-4 w-4 text-blue-500" />
          <div>
            <span className="font-medium">{row.firstName} {row.lastName}</span>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'الدور',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'hospital',
      label: 'المستشفى',
      render: (value: any, row: User) => (
        row.hospital ? (
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Building className="h-3 w-3" />
            <span className="text-sm">{row.hospital.name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">غير محدد</span>
        )
      )
    },
    {
      key: 'permissions',
      label: 'الصلاحيات المخصصة',
      render: (value: UserPermission[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map(perm => (
            <Badge 
              key={perm.id} 
              variant={perm.granted ? "default" : "destructive"}
              className="text-xs"
            >
              {perm.permission.name}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2} أخرى
            </Badge>
          )}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الصلاحيات</h1>
          <p className="text-gray-600 mt-1">إدارة صلاحيات المستخدمين والأدوار</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          {[
            { id: 'permissions', label: 'الصلاحيات', icon: Shield },
            { id: 'roles', label: 'الأدوار', icon: User },
            { id: 'users', label: 'المستخدمين', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 rtl:space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">الصلاحيات</h2>
            <Button onClick={() => setShowPermissionForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة صلاحية
            </Button>
          </div>

          <UniversalTable
            data={permissions}
            columns={permissionColumns}
            title=""
            searchFields={['name', 'description']}
            emptyMessage="لا توجد صلاحيات"
            showPagination={true}
            showSearch={true}
          />
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">الأدوار</h2>
            <Button onClick={() => setShowRoleForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة دور
            </Button>
          </div>

          <UniversalTable
            data={roles}
            columns={roleColumns}
            title=""
            searchFields={['name', 'description']}
            emptyMessage="لا توجد أدوار"
            showPagination={true}
            showSearch={true}
          />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">المستخدمين</h2>
            <Button onClick={() => setShowUserPermissionForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              منح صلاحية
            </Button>
          </div>

          <UniversalTable
            data={users}
            columns={userColumns}
            title=""
            searchFields={['firstName', 'lastName', 'email']}
            emptyMessage="لا يوجد مستخدمين"
            showPagination={true}
            showSearch={true}
          />
        </div>
      )}

      {/* Permission Form Modal */}
      {showPermissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>إضافة صلاحية جديدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم الصلاحية</Label>
                <Input
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  placeholder="مثال: قراءة المرضى"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                  placeholder="وصف الصلاحية"
                />
              </div>
              <div>
                <Label>المورد</Label>
                <Select
                  value={permissionForm.resource}
                  onValueChange={(value) => setPermissionForm({ ...permissionForm, resource: value as ResourceType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PATIENTS">المرضى</SelectItem>
                    <SelectItem value="VISITS">الزيارات</SelectItem>
                    <SelectItem value="TESTS">الفحوصات</SelectItem>
                    <SelectItem value="TREATMENTS">العلاجات</SelectItem>
                    <SelectItem value="OPERATIONS">العمليات</SelectItem>
                    <SelectItem value="MEDICATIONS">الأدوية</SelectItem>
                    <SelectItem value="PRESCRIPTIONS">الوصفات</SelectItem>
                    <SelectItem value="REPORTS">التقارير</SelectItem>
                    <SelectItem value="SETTINGS">الإعدادات</SelectItem>
                    <SelectItem value="USERS">المستخدمين</SelectItem>
                    <SelectItem value="HOSPITALS">المستشفيات</SelectItem>
                    <SelectItem value="CITIES">المدن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الإجراء</Label>
                <Select
                  value={permissionForm.action}
                  onValueChange={(value) => setPermissionForm({ ...permissionForm, action: value as PermissionType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الإجراء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READ">قراءة</SelectItem>
                    <SelectItem value="WRITE">كتابة</SelectItem>
                    <SelectItem value="DELETE">حذف</SelectItem>
                    <SelectItem value="MANAGE">إدارة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button onClick={handleCreatePermission} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setShowPermissionForm(false)} className="flex-1">
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Form Modal */}
      {showRoleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>إضافة دور جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم الدور</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="مثال: طبيب أخصائي"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="وصف الدور"
                />
              </div>
              <div>
                <Label>الصلاحيات</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={roleForm.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRoleForm({ ...roleForm, permissions: [...roleForm.permissions, permission.id] })
                          } else {
                            setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter(id => id !== permission.id) })
                          }
                        }}
                      />
                      <label htmlFor={permission.id} className="text-sm">
                        {permission.name} ({permission.resource} - {permission.action})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button onClick={handleCreateRole} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setShowRoleForm(false)} className="flex-1">
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Permission Form Modal */}
      {showUserPermissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>منح صلاحية لمستخدم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>المستخدم</Label>
                <Select
                  value={userPermissionForm.userId}
                  onValueChange={(value) => setUserPermissionForm({ ...userPermissionForm, userId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الصلاحية</Label>
                <Select
                  value={userPermissionForm.permissionId}
                  onValueChange={(value) => setUserPermissionForm({ ...userPermissionForm, permissionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    {permissions.map(permission => (
                      <SelectItem key={permission.id} value={permission.id}>
                        {permission.name} ({permission.resource} - {permission.action})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المستشفى (اختياري)</Label>
                <Select
                  value={userPermissionForm.hospitalId}
                  onValueChange={(value) => setUserPermissionForm({ ...userPermissionForm, hospitalId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستشفى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المستشفيات</SelectItem>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={userPermissionForm.granted}
                  onChange={(e) => setUserPermissionForm({ ...userPermissionForm, granted: e.target.checked })}
                  className="rounded"
                />
                <Label>منح الصلاحية</Label>
              </div>
              <div>
                <Label>تاريخ انتهاء الصلاحية (اختياري)</Label>
                <Input
                  type="datetime-local"
                  value={userPermissionForm.expiresAt}
                  onChange={(e) => setUserPermissionForm({ ...userPermissionForm, expiresAt: e.target.value })}
                />
              </div>
              <div>
                <Label>السبب</Label>
                <Textarea
                  value={userPermissionForm.reason}
                  onChange={(e) => setUserPermissionForm({ ...userPermissionForm, reason: e.target.value })}
                  placeholder="سبب منح/منع الصلاحية"
                />
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button onClick={handleGrantUserPermission} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setShowUserPermissionForm(false)} className="flex-1">
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
