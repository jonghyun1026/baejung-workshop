'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'

export default function AdminDebugPage() {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminCheckLoading, error: adminError } = useAdmin()
  const [userTableData, setUserTableData] = useState<any>(null)
  const [debugLoading, setDebugLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)

  const checkUserData = async () => {
    if (!user) return
    
    setDebugLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      setUserTableData({ data, error: error?.message })
    } catch (err) {
      setUserTableData({ data: null, error: String(err) })
    } finally {
      setDebugLoading(false)
    }
  }

  const syncUserData = async () => {
    if (!user) return
    
    setSyncLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email || '이름 없음',
          school: '미설정',
          major: '미설정',
          role: 'student',
          gender: '미설정',
          generation: '1',
          status: 'active',
          ws_group: '미정'
        })
      
      if (error && error.code !== '23505') { // 23505는 중복 키 오류
        throw error
      }
      
      alert('사용자 데이터가 동기화되었습니다!')
      await checkUserData()
    } catch (err) {
      alert(`오류: ${err}`)
    } finally {
      setSyncLoading(false)
    }
  }

  const makeAdmin = async () => {
    if (!user) return
    
    setAdminLoading(true)
    try {
      // 먼저 사용자 데이터 확인/생성
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingUser) {
        // 사용자 데이터가 없으면 생성
        await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email || '이름 없음',
            school: '미설정',
            major: '미설정',
            role: 'admin',
            gender: '미설정',
            generation: '1',
            status: 'active',
            ws_group: '관리자'
          })
      } else {
        // 기존 사용자를 관리자로 업데이트
        await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', user.id)
      }
      
      alert('관리자 권한이 부여되었습니다! 페이지를 새로고침하세요.')
      await checkUserData()
    } catch (err) {
      alert(`오류: ${err}`)
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      checkUserData()
    }
  }, [user, authLoading])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">관리자 시스템 디버깅</h2>
        <p className="text-gray-600">시스템 상태를 진단합니다</p>
      </div>

      {/* 인증 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>인증 상태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>인증 로딩: {authLoading ? '✅ 로딩 중' : '❌ 완료'}</div>
          <div>사용자 로그인: {user ? '✅ 로그인됨' : '❌ 로그인 안됨'}</div>
          {user && (
            <div className="text-sm text-gray-600">
              사용자 ID: {user.id}
            </div>
          )}
        </CardContent>
      </Card>

              {/* 관리자 권한 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            관리자 권한 상태
            {user && (
              <div className="space-x-2">
                <Button 
                  onClick={syncUserData} 
                  disabled={syncLoading}
                  size="sm"
                  variant="outline"
                >
                  {syncLoading ? '동기화 중...' : '사용자 동기화'}
                </Button>
                <Button 
                  onClick={makeAdmin} 
                  disabled={adminLoading}
                  size="sm"
                >
                  {adminLoading ? '처리 중...' : '관리자 권한 부여'}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>권한 확인 로딩: {adminCheckLoading ? '✅ 로딩 중' : '❌ 완료'}</div>
          <div>관리자 권한: {isAdmin ? '✅ 관리자' : '❌ 일반 사용자'}</div>
          {adminError && (
            <div className="text-red-600 text-sm">오류: {adminError}</div>
          )}
        </CardContent>
      </Card>

      {/* 사용자 테이블 데이터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            사용자 테이블 데이터
            <Button 
              onClick={checkUserData} 
              disabled={!user || debugLoading}
              size="sm"
            >
              {debugLoading ? '확인 중...' : '다시 확인'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-gray-500">로그인이 필요합니다</div>
          ) : debugLoading ? (
            <div className="text-gray-500">데이터 확인 중...</div>
          ) : userTableData ? (
            <div className="space-y-4">
              {userTableData.error ? (
                <div className="text-red-600">
                  오류: {userTableData.error}
                </div>
              ) : userTableData.data ? (
                <div className="space-y-2">
                  <div><strong>이름:</strong> {userTableData.data.name || 'N/A'}</div>
                  <div><strong>학교:</strong> {userTableData.data.school || 'N/A'}</div>
                  <div><strong>전공:</strong> {userTableData.data.major || 'N/A'}</div>
                  <div><strong>역할:</strong> {userTableData.data.role || 'N/A'}</div>
                  <div><strong>생성일:</strong> {userTableData.data.created_at || 'N/A'}</div>
                </div>
              ) : (
                <div className="text-yellow-600">
                  users 테이블에 데이터가 없습니다
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">데이터를 확인하지 않음</div>
          )}
        </CardContent>
      </Card>

      {/* 테이블 존재 여부 확인 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>Supabase 연결: ✅ 정상</div>
            <div>브라우저 콘솔에서 추가 오류 확인 필요</div>
            <div>F12 → Console 탭에서 에러 메시지 확인</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
