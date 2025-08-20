'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { getNotice, type Notice } from '@/features/admin/api'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNotice() {
      if (!params.id || typeof params.id !== 'string') {
        setError('잘못된 공지사항 ID입니다.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getNotice(params.id)
        setNotice(data)
      } catch (error: any) {
        console.error('공지사항 로딩 실패:', error)
        setError(error.message || '공지사항을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadNotice()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">공지사항을 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">공지사항을 찾을 수 없습니다</h2>
                <p className="text-gray-600 mb-6">
                  {error || '요청하신 공지사항이 존재하지 않거나 삭제되었습니다.'}
                </p>
                <Button onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  홈으로 돌아가기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="bg-white/80 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </div>

          {/* 공지사항 상세 카드 */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge
                      variant={notice.is_important ? 'destructive' : 'secondary'}
                      className={`${
                        notice.is_important ? 'bg-red-500' : 'bg-gray-500'
                      } text-white`}
                    >
                      {notice.is_important ? '중요 공지' : '일반 공지'}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
                    {notice.title}
                  </CardTitle>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>작성일: {format(new Date(notice.created_at), 'yyyy년 M월 d일', { locale: ko })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(notice.created_at), 'HH:mm')}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose prose-gray max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  style={{ 
                    fontSize: '16px',
                    lineHeight: '1.7'
                  }}
                >
                  {notice.content}
                </div>
              </div>

              {/* 하단 액션 버튼들 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/')}
                    className="bg-gray-50 hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    홈으로 돌아가기
                  </Button>
                  
                  <div className="text-xs text-gray-500">
                    최종 수정: {format(new Date(notice.updated_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
