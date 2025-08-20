'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, ChevronRight, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface Notice {
  id: string
  title: string
  content: string
  is_important: boolean
  created_at: string
}

export default function NoticesSection() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotices() {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('id, title, content, is_important, created_at')
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('공지사항 로딩 실패:', error)
          return
        }

        setNotices(data || [])
      } catch (error) {
        console.error('공지사항 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotices()
  }, [])

  // 로딩 중이거나 공지사항이 없으면 기본 공지사항 표시
  if (loading || notices.length === 0) {
    return (
      <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <span>공지사항</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-12 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                <Badge variant="destructive" className="mt-1 bg-red-500">중요</Badge>
                <div>
                  <h4 className="font-medium text-gray-900">워크숍 장소 안내</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    서울시 강남구 테헤란로 123 워크숍 센터에서 진행됩니다.
                    지하철 2호선 강남역 3번 출구에서 도보 5분 거리입니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                <Badge variant="secondary" className="mt-1 bg-gray-500">일반</Badge>
                <div>
                  <h4 className="font-medium text-gray-900">자기소개 등록 마감일</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    8월 20일까지 자기소개를 등록해주세요. 
                    등록하지 않으시면 숙소 배정에 어려움이 있을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <span>공지사항</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => router.push(`/notices/${notice.id}`)}
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                notice.is_important
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100 hover:from-red-100 hover:to-pink-100'
                  : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 hover:from-gray-100 hover:to-blue-100'
              }`}
            >
              <Badge
                variant={notice.is_important ? 'destructive' : 'secondary'}
                className={`mt-1 ${
                  notice.is_important ? 'bg-red-500' : 'bg-gray-500'
                }`}
              >
                {notice.is_important ? '중요' : '일반'}
              </Badge>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{notice.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notice.content.length > 100 
                    ? `${notice.content.substring(0, 100)}...` 
                    : notice.content
                  }
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(notice.created_at), 'M월 d일', { locale: ko })}
                </p>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <Eye className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
        
        {/* 더 보기 버튼 */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/notices')}
            className="bg-white/80 hover:bg-white border-gray-200"
          >
            모든 공지사항 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
