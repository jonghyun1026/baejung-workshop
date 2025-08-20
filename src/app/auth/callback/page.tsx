'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { syncUserToDatabase } from '@/lib/auth'
import Link from 'next/link'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 코드나 토큰 확인
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || '이메일 인증 중 오류가 발생했습니다.')
          return
        }

        // Supabase 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('세션 확인 에러:', sessionError)
          setStatus('error')
          setMessage('인증 세션을 확인할 수 없습니다.')
          return
        }

        if (session?.user) {
          // 사용자 정보를 데이터베이스에 동기화
          try {
            await syncUserToDatabase(session.user)
            setUserEmail(session.user.email || '')
            setStatus('success')
            setMessage('이메일 인증이 완료되었습니다!')
            
            // 3초 후 홈으로 리다이렉트
            setTimeout(() => {
              router.push('/')
            }, 3000)
          } catch (syncError) {
            console.error('사용자 동기화 에러:', syncError)
            setStatus('success') // 인증은 성공했으므로 success로 처리
            setMessage('이메일 인증은 완료되었지만, 사용자 정보 동기화 중 문제가 발생했습니다.')
          }
        } else {
          // 세션이 없는 경우 - 인증이 아직 진행 중이거나 실패
          setStatus('error')
          setMessage('인증 정보를 찾을 수 없습니다. 다시 시도해주세요.')
        }
      } catch (error) {
        console.error('인증 콜백 처리 에러:', error)
        setStatus('error')
        setMessage('예상치 못한 오류가 발생했습니다.')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  const getTextColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-800'
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={getTextColor()}>
            {status === 'loading' && '이메일 인증 처리 중...'}
            {status === 'success' && '인증 완료!'}
            {status === 'error' && '인증 실패'}
          </CardTitle>
          {userEmail && status === 'success' && (
            <CardDescription className={getTextColor()}>
              {userEmail}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className={`text-sm ${getTextColor()}`}>
            {message}
          </p>

          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-green-700">
                3초 후 자동으로 홈페이지로 이동합니다.
              </p>
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                지금 홈으로 이동
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>문제가 지속되면 관리자에게 문의하세요.</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => router.push('/auth')}
                  variant="outline"
                  className="flex-1"
                >
                  다시 시도
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  홈으로 이동
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-xs text-blue-600">
              잠시만 기다려 주세요...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

