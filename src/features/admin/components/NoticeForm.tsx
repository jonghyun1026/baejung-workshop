'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createNotice, updateNotice, type Notice, type CreateNoticeData } from '@/features/admin/api'
import Link from 'next/link'

interface NoticeFormProps {
  notice?: Notice
  mode: 'create' | 'edit'
}

export default function NoticeForm({ notice, mode }: NoticeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    is_important: notice?.is_important || false
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    } else if (formData.title.length > 200) {
      newErrors.title = '제목은 200자 이내로 입력해주세요'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      if (mode === 'create') {
        await createNotice(formData as CreateNoticeData)
        toast({
          title: '성공',
          description: '공지사항이 등록되었습니다.'
        })
      } else {
        await updateNotice({
          id: notice!.id,
          ...formData
        })
        toast({
          title: '성공',
          description: '공지사항이 수정되었습니다.'
        })
      }
      
      router.push('/admin/notices')
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '작업 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/notices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? '새 공지사항 작성' : '공지사항 수정'}
          </h2>
          <p className="text-gray-600">
            {mode === 'create' 
              ? '새로운 공지사항을 작성하세요' 
              : '공지사항 내용을 수정하세요'
            }
          </p>
        </div>
      </div>

      {/* 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>공지사항 정보</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 중요도 설정 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_important"
                checked={formData.is_important}
                onCheckedChange={(checked) => 
                  handleInputChange('is_important', checked === true)
                }
              />
              <Label htmlFor="is_important" className="text-sm font-medium">
                중요 공지사항으로 설정
              </Label>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                className={errors.title ? 'border-red-500' : ''}
                maxLength={200}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
              <p className="text-xs text-gray-500">
                {formData.title.length}/200자
              </p>
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                내용 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
                className={`min-h-[200px] ${errors.content ? 'border-red-500' : ''}`}
                rows={10}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
              <p className="text-xs text-gray-500">
                마크다운 문법을 사용할 수 있습니다
              </p>
            </div>

            {/* 미리보기 */}
            {formData.content && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">미리보기</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    {formData.is_important && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                        중요
                      </span>
                    )}
                    <h4 className="font-medium">{formData.title || '제목 없음'}</h4>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {formData.content}
                  </p>
                </div>
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link href="/admin/notices">
                <Button variant="outline" type="button">
                  취소
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    {mode === 'create' ? '등록 중...' : '수정 중...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? '등록하기' : '수정하기'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
