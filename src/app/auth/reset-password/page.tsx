'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updatePassword } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, Lock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // URL에 에러가 있는지 확인
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setError(errorDescription || '비밀번호 재설정 링크가 유효하지 않습니다.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    // 비밀번호 강도 확인
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const result = await updatePassword(password)
      setMessage(result.message)
      setIsSuccess(true)
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/auth')
      }, 3000)
    } catch (err: any) {
      const errorMessage = err.message || '비밀번호 변경에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-green-800">비밀번호 변경 완료!</CardTitle>
            <CardDescription className="text-green-700">
              새로운 비밀번호로 변경되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-green-800">{message}</p>
            <p className="text-sm text-green-700">
              3초 후 자동으로 로그인 페이지로 이동합니다.
            </p>
            <Button 
              onClick={() => router.push('/auth')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              지금 로그인 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">비밀번호 재설정</h1>
              <p className="text-sm text-gray-600">새로운 비밀번호를 설정하세요</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>새 비밀번호 설정</CardTitle>
              <CardDescription>
                계정의 새로운 비밀번호를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 메시지 표시 */}
              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">새 비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link 
                  href="/auth" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">비밀번호 설정 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 비밀번호는 6자 이상으로 설정해주세요</li>
              <li>• 영문, 숫자, 특수문자를 조합하면 더 안전합니다</li>
              <li>• 다른 사이트와 다른 비밀번호를 사용하세요</li>
              <li>• 변경 후 즉시 새 비밀번호로 로그인할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

