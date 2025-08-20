'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AuthStatusProps {
  className?: string
}

export default function AuthStatus({ className }: AuthStatusProps) {
  const { user, isAuthenticated, loading, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600">인증 확인 중...</span>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user.name || '사용자'}
            </p>
            {(user.school || user.major) && (
              <p className="text-xs text-gray-600">
                {[user.school, user.major].filter(Boolean).join(' ')}
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline" 
          size="sm"
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4 mr-1" />
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Link href="/auth">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <LogIn className="h-4 w-4 mr-2" />
          로그인
        </Button>
      </Link>
    </div>
  )
}

