'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getNotices, deleteNotice, type Notice } from '@/features/admin/api'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function NoticesManagement() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadNotices()
  }, [])

  useEffect(() => {
    const filtered = notices.filter(notice =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredNotices(filtered)
  }, [notices, searchTerm])

  const loadNotices = async () => {
    try {
      setLoading(true)
      const data = await getNotices()
      setNotices(data)
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '공지사항을 불러오는데 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 공지사항을 삭제하시겠습니까?`)) {
      return
    }

    try {
      setDeleteLoading(id)
      await deleteNotice(id)
      
      toast({
        title: '성공',
        description: '공지사항이 삭제되었습니다.'
      })
      
      await loadNotices()
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '공지사항 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">공지사항 관리</h2>
            <p className="text-gray-600">워크숍 공지사항을 등록하고 관리하세요</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">공지사항 관리</h2>
          <p className="text-gray-600">워크숍 공지사항을 등록하고 관리하세요</p>
        </div>
        <Link href="/admin/notices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 공지사항 작성
          </Button>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="공지사항 제목 또는 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">전체 공지사항</p>
                <p className="text-xl font-bold">{notices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">중요 공지</p>
                <p className="text-xl font-bold">
                  {notices.filter(notice => notice.is_important).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">검색 결과</p>
                <p className="text-xl font-bold">{filteredNotices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 공지사항 목록 */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 공지사항이 없습니다'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? '다른 검색어로 시도해보세요' 
                  : '첫 번째 공지사항을 작성해보세요'
                }
              </p>
              {!searchTerm && (
                <Link href="/admin/notices/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    공지사항 작성
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredNotices.map((notice) => (
            <Card key={notice.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg truncate">{notice.title}</CardTitle>
                      {notice.is_important && (
                        <Badge variant="destructive" className="shrink-0">중요</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href={`/admin/notices/${notice.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(notice.id, notice.title)}
                      disabled={deleteLoading === notice.id}
                    >
                      {deleteLoading === notice.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    작성일: {format(new Date(notice.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                  </span>
                  {notice.updated_at !== notice.created_at && (
                    <span>
                      수정일: {format(new Date(notice.updated_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
