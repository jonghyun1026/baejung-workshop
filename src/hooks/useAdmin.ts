import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUserById, getUserByName } from '@/features/users/api'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdminStatus() {
      // 인증 로딩 중이면 대기
      if (authLoading) {
        return
      }

      // 로그인되지 않은 경우
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let userData = null
        
        // ID로 먼저 조회 시도
        if (user.id) {
          try {
            userData = await getUserById(user.id)
          } catch {
            // ID로 조회 실패시 이름으로 조회
            if (user.name) {
              userData = await getUserByName(user.name)
            }
          }
        }
        
        // 사용자 데이터가 없으면 관리자가 아님
        if (!userData) {
          setIsAdmin(false)
        } else {
          setIsAdmin(userData.role === 'admin')
        }
      } catch (error: any) {
        console.error('관리자 권한 확인 오류:', error)
        setError(error.message || '권한 확인 중 오류가 발생했습니다')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, authLoading])

  return { 
    isAdmin, 
    loading: loading || authLoading, 
    error,
    refresh: () => {
      setLoading(true)
      setError(null)
    }
  }
}
