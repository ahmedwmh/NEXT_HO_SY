import SecurityTest from '@/components/test/security-test'

export default function TestSecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">اختبار أمان النظام</h1>
          <p className="text-gray-600">تأكد من تطبيق الصلاحيات بشكل صحيح</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <SecurityTest userRole="ADMIN" />
          <SecurityTest userRole="DOCTOR" />
          <SecurityTest userRole="STAFF" />
        </div>
      </div>
    </div>
  )
}
