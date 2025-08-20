'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Eye, ChevronRight, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Notice {
  id: string
  title: string
  content: string
  is_important: boolean
  created_at: string
  updated_at: string
}

export default function NoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadNotices() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('공지사항 로딩 실패:', error)
          return
        }

        setNotices(data || [])
        setFilteredNotices(data || [])
      } catch (error) {
        console.error('공지사항 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotices()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notices.filter(notice => 
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredNotices(filtered)
    } else {
      setFilteredNotices(notices)
    }
  }, [searchQuery, notices])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="bg-white/80 hover:bg-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
                <p className="text-gray-600">총 {filteredNotices.length}개의 공지사항</p>
              </div>
            </div>
          </div>

          {/* 검색 */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="공지사항 제목이나 내용으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* 공지사항 목록 */}
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <Card 
                key={notice.id}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                onClick={() => router.push(`/notices/${notice.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Badge
                      variant={notice.is_important ? 'destructive' : 'secondary'}
                      className={`mt-1 ${
                        notice.is_important ? 'bg-red-500' : 'bg-gray-500'
                      } text-white`}
                    >
                      {notice.is_important ? '중요' : '일반'}
                    </Badge>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {notice.content.length > 200 
                          ? `${notice.content.substring(0, 200)}...` 
                          : notice.content
                        }
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>작성일: {format(new Date(notice.created_at), 'yyyy년 M월 d일', { locale: ko })}</span>
                          <span>수정일: {format(new Date(notice.updated_at), 'M월 d일', { locale: ko })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Eye className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 빈 상태 */}
          {filteredNotices.length === 0 && !loading && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '공지사항이 없습니다'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? '다른 검색어로 시도해보세요.' 
                    : '아직 등록된 공지사항이 없습니다.'
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* 하단 여백 */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}
