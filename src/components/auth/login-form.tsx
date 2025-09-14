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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Store user data in localStorage (in a real app, use proper auth state management)
      localStorage.setItem('user', JSON.stringify(data.data))
      localStorage.setItem('token', data.data.id) // Using user ID as token for simplicity
      
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
      setError('root', {
        message: error.message,
      })
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      await loginMutation.mutateAsync(data)
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
              <p className="text-sm text-red-600">{errors.root.message}</p>
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
