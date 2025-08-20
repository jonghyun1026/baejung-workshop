'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Heart, Target, Coffee, Users, AlertCircle } from 'lucide-react'
import { getUserIntroduction, type IntroductionWithUser } from '@/features/introductions/api'
import { getProfileImageUrl } from '@/features/profile/api'

interface UserIntroductionModalProps {
  userId: string | null
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function UserIntroductionModal({ userId, userName, isOpen, onClose }: UserIntroductionModalProps) {
  const [introduction, setIntroduction] = useState<IntroductionWithUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      loadIntroduction()
    }
  }, [isOpen, userId])

  const loadIntroduction = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getUserIntroduction(userId)
      setIntroduction(data)
    } catch (err) {
      console.error('자기소개 로드 실패:', err)
      setError('자기소개를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getKeywords = () => {
    if (!introduction?.keywords) return []
    return introduction.keywords.split(', ').filter(k => k.trim())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{userName}님의 자기소개</span>
          </DialogTitle>
          <DialogDescription>
            {introduction?.user.school} {introduction?.user.major}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">자기소개를 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800 justify-center">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        ) : !introduction ? (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-gray-600 justify-center">
                <User className="h-5 w-5" />
                <span>{userName}님이 아직 자기소개를 작성하지 않았습니다.</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 프로필 사진 및 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>기본 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 프로필 사진 섹션 */}
                <div className="flex flex-col items-center space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {introduction.user.profile_image_url ? (
                      <img 
                        src={getProfileImageUrl(introduction.user)} 
                        alt={`${introduction.user.name}님의 프로필 사진`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{introduction.user.name}</h3>
                    <p className="text-sm text-gray-600">{introduction.user.school} · {introduction.user.major}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">조</label>
                    <Badge variant="secondary">{introduction.user.ws_group}</Badge>
                  </div>
                  {introduction.mbti && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">MBTI</label>
                      <Badge variant="outline">{introduction.mbti}</Badge>
                    </div>
                  )}
                </div>
                {introduction.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">거주지</label>
                    <p className="text-gray-900">{introduction.location}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 키워드 */}
            {getKeywords().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-lg">🏷️</span>
                    <span>나를 표현하는 키워드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {getKeywords().map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 관심사 */}
            {introduction.interests && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>요즘 나의 관심사</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {introduction.interests}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 버킷리스트 */}
            {introduction.bucketlist && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>인생 버킷리스트</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {introduction.bucketlist}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 스트레스 해소법 */}
            {introduction.stress_relief && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coffee className="h-5 w-5" />
                    <span>나만의 스트레스 해소법</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {introduction.stress_relief}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 장학재단 활동 */}
            {introduction.foundation_activity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>장학재단에서 하고 싶은 활동</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {introduction.foundation_activity}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 작성일 */}
            <div className="text-sm text-gray-500 text-center">
              {introduction.updated_at && (
                <>작성일: {new Date(introduction.updated_at).toLocaleDateString('ko-KR')}</>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

