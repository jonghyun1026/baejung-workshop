'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Mail, Lock, User } from 'lucide-react'
import { signUpWithEmail, signInWithEmail, resetPassword, resendConfirmationEmail } from '@/lib/auth'

interface EmailAuthFormProps {
  onAuthSuccess?: (user: any) => void
  onAuthError?: (error: string) => void
}

export default function EmailAuthForm({ onAuthSuccess, onAuthError }: EmailAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')

  // 로그인 폼 상태
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // 회원가입 폼 상태
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  // 비밀번호 재설정 폼 상태
  const [resetEmail, setResetEmail] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const { user, session } = await signInWithEmail(loginData.email, loginData.password)
      
      if (user && session) {
        setMessage('로그인에 성공했습니다!')
        onAuthSuccess?.(user)
      }
    } catch (err: any) {
      const errorMessage = err.message || '로그인에 실패했습니다.'
      setError(errorMessage)
      onAuthError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // 비밀번호 확인
    if (signupData.password !== signupData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    // 비밀번호 강도 확인
    if (signupData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUpWithEmail(
        signupData.email,
        signupData.password,
        {
          name: signupData.name
        }
      )

      if (result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true)
        setConfirmationEmail(signupData.email)
        setMessage(result.message)
      } else if (result.user) {
        setMessage('회원가입이 완료되었습니다!')
        onAuthSuccess?.(result.user)
      }
    } catch (err: any) {
      const errorMessage = err.message || '회원가입에 실패했습니다.'
      setError(errorMessage)
      onAuthError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await resetPassword(resetEmail)
      setMessage(result.message)
    } catch (err: any) {
      const errorMessage = err.message || '비밀번호 재설정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await resendConfirmationEmail(confirmationEmail)
      setMessage(result.message)
    } catch (err: any) {
      const errorMessage = err.message || '이메일 재발송에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (needsEmailConfirmation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>이메일 확인 필요</CardTitle>
          <CardDescription>
            {confirmationEmail}로 확인 이메일을 발송했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              이메일이 도착하지 않았나요?
            </p>
            <Button
              onClick={handleResendConfirmation}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? '발송 중...' : '이메일 재발송'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>계정 인증</CardTitle>
        <CardDescription>
          이메일로 로그인하거나 새 계정을 만드세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* 메시지 표시 */}
          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 로그인 탭 */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
            
            {/* 비밀번호 재설정 */}
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm">비밀번호를 잊으셨나요?</Label>
              <form onSubmit={handlePasswordReset} className="flex space-x-2">
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="이메일 주소"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="outline" size="sm" disabled={isLoading}>
                  재설정
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    className="pl-10"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-name">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    className="pl-10"
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요 (6자 이상)"
                    className="pl-10"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    className="pl-10"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '회원가입 중...' : '회원가입'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
