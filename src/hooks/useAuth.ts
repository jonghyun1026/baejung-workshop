import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  phone_number?: string
  school?: string
  major?: string
  generation?: string
  gender?: string
  role?: string
}

// 로컬스토리지에서 사용자 정보 가져오기
function getCurrentUser(): AuthUser | null {
  try {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem('directory_user')
    if (!userStr) return null
    
    return JSON.parse(userStr)
  } catch (error) {
    console.error('getCurrentUser 오류:', error)
    localStorage.removeItem('directory_user')
    return null
  }
}

// 사용자 로그인 (로컬스토리지에 저장)
function loginUser(user: AuthUser): void {
  try {
    localStorage.setItem('directory_user', JSON.stringify(user))
  } catch (error) {
    console.error('loginUser 오류:', error)
    throw error
  }
}

// 로그아웃
function logout(): void {
  try {
    localStorage.removeItem('directory_user')
  } catch (error) {
    console.error('logout 오류:', error)
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 사용자 확인
    const checkUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('사용자 확인 오류:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // localStorage 변경 감지 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'directory_user') {
        checkUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signOut = async () => {
    try {
      logout()
      setUser(null)
      
      // StorageEvent 수동 발생으로 다른 탭이나 컴포넌트들에게 로그아웃 알림
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'directory_user',
        newValue: null,
        storageArea: localStorage
      }))
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  }

  const signIn = (userData: AuthUser) => {
    try {
      loginUser(userData)
      setUser(userData)
      
      // StorageEvent 수동 발생
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'directory_user',
        newValue: JSON.stringify(userData),
        storageArea: localStorage
      }))
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    signOut,
    signIn,
    isAuthenticated: !!user
  }
}