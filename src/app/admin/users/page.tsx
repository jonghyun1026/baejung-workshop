'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  School,
  GraduationCap,
  Phone,
  MapPin,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getUsers, deleteUser, createUser, type User, type CreateUserData } from '@/features/users/api'

export default function AdminUsersPage() {
  const { toast } = useToast()
  
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('all')
  const [generationFilter, setGenerationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // 사용자 추가 모달 상태
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    phone_number: '',
    school: '',
    major: '',
    generation: '',
    gender: '',
    status: 'active',
    ws_group: '미정',
    birth_date: '',
    program: ''
  })
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, schoolFilter, generationFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
      console.log('✅ 사용자 목록 로딩 완료:', data.length, '명')
    } catch (error: any) {
      console.error('❌ 사용자 목록 로딩 실패:', error)
      toast({
        title: "데이터 로딩 실패",
        description: "사용자 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // 검색어 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.includes(searchQuery)
      )
    }

    // 학교 필터
    if (schoolFilter !== 'all') {
      filtered = filtered.filter(user => user.school === schoolFilter)
    }

    // 기수 필터
    if (generationFilter !== 'all') {
      filtered = filtered.filter(user => user.generation === generationFilter)
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteUser(userId)
      await loadUsers()
      toast({
        title: "삭제 완료",
        description: "사용자가 성공적으로 삭제되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 사용자 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleAddUser = async () => {
    // 필수 필드 검증
    if (!newUser.name.trim()) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    if (!newUser.school.trim()) {
      toast({
        title: "입력 오류", 
        description: "학교를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    if (!newUser.major.trim()) {
      toast({
        title: "입력 오류",
        description: "전공을 입력해주세요.", 
        variant: "destructive"
      })
      return
    }

    if (!newUser.generation.trim()) {
      toast({
        title: "입력 오류",
        description: "기수를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    if (!newUser.gender.trim()) {
      toast({
        title: "입력 오류",
        description: "성별을 선택해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      setAddLoading(true)
      await createUser(newUser)
      await loadUsers()
      
      // 폼 초기화
      setNewUser({
        name: '',
        phone_number: '',
        school: '',
        major: '',
        generation: '',
        gender: '',
        status: 'active',
        ws_group: '미정',
        birth_date: '',
        program: ''
      })
      
      setShowAddModal(false)
      
      toast({
        title: "추가 완료",
        description: "새 사용자가 성공적으로 추가되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 사용자 추가 실패:', error)
      toast({
        title: "추가 실패",
        description: error.message || "사용자 추가 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setAddLoading(false)
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['이름', '학교', '전공', '기수', '전화번호', '상태', '조', '프로그램'].join(','),
      ...filteredUsers.map(user => [
        user.name || '',
        user.school || '',
        user.major || '',
        user.generation || '',
        user.phone_number || '',
        user.status || '',
        user.ws_group || '',
        user.program || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'pending': return 'outline'
      default: return 'secondary'
    }
  }

  const getUniqueValues = (key: keyof User) => {
    const values = users.map(user => user[key]).filter(Boolean)
    return [...new Set(values)].sort()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
          <p className="text-gray-600">총 {filteredUsers.length}명의 사용자</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                사용자 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>새 사용자 추가</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={newUser.phone_number}
                      onChange={(e) => setNewUser(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">학교 *</Label>
                    <Input
                      id="school"
                      value={newUser.school}
                      onChange={(e) => setNewUser(prev => ({ ...prev, school: e.target.value }))}
                      placeholder="서울대학교"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">전공 *</Label>
                    <Input
                      id="major"
                      value={newUser.major}
                      onChange={(e) => setNewUser(prev => ({ ...prev, major: e.target.value }))}
                      placeholder="컴퓨터공학과"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="generation">기수 *</Label>
                    <Select 
                      value={newUser.generation} 
                      onValueChange={(value) => setNewUser(prev => ({ ...prev, generation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="기수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(gen => (
                          <SelectItem key={gen} value={gen}>{gen}기</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별 *</Label>
                    <Select 
                      value={newUser.gender} 
                      onValueChange={(value) => setNewUser(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="성별 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="남성">남성</SelectItem>
                        <SelectItem value="여성">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">상태</Label>
                    <Select 
                      value={newUser.status} 
                      onValueChange={(value) => setNewUser(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                        <SelectItem value="pending">대기</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws_group">워크숍 조</Label>
                    <Input
                      id="ws_group"
                      value={newUser.ws_group}
                      onChange={(e) => setNewUser(prev => ({ ...prev, ws_group: e.target.value }))}
                      placeholder="A조"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">생년월일</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={newUser.birth_date}
                      onChange={(e) => setNewUser(prev => ({ ...prev, birth_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">프로그램</Label>
                    <Input
                      id="program"
                      value={newUser.program}
                      onChange={(e) => setNewUser(prev => ({ ...prev, program: e.target.value }))}
                      placeholder="학부과정"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  취소
                </Button>
                <Button 
                  onClick={handleAddUser}
                  disabled={addLoading}
                >
                  {addLoading ? '추가 중...' : '사용자 추가'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <School className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">학교 수</p>
                <p className="text-2xl font-bold">{getUniqueValues('school').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">기수</p>
                <p className="text-2xl font-bold">{getUniqueValues('generation').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="이름, 학교, 전공, 전화번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="학교 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 학교</SelectItem>
                {getUniqueValues('school').map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={generationFilter} onValueChange={setGenerationFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="기수" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기수</SelectItem>
                {getUniqueValues('generation').map(generation => (
                  <SelectItem key={generation} value={generation}>{generation}기</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>사용자 목록</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedUsers.length === filteredUsers.length ? '전체 해제' : '전체 선택'}
              </Button>
              {selectedUsers.length > 0 && (
                <Badge variant="secondary">
                  {selectedUsers.length}명 선택됨
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={`border rounded-lg p-4 transition-colors ${
                  selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium">{user.name}</h3>
                        <Badge variant={getStatusBadgeVariant(user.status || '')}>
                          {user.status || '미설정'}
                        </Badge>
                        {user.generation && (
                          <Badge variant="outline">{user.generation}기</Badge>
                        )}
                      </div>
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <School className="h-3 w-3 mr-1" />
                            <span>{user.school}</span>
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            <span>{user.major}</span>
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{user.phone_number}</span>
                            </div>
                          )}
                        </div>
                        {(user.ws_group || user.program) && (
                          <div className="flex items-center space-x-4">
                            {user.ws_group && (
                              <Badge variant="secondary" className="text-xs">
                                {user.ws_group}
                              </Badge>
                            )}
                            {user.program && (
                              <Badge variant="outline" className="text-xs">
                                {user.program}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">사용자가 없습니다</h3>
                <p className="text-gray-500">필터 조건을 변경하거나 새 사용자를 추가해보세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
