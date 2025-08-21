'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Waves, 
  Search, 
  UserPlus,
  Edit,
  Trash2,
  Users,
  Clock,
  MapPin
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  getWaveparkAssignments, 
  assignWavepark, 
  removeWaveparkAssignment, 
  getWaveparkStatistics,
  type WaveparkAssignment, 
  type CreateWaveparkAssignmentData 
} from '@/features/wavepark/api'

export default function AdminWaveparkPage() {
  const { toast } = useToast()
  
  const [assignments, setAssignments] = useState<WaveparkAssignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<WaveparkAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [programFilter, setProgramFilter] = useState('all')
  const [statistics, setStatistics] = useState({ '서핑': 0, '미오코스타': 0, total: 0 })
  
  // 배정 추가/수정 모달 상태
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<WaveparkAssignment | null>(null)
  const [assignmentForm, setAssignmentForm] = useState<CreateWaveparkAssignmentData>({
    user_name: '',
    program_type: '',
    session_time: '',
    location: '',
    notes: ''
  })
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, searchQuery, programFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [assignmentsData, statsData] = await Promise.all([
        getWaveparkAssignments(),
        getWaveparkStatistics()
      ])
      setAssignments(assignmentsData)
      setStatistics(statsData)
      console.log('✅ 웨이브파크 배정 데이터 로딩 완료:', assignmentsData.length, '건')
    } catch (error: any) {
      console.error('❌ 데이터 로딩 실패:', error)
      toast({
        title: "데이터 로딩 실패",
        description: "웨이브파크 배정 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = assignments

    // 검색어 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(assignment => 
        assignment.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.program_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 프로그램 필터
    if (programFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.program_type === programFilter)
    }

    setFilteredAssignments(filtered)
  }

  const handleAssign = async () => {
    if (!assignmentForm.user_name.trim()) {
      toast({
        title: "입력 오류",
        description: "참가자명을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    if (!assignmentForm.program_type) {
      toast({
        title: "입력 오류", 
        description: "프로그램을 선택해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      setAssignLoading(true)
      await assignWavepark(assignmentForm)
      await loadData()
      
      // 폼 초기화
      resetForm()
      setShowAssignModal(false)
      
      toast({
        title: "배정 완료",
        description: `${assignmentForm.user_name}님이 ${assignmentForm.program_type}에 배정되었습니다.`
      })
    } catch (error: any) {
      console.error('❌ 웨이브파크 배정 실패:', error)
      toast({
        title: "배정 실패",
        description: error.message || "웨이브파크 배정 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRemoveAssignment = async (assignment: WaveparkAssignment) => {
    if (!confirm(`${assignment.user_name}님의 웨이브파크 배정을 삭제하시겠습니까?`)) {
      return
    }

    try {
      await removeWaveparkAssignment(assignment.user_name)
      await loadData()
      toast({
        title: "삭제 완료",
        description: "웨이브파크 배정이 삭제되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 웨이브파크 배정 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleEditAssignment = (assignment: WaveparkAssignment) => {
    setEditingAssignment(assignment)
    setAssignmentForm({
      user_name: assignment.user_name,
      program_type: assignment.program_type,
      session_time: assignment.session_time || '',
      location: assignment.location || '',
      notes: assignment.notes || ''
    })
    setShowAssignModal(true)
  }

  const resetForm = () => {
    setAssignmentForm({
      user_name: '',
      program_type: '',
      session_time: '',
      location: '',
      notes: ''
    })
    setEditingAssignment(null)
  }

  const getProgramVariant = (programType: string) => {
    switch (programType) {
      case '서핑': return 'default'
      case '미오코스타': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">웨이브파크 배정 정보를 불러오는 중...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">웨이브파크 프로그램 배정</h2>
          <p className="text-gray-600">총 {filteredAssignments.length}명 배정됨</p>
        </div>
        <Dialog open={showAssignModal} onOpenChange={(open) => {
          setShowAssignModal(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              배정 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? '웨이브파크 배정 수정' : '새 웨이브파크 배정'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user_name">참가자명 *</Label>
                <Input
                  id="user_name"
                  value={assignmentForm.user_name}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, user_name: e.target.value }))}
                  placeholder="홍길동"
                  disabled={!!editingAssignment}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program_type">프로그램 *</Label>
                <Select 
                  value={assignmentForm.program_type} 
                  onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, program_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="프로그램 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="서핑">서핑</SelectItem>
                    <SelectItem value="미오코스타">미오코스타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_time">세션 시간</Label>
                <Input
                  id="session_time"
                  type="text"
                  value={assignmentForm.session_time}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, session_time: e.target.value }))}
                  placeholder="오전 10:00-12:00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <Input
                  id="location"
                  value={assignmentForm.location}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="웨이브파크 A구역"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="추가 정보나 특이사항을 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAssignModal(false)
                  resetForm()
                }}
                disabled={assignLoading}
              >
                취소
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={assignLoading}
              >
                {assignLoading ? '처리 중...' : (editingAssignment ? '수정하기' : '배정하기')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Waves className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">서핑</p>
                <p className="text-2xl font-bold">{statistics['서핑']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Waves className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">미오코스타</p>
                <p className="text-2xl font-bold">{statistics['미오코스타']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 배정</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            검색 및 필터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="참가자명, 프로그램, 위치로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="프로그램 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 프로그램</SelectItem>
                <SelectItem value="서핑">서핑</SelectItem>
                <SelectItem value="미오코스타">미오코스타</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 배정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>배정 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium">{assignment.user_name}</h3>
                        <Badge variant={getProgramVariant(assignment.program_type)}>
                          {assignment.program_type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {assignment.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>위치: {assignment.location}</span>
                          </div>
                        )}
                                                 {assignment.session_time && (
                           <div className="flex items-center">
                             <Clock className="h-3 w-3 mr-1" />
                             <span>세션: {assignment.session_time}</span>
                           </div>
                         )}
                      </div>

                      {assignment.notes && (
                        <div className="text-gray-500 text-xs mt-2 p-2 bg-gray-50 rounded">
                          <strong>메모:</strong> {assignment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <Waves className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">배정된 프로그램이 없습니다</h3>
                <p className="text-gray-500">새로운 웨이브파크 배정을 추가해보세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
