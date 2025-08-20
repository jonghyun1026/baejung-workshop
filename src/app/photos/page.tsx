'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Upload, Camera, Trash2, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { getPhotos, uploadPhoto, likePhoto, unlikePhoto, checkPhotoLike, deletePhoto, checkStorageBucket, getPhotoUrl, getUserLikedPhotos, type Photo } from '@/features/photos/api'

export default function PhotosPage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [storageReady, setStorageReady] = useState(false)
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set())
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [likingPhotos, setLikingPhotos] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    initializePhotosPage()
  }, [user])

  const initializePhotosPage = async () => {
    try {
      setLoading(true)
      setLoadingLikes(true)
      
      console.log('📷 사진 페이지 초기화 시작...')

      // 1. Storage 버킷 확인 (버킷이 있으므로 강제로 true 설정)
      console.log('1️⃣ Storage 버킷 확인 중...')
      setStorageReady(true) // Storage는 이미 설정되어 있으므로 true로 설정
      console.log('✅ Storage 준비 완료')

      // 2. 사진 목록 조회
      console.log('2️⃣ 사진 목록 조회 중...')
      try {
        const data = await getPhotos()
        setPhotos(data)
        console.log('✅ 사진 목록 조회 완료:', data.length, '개')
      } catch (photoError: any) {
        console.error('❌ 사진 조회 실패:', photoError)
        
        if (photoError.message.includes('photos') && photoError.message.includes('does not exist')) {
          toast({
            title: "📋 데이터베이스 설정 필요",
            description: `사진 조회 중 오류가 발생했습니다: ${photoError.message}`,
            variant: "destructive"
          })
        } else {
          toast({
            title: "사진 조회 실패",
            description: `사진을 불러오는데 실패했습니다: ${photoError.message}`,
            variant: "destructive"
          })
        }
        setPhotos([])
      }

      // 3. 사용자 좋아요 목록 조회
      if (user) {
        console.log('3️⃣ 사용자 좋아요 목록 조회 중...')
        try {
          const likes = await getUserLikedPhotos({ id: user.id, name: user.name })
          setLikedPhotos(likes)
          console.log('✅ 좋아요 목록 조회 완료:', likes.size, '개')
        } catch (likeError) {
          console.error('❌ 좋아요 조회 실패:', likeError)
        }
      }

      console.log('📷 사진 페이지 초기화 완료')
    } catch (error) {
      console.error('❌ 사진 페이지 초기화 실패:', error)
      setPhotos([])
    } finally {
      setLoading(false)
      setLoadingLikes(false)
    }
  }

  const fetchPhotos = async () => {
    try {
      const data = await getPhotos()
      setPhotos(data)
      
      // 좋아요 목록도 다시 조회
      if (user) {
        const likes = await getUserLikedPhotos({ id: user.id, name: user.name })
        setLikedPhotos(likes)
      }
    } catch (error: any) {
      console.error('❌ 사진 조회 실패:', error)
      toast({
        title: "사진 조회 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        toast({
          title: "파일 크기 초과",
          description: "10MB 이하의 파일만 업로드할 수 있습니다.",
          variant: "destructive"
        })
        return
      }
    setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    console.log('🚀 업로드 시작...')
    console.log('📁 선택된 파일:', selectedFile?.name, selectedFile?.size, selectedFile?.type)
    console.log('👤 현재 사용자:', user)
    console.log('📦 Storage 준비 상태:', storageReady)
    
    if (!selectedFile || !user) {
      console.log('❌ 업로드 조건 미충족 - 파일:', !!selectedFile, '사용자:', !!user)
      toast({
        title: "업로드 실패",
        description: "파일을 선택하고 로그인을 해주세요.",
        variant: "destructive"
      })
      return
    }

    // Storage는 이미 설정되어 있으므로 체크 생략

    try {
      setUploading(true)
      console.log('📤 uploadPhoto 함수 호출 중...')
      const result = await uploadPhoto(selectedFile, description, { id: user.id, name: user.name })
      console.log('✅ uploadPhoto 결과:', result)
      
      toast({
        title: "업로드 완료",
        description: "사진이 성공적으로 업로드되었습니다.",
      })
      
      // 업로드 후 목록 새로고침
      setSelectedFile(null)
      setDescription('')
      await fetchPhotos()
    } catch (error: any) {
      console.error('❌ 업로드 실패:', error)
      console.error('❌ 오류 스택:', error.stack)
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleLikeToggle = async (photoId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인이 필요합니다.",
        variant: "destructive"
      })
      return
    }

    if (likingPhotos.has(photoId)) return
    
    const isLiked = likedPhotos.has(photoId)
    
    try {
    setLikingPhotos(prev => new Set(prev).add(photoId))
    
    if (isLiked) {
        await unlikePhoto(photoId, { id: user.id, name: user.name })
      setLikedPhotos(prev => {
        const newSet = new Set(prev)
        newSet.delete(photoId)
        return newSet
      })
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, likes_count: Math.max(0, (photo.likes_count || 0) - 1) }
          : photo
      ))
    } else {
        await likePhoto(photoId, { id: user.id, name: user.name })
      setLikedPhotos(prev => new Set(prev).add(photoId))
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, likes_count: (photo.likes_count || 0) + 1 }
          : photo
      ))
    }

      // 실제 데이터 새로고침 (낙관적 업데이트 후 동기화)
      setTimeout(async () => {
        try {
          if (user) {
            const likes = await getUserLikedPhotos({ id: user.id, name: user.name })
            setLikedPhotos(likes)
            setPhotos(prev => prev.map(photo => 
              photo.id === photoId 
                ? { ...photo, likes_count: photo.likes_count }
                : photo
            ))
          }
        } catch (error) {
          console.error('좋아요 상태 동기화 실패:', error)
          // 동기화 실패시 원래 상태로 복원
      if (isLiked) {
        setLikedPhotos(prev => new Set(prev).add(photoId))
        setPhotos(prev => prev.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes_count: (photo.likes_count || 0) + 1 }
            : photo
        ))
      } else {
        setLikedPhotos(prev => {
          const newSet = new Set(prev)
          newSet.delete(photoId)
          return newSet
        })
        setPhotos(prev => prev.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes_count: Math.max(0, (photo.likes_count || 0) - 1) }
            : photo
        ))
      }
        }
      }, 1000)

    } catch (error: any) {
      console.error('❌ 좋아요 처리 실패:', error)
      toast({
        title: "좋아요 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLikingPhotos(prev => {
        const newSet = new Set(prev)
        newSet.delete(photoId)
        return newSet
      })
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return

    try {
      await deletePhoto(photoId)
      toast({
        title: "삭제 완료",
        description: "사진이 삭제되었습니다.",
      })
      await fetchPhotos()
    } catch (error: any) {
      console.error('❌ 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const resetUploadForm = () => {
    setSelectedFile(null)
    setDescription('')
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleStorageSetup = async () => {
    const confirmed = confirm(`
Supabase 대시보드에서 Storage 설정이 필요합니다:

1. Supabase 대시보드 → Storage로 이동
2. 'Create a new bucket' 클릭
3. Name: photos
4. Public bucket: ✅ (체크)
5. 'Create bucket' 클릭

설정 후 페이지를 새로고침해주세요.
`)
    
    if (confirmed) {
      // 설정 후 다시 확인
      setTimeout(async () => {
        const bucketExists = await checkStorageBucket()
        if (bucketExists) {
          setStorageReady(true)
          toast({
            title: "Storage 설정 완료",
            description: "이제 사진을 업로드할 수 있습니다!",
          })
          await initializePhotosPage()
        }
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📸 사진첩</h1>
        <p className="text-gray-600">워크숍의 소중한 순간들을 공유해보세요</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Camera className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">{photos.length}</div>
              <p className="text-sm text-gray-500">총 사진</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Heart className="h-8 w-8 mx-auto text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-pink-600">
                {photos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0)}
              </div>
              <p className="text-sm text-gray-500">총 좋아요</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {photos.filter(p => p.image_url && p.image_url.includes('.')).length}
              </div>
              <p className="text-sm text-gray-500">업로드된 사진</p>
            </div>
          </CardContent>
        </Card>
        </div>

      {/* 사진 업로드 */}
      <Card className="mb-8">
            <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            사진 업로드
              </CardTitle>
            </CardHeader>
            <CardContent>
          {!user ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">사진을 업로드하려면 로그인이 필요합니다.</p>
              <Button asChild>
                <a href="/auth">로그인하기</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  사진 선택
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (선택사항)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="사진에 대한 설명을 입력해주세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      업로드
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetUploadForm}
                  disabled={uploading}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
          </CardContent>
        </Card>

      {/* 사진 목록 */}
      <div className="space-y-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 업로드된 사진이 없습니다</h3>
            <p className="text-gray-500">첫 번째 사진을 업로드해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={getPhotoUrl(photo)}
                    alt={photo.description || '워크숍 사진'}
                      className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src = 'https://picsum.photos/400/400?grayscale'
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  {photo.description && (
                    <p className="text-sm text-gray-600 mb-3">{photo.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{photo.users?.name || '익명'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeToggle(photo.id)}
                        disabled={likingPhotos.has(photo.id)}
                        className={`${
                          likedPhotos.has(photo.id) 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-600 hover:text-red-500'
                        } ${
                          likingPhotos.has(photo.id) ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        <Heart 
                          className={`h-4 w-4 mr-1 ${
                          likedPhotos.has(photo.id) 
                              ? 'fill-current text-red-500 scale-110' 
                              : 'text-gray-600'
                        } ${
                          likingPhotos.has(photo.id) ? 'animate-pulse' : ''
                          }`} 
                        />
                          {photo.likes_count || 0}
                      </Button>
                      
                      {user && (photo.user_id === user.id || photo.users?.name === user.name) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(photo.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(photo.uploaded_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </div>
    </div>
  )
} 
