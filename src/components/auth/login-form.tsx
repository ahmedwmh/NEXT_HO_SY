'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Login failed')
        }

        return result
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      // Store user data in localStorage (in a real app, use proper auth state management)
      localStorage.setItem('user', JSON.stringify(data.data))
      localStorage.setItem('token', data.data.id) // Using user ID as token for simplicity
      
      // Show success message
      toast.success(`Welcome back, ${data.data.email}!`)
      
      // Redirect based on role
      if (data.data.role === 'ADMIN') {
        router.push('/admin')
      } else if (data.data.role === 'DOCTOR') {
        router.push('/doctor')
      } else if (data.data.role === 'STAFF') {
        router.push('/staff')
      }
    },
    onError: (error) => {
      console.error('Login mutation error:', error)
      const errorMessage = error.message || 'An error occurred during login'
      
      // Show error toast
      toast.error(errorMessage)
      
      // Set form error
      setError('root', {
        message: errorMessage,
      })
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      await loginMutation.mutateAsync(data)
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Submit error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-hospital-blue">
          Sign In
        </CardTitle>
        <CardDescription>
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className="hospital-input"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className="hospital-input"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600 font-medium">Login Failed</p>
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full hospital-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <div className="mt-2 space-y-1">
            <p><strong>Admin:</strong> admin@hospital.com / admin123</p>
            <p><strong>Doctor:</strong> doctor@hospital.com / doctor123</p>
            <p><strong>Staff:</strong> staff@hospital.com / staff123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
