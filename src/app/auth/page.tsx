'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DirectoryAuthForm from '@/components/auth/DirectoryAuthForm'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">인증 상태 확인 중...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">이미 로그인되어 있습니다. 홈으로 이동중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">로그인 / 참가자 등록</h1>
              <p className="text-sm text-gray-600">이름과 전화번호로 인증하세요</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <DirectoryAuthForm />
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📱 전화번호 인증 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 처음 이용시: "참가자 등록" → 이름과 전화번호 인증 → 4자리 비밀번호 설정</li>
              <li>• 재방문시: "로그인" → 이름 입력 → 4자리 비밀번호 입력</li>
              <li>• 등록된 참가자 명단에 있는 정보만 인증 가능합니다</li>
              <li>• 전화번호는 하이픈(-) 유무에 관계없이 인식됩니다</li>
              <li>• 비밀번호는 숫자 4자리로 설정해주세요</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}