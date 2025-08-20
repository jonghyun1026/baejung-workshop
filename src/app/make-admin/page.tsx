'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MakeAdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  const makeAdmin = async () => {
    if (!user) {
      setResult('❌ 로그인이 필요합니다')
      return
    }

    setProcessing(true)
    setResult('⏳ 관리자 권한 부여 중...')

    try {
      // 기존 사용자 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

      if (existingUser) {
        // 기존 사용자 업데이트
        const { error } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', user.id)

        if (error) throw error
        setResult('✅ 관리자 권한이 부여되었습니다! (기존 사용자)')
      } else {
        // 새 사용자 생성
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email || '관리자',
            school: '시스템',
            major: '관리자',
            role: 'admin'
          })

        if (error) throw error
        setResult('✅ 관리자 권한이 부여되었습니다! (새 사용자)')
      }

      // 성공 시 3초 후 관리자 페이지로 이동
      setTimeout(() => router.push('/admin'), 3000)

    } catch (error: any) {
      setResult(`❌ 자동 권한 부여 실패: ${error.message}

수동 설정 방법:
1. Supabase Dashboard → SQL Editor 접속
2. 다음 SQL 실행:

INSERT INTO users (id, name, school, major, role) 
VALUES ('${user.id}', '관리자', '시스템', '관리자', 'admin') 
ON CONFLICT (id) DO UPDATE SET role = 'admin';`)
    } finally {
      setProcessing(false)
    }
  }

  const copyUserID = () => {
    if (!user) return
    navigator.clipboard.writeText(user.id).then(() => {
      alert('사용자 ID가 클립보드에 복사되었습니다!')
    })
  }

  const copySQL = () => {
    if (!user) return
    const sql = `INSERT INTO users (id, name, school, major, role) VALUES ('${user.id}', '관리자', '시스템', '관리자', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';`
    navigator.clipboard.writeText(sql).then(() => {
      alert('SQL이 클립보드에 복사되었습니다!')
    })
  }

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard', '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">🔑 관리자 권한 설정</CardTitle>
          <p className="text-center text-sm text-gray-600">
            관리자 권한을 부여하여 시스템을 관리할 수 있습니다
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {authLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">인증 확인 중...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg">❌ 로그인이 필요합니다</div>
              <Button 
                onClick={() => router.push('/auth')}
                className="mt-4"
              >
                로그인하기
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <div className="text-sm">
                  <strong>이메일:</strong> {user.email}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm"><strong>사용자 ID:</strong></span>
                  <Button 
                    onClick={copyUserID}
                    variant="outline"
                    size="sm"
                  >
                    ID 복사
                  </Button>
                </div>
                <div className="text-xs text-gray-500 break-all font-mono">
                  {user.id}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={makeAdmin}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리 중...
                    </>
                  ) : (
                    '🔑 관리자 권한 부여'
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={copySQL}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    SQL 복사
                  </Button>
                  <Button 
                    onClick={openSupabase}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Supabase 열기
                  </Button>
                </div>
              </div>

              {result && (
                <div className={`p-4 rounded-lg text-sm whitespace-pre-line ${
                  result.startsWith('✅') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result}
                  {result.startsWith('✅') && (
                    <div className="text-center mt-3 font-medium">
                      <div className="animate-pulse">3초 후 관리자 페이지로 이동합니다...</div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  size="sm"
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
