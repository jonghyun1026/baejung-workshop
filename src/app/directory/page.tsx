'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Users, Search, School, GraduationCap, Phone, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { getUsers, type User } from '@/features/users/api'
import UserIntroductionModal from '@/components/directory/UserIntroductionModal'

export default function DirectoryPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('all')
  const [majorFilter, setMajorFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const data = await getUsers()
        setUsers(data)
        setFilteredUsers(data)
      } catch (err) {
        console.error('사용자 데이터 로딩 실패:', err)
        setError('참석자 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // 필터링 로직
  useEffect(() => {
    let filtered = users

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.major.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 학교 필터링
    if (schoolFilter !== 'all') {
      filtered = filtered.filter(user => user.school === schoolFilter)
    }

    // 전공 필터링
    if (majorFilter !== 'all') {
      filtered = filtered.filter(user => user.major === majorFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, schoolFilter, majorFilter, users])

  // 고유한 학교 목록
  const schools = Array.from(new Set(users.map(user => user.school))).sort()
  
  // 고유한 전공 목록
  const majors = Array.from(new Set(users.map(user => user.major))).sort()

  // 자기소개 보기 함수
  const handleViewIntroduction = (user: User) => {
    setSelectedUserId(user.id)
    setSelectedUserName(user.name)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUserId(null)
    setSelectedUserName('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">참석자 디렉토리</h1>
                <p className="text-sm text-gray-600">워크숍 참가자들을 만나보세요</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">참석자 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">참석자 디렉토리</h1>
                <p className="text-sm text-gray-600">워크숍 참가자들을 만나보세요</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-red-600">오류 발생</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">참석자 디렉토리</h1>
              <p className="text-sm text-gray-600">워크숍 참가자들을 만나보세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>참가자 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{users.length}</div>
                <div className="text-sm text-gray-600">총 참가자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{schools.length}</div>
                <div className="text-sm text-gray-600">참여 대학</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{majors.length}</div>
                <div className="text-sm text-gray-600">다양한 전공</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>참가자 검색</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">이름/학교/전공 검색</label>
                <Input
                  placeholder="검색어를 입력하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">학교별 필터</label>
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="학교 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 학교</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">전공별 필터</label>
                <Select value={majorFilter} onValueChange={setMajorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전공 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 전공</SelectItem>
                    {majors.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {filteredUsers.length !== users.length && (
              <div className="mt-4 text-sm text-gray-600">
                {filteredUsers.length}명의 참가자가 검색되었습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 참가자 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <School className="h-3 w-3" />
                      <span>{user.school}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user.major}</span>
                </div>
                
                {user.phone_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.phone_number}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {user.program && (
                    <Badge variant="outline" className="text-xs">
                      {user.program}
                    </Badge>
                  )}
                  {user.ws_group && (
                    <Badge variant="secondary" className="text-xs">
                      {user.ws_group}
                    </Badge>
                  )}
                  {user.status && (
                    <Badge variant="default" className="text-xs">
                      {user.status}
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => handleViewIntroduction(user)}
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  자기소개 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}

        {/* 자기소개 모달 */}
        <UserIntroductionModal
          userId={selectedUserId}
          userName={selectedUserName}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  )
} 