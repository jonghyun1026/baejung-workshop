'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Calendar, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalNotices: 0,
    totalUsers: 0,
    totalEvents: 0,
    totalPhotos: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log('통계 데이터 로딩 시작...')
        
        // 각 테이블별로 개별 처리하여 오류가 있어도 다른 통계는 표시
        const results = await Promise.allSettled([
          supabase.from('notices').select('id', { count: 'exact', head: true }),
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('photos').select('id', { count: 'exact', head: true })
        ])

        const [noticesResult, usersResult, eventsResult, photosResult] = results

        setStats({
          totalNotices: noticesResult.status === 'fulfilled' ? (noticesResult.value.count || 0) : 0,
          totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
          totalEvents: eventsResult.status === 'fulfilled' ? (eventsResult.value.count || 0) : 0,
          totalPhotos: photosResult.status === 'fulfilled' ? (photosResult.value.count || 0) : 0
        })

        // 실패한 쿼리 로그
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const tableNames = ['notices', 'users', 'events', 'photos']
            console.error(`${tableNames[index]} 테이블 통계 로딩 실패:`, result.reason)
          }
        })

        console.log('통계 데이터 로딩 완료')
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-gray-600">워크숍 관리 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              공지사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalNotices}</div>
            <p className="text-xs text-gray-500">총 등록된 공지사항</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              참가자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">등록된 참가자 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              일정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalEvents}</div>
            <p className="text-xs text-gray-500">워크숍 일정 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              사진
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.totalPhotos}</div>
            <p className="text-xs text-gray-500">업로드된 사진 수</p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">새 공지사항 작성</h4>
                <p className="text-sm text-blue-600">중요한 안내사항을 등록하세요</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                신규
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">참가자 현황 확인</h4>
                <p className="text-sm text-green-600">등록된 참가자들을 관리하세요</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                관리
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">공지사항</span>이 업데이트되었습니다
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  새로운 <span className="font-medium">참가자</span>가 등록되었습니다
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">일정</span>이 추가되었습니다
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
