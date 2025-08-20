'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Settings, FileText, Users, Calendar, Home, LogOut, Building } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading, error } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      console.log('관리자 권한 없음, 홈으로 리다이렉트')
      router.replace('/')
    }
  }, [isAdmin, loading, router])

  const handleSignOut = async () => {
    try {
      // Directory 인증 로그아웃
      localStorage.removeItem('directory_user')
      // StorageEvent 수동 발생으로 다른 컴포넌트들에게 로그아웃 알림
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'directory_user',
        newValue: null,
        storageArea: localStorage
      }))
      console.log('✅ 관리자 로그아웃 완료')
      router.push('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-lg">권한 확인 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">오류 발생</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                새로고침
              </Button>
              <Link href="/">
                <Button>홈으로 돌아가기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">접근 권한 없음</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">관리자 권한이 필요합니다.</p>
            <p className="text-sm text-gray-500">
              관리자 권한을 받으려면 시스템 관리자에게 문의하세요.
            </p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">관리자 페이지</h1>
                <p className="text-sm text-gray-600">OK배·정장학재단 워크숍 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-1" />
                  홈으로
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">관리 메뉴</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>대시보드</span>
                  </Link>
                  <Separator />
                  <Link href="/admin/notices" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <FileText className="h-5 w-5" />
                    <span>공지사항 관리</span>
                  </Link>
                  <Link href="/admin/users" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Users className="h-5 w-5" />
                    <span>사용자 관리</span>
                  </Link>
                  <Link href="/admin/events" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Calendar className="h-5 w-5" />
                    <span>일정 관리</span>
                  </Link>
                  <Link href="/admin/rooms" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Building className="h-5 w-5" />
                    <span>숙소 관리</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
