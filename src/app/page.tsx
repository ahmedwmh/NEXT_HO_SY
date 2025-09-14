import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export default function HomePage() {
  // In a real app, you would check authentication here
  // For now, we'll always show the login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-hospital-blue to-hospital-lightBlue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hospital Management System
          </h1>
          <p className="text-hospital-lightBlue text-lg">
            Professional Healthcare Management
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          <LoginForm />
        </div>
        
        <div className="text-center mt-6 text-white text-sm">
          <p>Secure • Reliable • Professional</p>
        </div>
      </div>
    </div>
  )
}
