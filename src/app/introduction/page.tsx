'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, User as UserIcon, Tag, Heart, Target, Coffee, Users, Camera, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { saveIntroduction, getUserIntroduction, type IntroductionFormData } from '@/features/introductions/api'
import { useAuth } from '@/hooks/useAuth'
import { getUsers, type User } from '@/features/users/api'
import { uploadProfileImage, deleteProfileImage, getUserProfile, getProfileImageUrl } from '@/features/profile/api'

const introductionSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  school: z.string().min(1, '학교를 입력해주세요'),
  major: z.string().min(1, '전공을 입력해주세요'),
  birthDate: z.string().min(1, '생년월일을 선택해주세요'),
  location: z.string().min(1, '사는 곳을 입력해주세요'),
  mbti: z.string().min(1, 'MBTI를 선택해주세요'),
  keywords: z.string().optional(), // 키워드는 별도로 검증
  interests: z.string().min(1, '관심사를 입력해주세요'),
  bucketlist: z.string().min(1, '버킷리스트를 입력해주세요'),
  stressRelief: z.string().min(1, '스트레스 해소법을 입력해주세요'),
  foundationActivity: z.string().min(1, '장학재단에서 하고 싶은 활동을 입력해주세요'),
})

type IntroductionForm = z.infer<typeof introductionSchema>

const mbtiOptions = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

export default function IntroductionPage() {
  const { user, isAuthenticated } = useAuth()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  
  // 프로필 사진 관련 상태
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<IntroductionForm>({
    resolver: zodResolver(introductionSchema),
    defaultValues: {
      name: '',
      school: '',
      major: '',
      birthDate: '',
      location: '',
      mbti: '',
      keywords: '',
      interests: '',
      bucketlist: '',
      stressRelief: '',
      foundationActivity: '',
    }
  })

  // 초기 데이터 로드
  useEffect(() => {
    initializeData()
  }, [])

  // 사용자 변경 시 자기소개 로드
  useEffect(() => {
    if (user?.id) {
      setSelectedUserId(user.id)
      const selectedUser = users.find(u => u.id === user.id)
      if (selectedUser) {
        setSearchQuery(selectedUser.name)
      }
      loadExistingIntroduction(user.id)
    } else if (!isAuthenticated && users.length > 0) {
      // 인증되지 않은 사용자의 경우 기본값 설정
      setDefaultValues()
      setLoading(false)
    }
  }, [user, isAuthenticated, users])

  // 검색어에 따른 사용자 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const initializeData = async () => {
    try {
      setLoading(true)
      // 사용자 목록 로드
      const usersData = await getUsers()
      setUsers(usersData)
      
      // 인증된 사용자가 있으면 해당 사용자 선택
      if (user?.id) {
        setSelectedUserId(user.id)
        await loadExistingIntroduction(user.id)
      } else if (!isAuthenticated) {
        setDefaultValues()
      }
    } catch (err) {
      console.error('초기 데이터 로드 실패:', err)
      setError('사용자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadExistingIntroduction = async (userId: string) => {
    try {
      const existingIntro = await getUserIntroduction(userId)
      const selectedUser = users.find(u => u.id === userId)
      
      // 프로필 이미지 로드
      await loadProfileImage(userId)
      
      if (existingIntro) {
        // 기존 데이터로 폼 초기화
        reset({
          name: existingIntro.user.name,
          school: existingIntro.user.school,
          major: existingIntro.user.major,
          birthDate: '',
          location: '',
          mbti: '',
          keywords: '',
          interests: existingIntro.interests,
          bucketlist: existingIntro.bucketlist,
          stressRelief: existingIntro.stress_relief,
          foundationActivity: existingIntro.foundation_activity,
        })
        // 키워드 설정
        if (existingIntro.keywords) {
          setKeywords(existingIntro.keywords.split(', ').filter(k => k.trim()))
        }
      } else if (selectedUser) {
        // 사용자 기본 정보로 설정
        reset({
          name: selectedUser.name,
          school: selectedUser.school,
          major: selectedUser.major,
          birthDate: '',
          location: '',
          mbti: '',
          keywords: '',
          interests: '',
          bucketlist: '',
          stressRelief: '',
          foundationActivity: '',
        })
        setKeywords([])
      }
    } catch (err) {
      console.error('기존 자기소개 로드 실패:', err)
      setError('기존 자기소개를 불러오는데 실패했습니다.')
    }
  }

  // 프로필 이미지 로드
  const loadProfileImage = async (userId: string) => {
    try {
      const selectedUser = users.find(u => u.id === userId)
      if (selectedUser) {
        const userProfile = await getUserProfile({ id: userId, name: selectedUser.name })
        const imageUrl = getProfileImageUrl(userProfile)
        setProfileImage(imageUrl)
      }
    } catch (err) {
      console.error('프로필 이미지 로드 실패:', err)
      setProfileImage('https://picsum.photos/200/200?grayscale&blur=1')
    }
  }

  const setDefaultValues = () => {
    reset({
      name: '김장학',
      school: '서울대학교',
      major: '컴퓨터공학과',
      birthDate: '2000-01-01',
      location: '서울시 강남구',
      mbti: 'INTJ',
      keywords: '',
      interests: '인공지능과 머신러닝에 관심이 많습니다. 새로운 기술을 배우는 것을 좋아하고, 창의적인 문제 해결을 즐깁니다.',
      bucketlist: '세계 여행을 떠나 다양한 문화를 경험하고 싶습니다. 또한 사회에 기여할 수 있는 의미 있는 프로젝트를 완성하고 싶습니다.',
      stressRelief: '음악을 듣거나 산책을 하는 것을 좋아합니다. 특히 자연 속에서 시간을 보내면 마음이 평온해집니다.',
      foundationActivity: '다른 장학생들과 함께하는 멘토링 프로그램에 참여하고 싶습니다. 후배들에게 도움을 주면서 동시에 배우고 싶습니다.',
    })
  }

  const addKeyword = () => {
    const keyword = watch('keywords')?.trim() || ''
    console.log('🏷️ 키워드 추가 시도:', keyword, '현재 키워드:', keywords)
    
    if (!keyword) {
      setError('키워드를 입력해주세요.')
      return
    }
    
    if (keywords.length >= 3) {
      setError('키워드는 최대 3개까지만 추가할 수 있습니다.')
      return
    }
    
    if (keywords.includes(keyword)) {
      setError('이미 추가된 키워드입니다.')
      return
    }
    
    if (keyword.length > 20) {
      setError('키워드는 20자 이하로 입력해주세요.')
      return
    }
    
    // 키워드 추가 성공
    setKeywords([...keywords, keyword])
    setValue('keywords', '')
    setError(null) // 에러 클리어
    console.log('✅ 키워드 추가 완료:', keyword, '업데이트된 키워드:', [...keywords, keyword])
  }

  const removeKeyword = (index: number) => {
    const removedKeyword = keywords[index]
    setKeywords(keywords.filter((_, i) => i !== index))
    setError(null) // 에러 클리어
    console.log('🗑️ 키워드 삭제:', removedKeyword, '남은 키워드:', keywords.filter((_, i) => i !== index))
  }

  // 사용자 선택 시 처리
  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId)
    setError(null)
    setImageUploadError(null)
    
    const selectedUser = users.find(u => u.id === userId)
    if (selectedUser) {
      setSearchQuery(selectedUser.name)
      setShowDropdown(false)
      // 선택된 사용자의 자기소개 로드
      await loadExistingIntroduction(userId)
    }
  }

  // 검색 입력 처리
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowDropdown(true)
    setHighlightedIndex(-1)
    
    // 정확히 일치하는 사용자가 있으면 자동 선택
    const exactMatch = users.find(user => user.name === value)
    if (exactMatch) {
      setSelectedUserId(exactMatch.id)
    } else {
      setSelectedUserId('')
    }
  }

  // 키보드 네비게이션 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredUsers[highlightedIndex]) {
          handleUserSelect(filteredUsers[highlightedIndex].id)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // 드롭다운 외부 클릭 시 닫기
  const handleBlur = () => {
    // 약간의 지연을 두어 클릭 이벤트가 처리될 시간을 줌
    setTimeout(() => setShowDropdown(false), 150)
  }

  // 프로필 이미지 업로드 처리
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setImageUploadError('이미지 파일만 업로드 가능합니다.')
      return
    }

    try {
      setUploadingImage(true)
      setImageUploadError(null)

      // 현재 선택된 사용자 정보
      const currentUser = selectedUserId ? users.find(u => u.id === selectedUserId) : user
      if (!currentUser) {
        setImageUploadError('사용자를 선택해주세요.')
        return
      }

      console.log('📤 프로필 이미지 업로드 시작:', file.name, currentUser)

      await uploadProfileImage(file, { id: currentUser.id, name: currentUser.name })
      
      // 업로드 성공 후 이미지 다시 로드
      await loadProfileImage(currentUser.id)
      
      console.log('✅ 프로필 이미지 업로드 완료')
    } catch (error) {
      console.error('❌ 프로필 이미지 업로드 실패:', error)
      setImageUploadError('프로필 이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingImage(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 프로필 이미지 삭제 처리
  const handleImageDelete = async () => {
    try {
      setUploadingImage(true)
      setImageUploadError(null)

      const currentUser = selectedUserId ? users.find(u => u.id === selectedUserId) : user
      if (!currentUser) {
        setImageUploadError('사용자를 선택해주세요.')
        return
      }

      await deleteProfileImage({ id: currentUser.id, name: currentUser.name })
      setProfileImage('https://picsum.photos/200/200?grayscale&blur=1')
      
      console.log('✅ 프로필 이미지 삭제 완료')
    } catch (error) {
      console.error('❌ 프로필 이미지 삭제 실패:', error)
      setImageUploadError('프로필 이미지 삭제에 실패했습니다.')
    } finally {
      setUploadingImage(false)
    }
  }

  const onSubmit = async (data: IntroductionForm) => {
    try {
      setError(null)
      console.log('🚀 자기소개 제출 시작:', data)
      console.log('🏷️ 현재 키워드 배열:', keywords)
      
      // 사용자 선택 여부 확인
      if (!selectedUserId && !user?.id) {
        setError('참가자를 선택해주세요.')
        return
      }
      
      // 키워드 검증 (별도로 처리)
      if (keywords.length === 0) {
        setError('키워드를 최소 1개 이상 입력해주세요.')
        return
      }
      
      // 사용자 ID 결정 (선택된 사용자 또는 인증된 사용자 또는 임시 사용자)
      const userId = selectedUserId || user?.id || '00000000-0000-0000-0000-000000000001'
      console.log('👤 사용자 ID:', userId)
      console.log('🔍 선택된 사용자:', selectedUserId)
      console.log('🔐 인증된 사용자:', user?.id)
      
      // 키워드 포함한 데이터 준비
      const formData: IntroductionFormData = {
        name: data.name,
        school: data.school,
        major: data.major,
        birthDate: data.birthDate,
        location: data.location,
        mbti: data.mbti,
        keywords: keywords.join(', '),
        interests: data.interests,
        bucketlist: data.bucketlist,
        stressRelief: data.stressRelief,
        foundationActivity: data.foundationActivity,
      }
      
      console.log('📋 전송할 데이터:', formData)
      console.log('🏷️ 키워드 배열:', keywords)
      console.log('💾 자기소개 저장 시도:', { userId, formData })
      
      const result = await saveIntroduction(userId, formData)
      console.log('✅ 자기소개 저장 성공:', result)
      
      setIsSubmitted(true)
      console.log('🎉 자기소개 페이지 제출 완료!')
    } catch (error) {
      console.error('❌ 자기소개 저장 실패:', error)
      
      // Supabase 에러 타입에 따른 상세 메시지
      let errorMessage = '자기소개 저장에 실패했습니다. 다시 시도해주세요.'
      
      if (error && typeof error === 'object' && 'message' in error) {
        const supabaseError = error as any
        if (supabaseError.code === '23505') {
          errorMessage = '이미 자기소개가 등록되어 있습니다. 수정되었습니다.'
        } else if (supabaseError.code === '23503') {
          errorMessage = '선택한 참가자 정보를 찾을 수 없습니다. 다시 선택해주세요.'
        } else if (supabaseError.message?.includes('RLS')) {
          errorMessage = '권한이 없습니다. 관리자에게 문의해주세요.'
        }
      }
      
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">자기소개</h1>
              <p className="text-sm text-gray-600">나를 소개해주세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">자기소개 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : isSubmitted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">자기소개가 등록되었습니다!</CardTitle>
              <CardDescription>
                마이페이지에서 언제든지 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/profile">
                <Button className="w-full">
                  마이페이지로 이동
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-red-800">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>기본 정보</span>
                </CardTitle>
                <CardDescription>
                  참가자 목록에서 본인을 선택하면 학교와 전공이 자동으로 기재됩니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 프로필 사진 섹션 */}
                <div className="flex flex-col items-center space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="프로필 사진" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage || !selectedUserId}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>사진 업로드</span>
                    </Button>
                    
                    {profileImage && !profileImage.includes('picsum.photos') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleImageDelete}
                        disabled={uploadingImage || !selectedUserId}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                        <span>삭제</span>
                      </Button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {imageUploadError && (
                    <p className="text-sm text-red-600 text-center">{imageUploadError}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 text-center">
                    JPG, PNG 형식, 최대 5MB
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <Label htmlFor="name">이름</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="이름을 입력하거나 선택하세요"
                        className="w-full"
                        autoComplete="off"
                      />
                      {showDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                              <div
                                key={user.id}
                                onClick={() => handleUserSelect(user.id)}
                                className={`px-3 py-2 cursor-pointer border-b last:border-b-0 ${
                                  index === highlightedIndex 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className="font-medium">{user.name}</div>
                              </div>
                            ))
                          ) : searchQuery && (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              검색 결과가 없습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {!selectedUserId && searchQuery && (
                      <p className="text-sm text-red-600">참가자를 선택해주세요</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">학교</Label>
                    <Input
                      id="school"
                      {...register('school')}
                      placeholder="참가자를 선택하면 자동으로 기재됩니다"
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    {errors.school && (
                      <p className="text-sm text-red-600">{errors.school.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="major">전공</Label>
                    <Input
                      id="major"
                      {...register('major')}
                      placeholder="참가자를 선택하면 자동으로 기재됩니다"
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    {errors.major && (
                      <p className="text-sm text-red-600">{errors.major.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">생년월일</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      {...register('birthDate')}
                    />
                    {errors.birthDate && (
                      <p className="text-sm text-red-600">{errors.birthDate.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">사는 곳</Label>
                    <Input
                      id="location"
                      {...register('location')}
                      placeholder="시/도 등을 입력하세요"
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mbti">MBTI</Label>
                    <Select onValueChange={(value) => setValue('mbti', value)} defaultValue={watch('mbti')}>
                      <SelectTrigger>
                        <SelectValue placeholder="MBTI를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {mbtiOptions.map((mbti) => (
                          <SelectItem key={mbti} value={mbti}>
                            {mbti}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mbti && (
                      <p className="text-sm text-red-600">{errors.mbti.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 개인 소개 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>개인 소개</span>
                </CardTitle>
                <CardDescription>
                  나를 표현하는 내용들을 자유롭게 작성해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">나를 표현하는 키워드 (최대 3개)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="keywords"
                      {...register('keywords')}
                      placeholder="키워드를 입력하고 추가 버튼을 클릭하세요"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} disabled={keywords.length >= 3}>
                      추가
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(index)}>
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                  {keywords.length === 0 && (
                    <p className="text-sm text-gray-500">키워드를 최소 1개 이상 추가해주세요</p>
                  )}
                  {keywords.length > 0 && (
                    <p className="text-sm text-green-600">✓ {keywords.length}개의 키워드가 추가되었습니다</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">요즘 나의 관심사</Label>
                  <Textarea
                    id="interests"
                    {...register('interests')}
                    placeholder="요즘 관심 있는 분야나 활동을 자유롭게 작성해주세요"
                    rows={3}
                  />
                  {errors.interests && (
                    <p className="text-sm text-red-600">{errors.interests.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bucketlist">인생 버킷리스트</Label>
                  <Textarea
                    id="bucketlist"
                    {...register('bucketlist')}
                    placeholder="꼭 이루고 싶은 목표나 꿈을 작성해주세요"
                    rows={3}
                  />
                  {errors.bucketlist && (
                    <p className="text-sm text-red-600">{errors.bucketlist.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stressRelief">나만의 스트레스 해소법</Label>
                  <Textarea
                    id="stressRelief"
                    {...register('stressRelief')}
                    placeholder="스트레스를 해소하는 나만의 방법을 공유해주세요"
                    rows={3}
                  />
                  {errors.stressRelief && (
                    <p className="text-sm text-red-600">{errors.stressRelief.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundationActivity">장학재단에서 하고 싶은 활동</Label>
                  <Textarea
                    id="foundationActivity"
                    {...register('foundationActivity')}
                    placeholder="장학재단을 통해 하고 싶은 활동이나 기여하고 싶은 일을 작성해주세요"
                    rows={3}
                  />
                  {errors.foundationActivity && (
                    <p className="text-sm text-red-600">{errors.foundationActivity.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-4">
              <Link href="/">
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>저장 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>저장하기</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
} 