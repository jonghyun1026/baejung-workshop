'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Phone, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Users, 
  LogOut,
  Edit3,
  Save,
  X,
  Camera,
  Upload,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadProfileImage, deleteProfileImage, getUserProfile, getProfileImageUrl, hasUploadedProfileImageSync } from '@/features/profile/api'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  
  // 프로필 사진 관련 state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [hasRealProfileImage, setHasRealProfileImage] = useState<boolean>(false)
  
  // 편집 가능한 필드들
  const [editData, setEditData] = useState({
    phone_number: '',
    attendance: '',
    program: ''
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      console.log('📊 프로필 데이터 로딩 시작:', user.name)
      const data = await getUserProfile({ id: user.id, name: user.name })
      console.log('📊 프로필 데이터 로딩 완료:', data?.name, '이미지:', data?.profile_image_url)
      
      // 실제 업로드된 이미지 존재 여부 확인
      const hasRealImage = hasUploadedProfileImageSync(data)
      console.log('🔍 실제 업로드된 이미지 존재:', hasRealImage)
      
      setProfileData(data)
      setHasRealProfileImage(hasRealImage)
      setEditData({
        phone_number: data.phone_number || '',
        attendance: data.attendance || '',
        program: data.program || ''
      })
    } catch (error: any) {
      console.error('📊 프로필 데이터 로딩 실패:', error)
      toast({
        title: "프로필 로딩 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setLoading(true)

      console.log('🔄 프로필 정보 업데이트 시도:', {
        userId: user.id,
        editData
      })

      // 직접 업데이트 시도, 실패 시 RPC 함수 사용
      const { error } = await supabase
        .from('users')
        .update({
          phone_number: editData.phone_number || null,
          attendance: editData.attendance || null,
          program: editData.program || null
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ 직접 업데이트 실패, RPC 함수로 재시도:', error)
        // RLS 오류인 경우 RPC 함수 사용
        if (error.message.includes('Row Level Security') || error.code === '42501') {
          const { data: updateResult, error: rpcError } = await supabase.rpc('update_user_profile_info', {
            p_user_id: user.id,
            p_phone_number: editData.phone_number || null,
            p_attendance: editData.attendance || null,
            p_program: editData.program || null
          })
          
          if (rpcError) {
            throw new Error(`프로필 업데이트 실패: ${rpcError.message}`)
          }
          console.log('✅ RPC로 프로필 업데이트 성공:', updateResult?.[0] || updateResult)
        } else {
          throw error
        }
      } else {
        console.log('✅ 직접 프로필 업데이트 성공')
      }

      setProfileData({
        ...profileData,
        ...editData
      })
      setEditing(false)

      toast({
        title: "프로필 업데이트 완료",
        description: "프로필 정보가 성공적으로 업데이트되었습니다.",
      })
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error)
      toast({
        title: "업데이트 실패",
        description: error.message || '알 수 없는 오류가 발생했습니다.',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error: any) {
      console.error('로그아웃 실패:', error)
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const cancelEdit = () => {
    setEditData({
      phone_number: profileData.phone_number || '',
      attendance: profileData.attendance || '',
      program: profileData.program || ''
    })
    setEditing(false)
  }

  // 프로필 사진 업로드 함수들
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        toast({
          title: "파일 크기 초과",
          description: "5MB 이하의 이미지만 업로드할 수 있습니다.",
          variant: "destructive"
        })
        return
      }
      setSelectedImage(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImage || !user) return

    try {
      setUploadingImage(true)
      
      console.log('🔄 프로필 이미지 업로드 시도:', {
        fileName: selectedImage.name,
        fileSize: selectedImage.size,
        fileType: selectedImage.type,
        user: { id: user.id, name: user.name }
      })
      
      const updatedUserData = await uploadProfileImage(selectedImage, { id: user.id, name: user.name })
      
      toast({
        title: "프로필 사진 업로드 완료",
        description: "프로필 사진이 성공적으로 업로드되었습니다.",
      })
      
      // 업로드 함수에서 반환된 업데이트된 사용자 데이터로 즉시 상태 업데이트
      console.log('🔄 업로드 결과로 프로필 데이터 업데이트:', updatedUserData?.profile_image_url)
      if (updatedUserData) {
        const hasRealImage = hasUploadedProfileImageSync(updatedUserData)
        // RPC 함수에서 반환된 데이터는 제한적이므로 프로필 이미지와 hasRealImage만 업데이트
        setProfileData(prev => ({ ...prev, profile_image_url: updatedUserData.profile_image_url }))
        setHasRealProfileImage(hasRealImage)
        console.log('✅ 프로필 이미지 즉시 업데이트 완료, 실제 이미지:', hasRealImage)
      }
      
      // 추가 안전장치: 약간의 지연 후 DB에서 다시 한 번 확인
      setTimeout(async () => {
        console.log('🔄 안전장치: 지연된 프로필 데이터 새로고침')
        await loadProfileData()
      }, 1500)
      
      setSelectedImage(null)
      
      // 파일 input 초기화
      const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error: any) {
      console.error('프로필 사진 업로드 실패:', error)
      
      let errorMessage = error.message || '알 수 없는 오류가 발생했습니다.'
      
      // 일반적인 오류들에 대한 사용자 친화적 메시지
      if (errorMessage.includes('The resource already exists')) {
        errorMessage = '동일한 이름의 파일이 이미 존재합니다. 잠시 후 다시 시도해주세요.'
      } else if (errorMessage.includes('Row Level Security')) {
        errorMessage = '권한이 없습니다. 다시 로그인해주세요.'
      } else if (errorMessage.includes('413') || errorMessage.includes('too large')) {
        errorMessage = '파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.'
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        errorMessage = '잘못된 파일 형식입니다. JPG, PNG, WebP 파일만 업로드 가능합니다.'
      }
      
      toast({
        title: "업로드 실패",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDelete = async () => {
    if (!user) return
    
    if (!confirm('프로필 사진을 삭제하시겠습니까?')) return

    try {
      setUploadingImage(true)
      
      await deleteProfileImage({ id: user.id, name: user.name })
      
      // 삭제 후 즉시 상태 업데이트
      setHasRealProfileImage(false)
      
      toast({
        title: "프로필 사진 삭제 완료",
        description: "프로필 사진이 삭제되었습니다.",
      })
      
      // 프로필 데이터 새로고침
      await loadProfileData()
    } catch (error: any) {
      console.error('프로필 사진 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploadingImage(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-500 mb-4">마이페이지를 이용하려면 로그인해주세요.</p>
            <Button asChild>
              <Link href="/auth">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !profileData) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 마이페이지</h1>
        <p className="text-gray-600">내 정보를 확인하고 수정하세요</p>
      </div>

      {/* 프로필 카드 */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 프로필 사진 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              프로필 사진
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              {/* 프로필 사진 표시 */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                  <img
                    src={getProfileImageUrl(profileData)}
                    alt="프로필 사진"
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      console.log('🖼️ 프로필 이미지 로드 성공:', getProfileImageUrl(profileData))
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      console.error('🖼️ 프로필 이미지 로드 실패:', img.src)
                      img.src = 'https://picsum.photos/200/200?grayscale&blur=1'
                    }}
                  />
                </div>
                {hasRealProfileImage && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={handleImageDelete}
                    disabled={uploadingImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 업로드 섹션 */}
              <div className="w-full max-w-sm space-y-3">
                <div>
                  <label htmlFor="profile-image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    프로필 사진 업로드
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                {selectedImage && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    >
                      {uploadingImage ? (
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
                      onClick={() => {
                        setSelectedImage(null)
                        const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                      disabled={uploadingImage}
                    >
                      취소
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 text-center">
                  JPG, PNG, WebP 형식의 5MB 이하 이미지만 업로드 가능합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                프로필 정보
              </CardTitle>
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  disabled={loading}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  편집
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기본 정보 (읽기 전용) */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-lg font-semibold">{profileData?.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">학교</label>
                  <p className="text-gray-900">{profileData?.school}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">학과</label>
                  <p className="text-gray-900">{profileData?.major}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">기수</label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{profileData?.generation}기</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">성별</label>
                  <p className="text-gray-900">{profileData?.gender}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">조</label>
                  <p className="text-gray-900">{profileData?.ws_group}</p>
                </div>
              </div>

              {/* 편집 가능한 정보 */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">전화번호</label>
                  {editing ? (
                    <Input
                      value={editData.phone_number}
                      onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                      placeholder="010-1234-5678"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{profileData?.phone_number || '미설정'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">참석여부</label>
                  {editing ? (
                    <select
                      value={editData.attendance}
                      onChange={(e) => setEditData({...editData, attendance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="">선택해주세요</option>
                      <option value="참석">참석</option>
                      <option value="불참">불참</option>
                      <option value="미정">미정</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={profileData?.attendance === '참석' ? 'default' : 'outline'}
                        className={
                          profileData?.attendance === '참석' ? 'bg-green-500' :
                          profileData?.attendance === '불참' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }
                      >
                        {profileData?.attendance || '미정'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">프로그램</label>
                  {editing ? (
                    <Input
                      value={editData.program}
                      onChange={(e) => setEditData({...editData, program: e.target.value})}
                      placeholder="프로그램명을 입력하세요"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{profileData?.program || '미설정'}</p>
                  )}
                </div>

                {profileData?.birth_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">생년월일</label>
                    <p className="text-gray-900">
                      {new Date(profileData.birth_date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">재학여부</label>
                  <p className="text-gray-900">{profileData?.status}</p>
                </div>

                {profileData?.role && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">역할</label>
                    <Badge variant={profileData.role === 'admin' ? 'default' : 'outline'}>
                      {profileData.role === 'admin' ? '관리자' : '학생'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 링크 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 링크</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/introduction" className="flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>자기소개 작성</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/directory" className="flex flex-col items-center space-y-2">
                  <GraduationCap className="h-6 w-6" />
                  <span>참가자 명단</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/rooms" className="flex flex-col items-center space-y-2">
                  <MapPin className="h-6 w-6" />
                  <span>숙소배정내역</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/schedule" className="flex flex-col items-center space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span>일정표</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 로그아웃 */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
              disabled={loading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
