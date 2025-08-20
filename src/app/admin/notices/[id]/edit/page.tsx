'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NoticeForm from '@/features/admin/components/NoticeForm'
import { getNotice, type Notice } from '@/features/admin/api'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface EditNoticePageProps {
  params: Promise<{ id: string }>
}

export default function EditNoticePage({ params }: EditNoticePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNotice() {
      try {
        const resolvedParams = await params
        const data = await getNotice(resolvedParams.id)
        setNotice(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '공지사항을 불러오는데 실패했습니다')
        toast({
          title: '오류',
          description: '공지사항을 불러오는데 실패했습니다',
          variant: 'destructive'
        })
        router.push('/admin/notices')
      } finally {
        setLoading(false)
      }
    }

    loadNotice()
  }, [params, router, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !notice) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              공지사항을 찾을 수 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              {error || '요청한 공지사항이 존재하지 않습니다'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <NoticeForm notice={notice} mode="edit" />
}
