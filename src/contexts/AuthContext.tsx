'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { clientCache } from '@/libs/clientCache'

export interface UserSession {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  status: string
  emailVerifiedAt?: string | null
  createdAt?: string
}

export interface UserProfile {
  id?: string
  userId?: string
  institution?: string | null
  major?: string | null
  graduationYear?: number | null
  bio?: string | null
  headline?: string | null
  portfolioSlug?: string | null
  portfolioPublished?: boolean
}

export interface AuthContextType {
  user: UserSession | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isProfileComplete: boolean
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<{
    success: boolean
    redirectTo?: string
    message?: string
    error?: string
    isUnverified?: boolean
  }>
  register: (data: { name: string; email: string; password: string }) => Promise<{
    success: boolean
    message?: string
    verificationUrl?: string
    token?: string
    error?: string
  }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Cache-Control': 'no-cache' }
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setUser(json.data.user)
          setProfile(json.data.profile)
          setIsProfileComplete(Boolean(json.data.isProfileComplete))
          return
        }
      }
      clientCache.clear()
      setUser(null)
      setProfile(null)
      setIsProfileComplete(false)
    } catch {
      clientCache.clear()
      setUser(null)
      setProfile(null)
      setIsProfileComplete(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Email atau password salah',
          isUnverified: Boolean(data.errors?.isUnverified)
        }
      }

      setUser(data.data.user)
      setIsProfileComplete(Boolean(data.data.isProfileComplete))
      return {
        success: true,
        redirectTo: data.data.redirectTo || '/home',
        message: data.message
      }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kegagalan jaringan saat login'
      }
    }
  }

  const register = async (form: { name: string; email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Pendaftaran gagal'
        }
      }

      return {
        success: true,
        message: data.message,
        verificationUrl: data.data?.verificationUrl,
        token: data.data?.verificationToken
      }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kegagalan jaringan saat pendaftaran'
      }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      clientCache.clear()
      setUser(null)
      setProfile(null)
      setIsProfileComplete(false)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: Boolean(user),
        isProfileComplete,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
