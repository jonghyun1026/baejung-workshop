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
  Bus, 
  Search, 
  UserPlus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  getBusAssignments, 
  assignBus, 
  removeBusAssignment, 
  getBusStatistics,
  type BusAssignment, 
  type CreateBusAssignmentData 
} from '@/features/bus/api'

export default function AdminBusPage() {
  const { toast } = useToast()
  
  const [assignments, setAssignments] = useState<BusAssignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<BusAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [busFilter, setBusFilter] = useState('all')
  const [busType, setBusType] = useState<'departure' | 'return'>('departure')
  const [statistics, setStatistics] = useState({ 
    departure: { '1호차': 0, '2호차': 0, '3호차': 0, total: 0 },
    return: { '1호차': 0, '2호차': 0, '3호차': 0, total: 0 },
    total: 0
  })
  
  // 배정 추가/수정 모달 상태
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<BusAssignment | null>(null)
  const [assignmentForm, setAssignmentForm] = useState<CreateBusAssignmentData>({
    user_name: '',
    departure_bus: '',
    departure_time: '',
    departure_location: '',
    return_bus: '',
    return_time: '',
    arrival_location: '',
    notes: ''
  })
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, searchQuery, busFilter, busType])

  const loadData = async () => {
    try {
      setLoading(true)
      const [assignmentsData, statsData] = await Promise.all([
        getBusAssignments(),
        getBusStatistics()
      ])
      setAssignments(assignmentsData)
      setStatistics(statsData)
      console.log('✅ 버스 배정 데이터 로딩 완료:', assignmentsData.length, '건')
    } catch (error: any) {
      console.error('❌ 데이터 로딩 실패:', error)
      toast({
        title: "데이터 로딩 실패",
        description: "버스 배정 정보를 불러오는데 실패했습니다.",
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
        assignment.departure_bus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.return_bus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.departure_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.arrival_location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 버스 필터 (출발/귀가 버스 기준)
    if (busFilter !== 'all') {
      if (busType === 'departure') {
        filtered = filtered.filter(assignment => assignment.departure_bus === busFilter)
      } else {
        filtered = filtered.filter(assignment => assignment.return_bus === busFilter)
      }
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

    if (!assignmentForm.departure_bus && !assignmentForm.return_bus) {
      toast({
        title: "입력 오류", 
        description: "출발 버스 또는 귀가 버스 중 하나는 선택해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      setAssignLoading(true)
      await assignBus(assignmentForm)
      await loadData()
      
      // 폼 초기화
      resetForm()
      setShowAssignModal(false)
      
      const busInfo = []
      if (assignmentForm.departure_bus) busInfo.push(`출발: ${assignmentForm.departure_bus}`)
      if (assignmentForm.return_bus) busInfo.push(`귀가: ${assignmentForm.return_bus}`)
      
      toast({
        title: "배정 완료",
        description: `${assignmentForm.user_name}님이 ${busInfo.join(', ')}에 배정되었습니다.`
      })
    } catch (error: any) {
      console.error('❌ 버스 배정 실패:', error)
      toast({
        title: "배정 실패",
        description: error.message || "버스 배정 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRemoveAssignment = async (assignment: BusAssignment) => {
    if (!confirm(`${assignment.user_name}님의 버스 배정을 삭제하시겠습니까?`)) {
      return
    }

    try {
      await removeBusAssignment(assignment.user_name)
      await loadData()
      toast({
        title: "삭제 완료",
        description: "버스 배정이 삭제되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 버스 배정 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleEditAssignment = (assignment: BusAssignment) => {
    setEditingAssignment(assignment)
    setAssignmentForm({
      user_name: assignment.user_name,
      departure_bus: assignment.departure_bus || '',
      departure_time: assignment.departure_time ? assignment.departure_time.slice(0, 16) : '',
      departure_location: assignment.departure_location || '',
      return_bus: assignment.return_bus || '',
      return_time: assignment.return_time ? assignment.return_time.slice(0, 16) : '',
      arrival_location: assignment.arrival_location || '',
      notes: assignment.notes || ''
    })
    setShowAssignModal(true)
  }

  const resetForm = () => {
    setAssignmentForm({
      user_name: '',
      departure_bus: '',
      departure_time: '',
      departure_location: '',
      return_bus: '',
      return_time: '',
      arrival_location: '',
      notes: ''
    })
    setEditingAssignment(null)
  }

  const getBusVariant = (busNumber: string) => {
    switch (busNumber) {
      case '1호차': return 'default'
      case '2호차': return 'secondary'
      case '3호차': return 'outline'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">버스 배정 정보를 불러오는 중...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">단체버스 배정</h2>
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? '버스 배정 수정' : '새 버스 배정'}
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

              {/* 출발 정보 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-lg flex items-center">
                  <Bus className="h-4 w-4 mr-2" />
                  출발 버스 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_bus">출발 버스</Label>
                    <Select 
                      value={assignmentForm.departure_bus} 
                      onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, departure_bus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="버스 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">선택 안함</SelectItem>
                        <SelectItem value="1호차">1호차</SelectItem>
                        <SelectItem value="2호차">2호차</SelectItem>
                        <SelectItem value="3호차">3호차</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure_time">출발 시간</Label>
                    <Input
                      id="departure_time"
                      type="datetime-local"
                      value={assignmentForm.departure_time}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, departure_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure_location">탑승 장소</Label>
                  <Input
                    id="departure_location"
                    value={assignmentForm.departure_location}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, departure_location: e.target.value }))}
                    placeholder="강남역 1번 출구"
                  />
                </div>
              </div>

              {/* 귀가 정보 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-lg flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  귀가 버스 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="return_bus">귀가 버스</Label>
                    <Select 
                      value={assignmentForm.return_bus} 
                      onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, return_bus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="버스 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">선택 안함</SelectItem>
                        <SelectItem value="1호차">1호차</SelectItem>
                        <SelectItem value="2호차">2호차</SelectItem>
                        <SelectItem value="3호차">3호차</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return_time">귀가 시간</Label>
                    <Input
                      id="return_time"
                      type="datetime-local"
                      value={assignmentForm.return_time}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, return_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival_location">도착 장소</Label>
                  <Input
                    id="arrival_location"
                    value={assignmentForm.arrival_location}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, arrival_location: e.target.value }))}
                    placeholder="강남역 1번 출구"
                  />
                </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">출발 1호차</p>
                <p className="text-2xl font-bold">{statistics.departure['1호차']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">출발 2호차</p>
                <p className="text-2xl font-bold">{statistics.departure['2호차']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">출발 3호차</p>
                <p className="text-2xl font-bold">{statistics.departure['3호차']}</p>
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
                placeholder="참가자명, 버스번호, 탑승장소, 도착장소로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={busType} onValueChange={(value: 'departure' | 'return') => setBusType(value)}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departure">출발</SelectItem>
                <SelectItem value="return">귀가</SelectItem>
              </SelectContent>
            </Select>
            <Select value={busFilter} onValueChange={setBusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="버스 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 버스</SelectItem>
                <SelectItem value="1호차">1호차</SelectItem>
                <SelectItem value="2호차">2호차</SelectItem>
                <SelectItem value="3호차">3호차</SelectItem>
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* 출발 정보 */}
                        {(assignment.departure_bus || assignment.departure_time || assignment.departure_location) && (
                          <div className="space-y-1">
                            <div className="flex items-center text-blue-600">
                              <Bus className="h-3 w-3 mr-1" />
                              <span className="font-medium">출발</span>
                            </div>
                            {assignment.departure_bus && (
                              <div className="flex items-center">
                                <Badge variant={getBusVariant(assignment.departure_bus)} className="mr-2">
                                  {assignment.departure_bus}
                                </Badge>
                              </div>
                            )}
                            {assignment.departure_location && (
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{assignment.departure_location}</span>
                              </div>
                            )}
                            {assignment.departure_time && (
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{new Date(assignment.departure_time).toLocaleString('ko-KR')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 귀가 정보 */}
                        {(assignment.return_bus || assignment.return_time || assignment.arrival_location) && (
                          <div className="space-y-1">
                            <div className="flex items-center text-green-600">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              <span className="font-medium">귀가</span>
                            </div>
                            {assignment.return_bus && (
                              <div className="flex items-center">
                                <Badge variant={getBusVariant(assignment.return_bus)} className="mr-2">
                                  {assignment.return_bus}
                                </Badge>
                              </div>
                            )}
                            {assignment.arrival_location && (
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{assignment.arrival_location}</span>
                              </div>
                            )}
                            {assignment.return_time && (
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{new Date(assignment.return_time).toLocaleString('ko-KR')}</span>
                              </div>
                            )}
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
                <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">배정된 버스가 없습니다</h3>
                <p className="text-gray-500">새로운 버스 배정을 추가해보세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
