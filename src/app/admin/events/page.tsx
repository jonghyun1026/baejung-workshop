'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  event_date: string
  order_index?: number
  created_at: string
  updated_at: string
}

export default function AdminEventsPage() {
  const { toast } = useToast()
  
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    event_date: '',
    order_index: ''
  })

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, dateFilter])

  const loadEvents = async () => {
    try {
      setLoading(true)
      // Supabase에서 이벤트 데이터 가져오기
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('이벤트 목록 로딩 실패:', error)
        throw error
      }
      
      const eventData = data || []
      setEvents(eventData)
      
      // 데이터 로딩 완료 후 즉시 필터링 적용
      setTimeout(() => {
        let filtered = eventData

        // 검색어 필터
        if (searchQuery.trim()) {
          filtered = filtered.filter(event => 
            event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        // 날짜 필터
        if (dateFilter !== 'all') {
          const today = new Date().toISOString().split('T')[0]
          
          if (dateFilter === 'today') {
            filtered = filtered.filter(event => event.event_date === today)
          } else if (dateFilter === 'tomorrow') {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            filtered = filtered.filter(event => event.event_date === tomorrow)
          } else if (dateFilter === 'upcoming') {
            filtered = filtered.filter(event => event.event_date >= today)
          }
        }

        setFilteredEvents(filtered)
      }, 50)
    } catch (error: any) {
      console.error('이벤트 목록 로딩 실패:', error)
      toast({
        title: "데이터 로딩 실패",
        description: "일정 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = useCallback(() => {
    let filtered = events

    // 검색어 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(event => event.event_date === today)
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        filtered = filtered.filter(event => event.event_date === tomorrow)
      } else if (dateFilter === 'upcoming') {
        filtered = filtered.filter(event => event.event_date >= today)
      }
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, dateFilter])

  const handleCreateEvent = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 이벤트 생성
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          start_time: formData.start_time,
          event_date: formData.event_date,
          description: formData.description || null,
          end_time: formData.end_time || null,
          location: formData.location || null,
          order_index: formData.order_index ? parseInt(formData.order_index) : null
        })
        .select()
        .single()

      if (error) throw error

      await loadEvents()
      setIsCreateModalOpen(false)
      resetForm()
      toast({
        title: "일정 생성 완료",
        description: "새 일정이 성공적으로 생성되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 일정 생성 실패:', error)
      toast({
        title: "생성 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return

    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          start_time: formData.start_time,
          event_date: formData.event_date,
          description: formData.description || null,
          end_time: formData.end_time || null,
          location: formData.location || null,
          order_index: formData.order_index ? parseInt(formData.order_index) : null
        })
        .eq('id', selectedEvent.id)
        .select()
        .single()

      if (error) throw error

      await loadEvents()
      setIsEditModalOpen(false)
      setSelectedEvent(null)
      resetForm()
      toast({
        title: "일정 수정 완료",
        description: "일정이 성공적으로 수정되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 일정 수정 실패:', error)
      toast({
        title: "수정 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm(`"${event.title}" 일정을 정말로 삭제하시겠습니까?`)) {
      return
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id)

      if (error) throw error

      await loadEvents()
      toast({
        title: "일정 삭제 완료",
        description: "일정이 성공적으로 삭제되었습니다."
      })
    } catch (error: any) {
      console.error('❌ 일정 삭제 실패:', error)
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const openEditModal = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: event.start_time,
      end_time: event.end_time || '',
      location: event.location || '',
      event_date: event.event_date,
      order_index: event.order_index?.toString() || ''
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      event_date: '',
      order_index: ''
    })
  }

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return '오늘'
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return '내일'
    }
    return format(date, 'M월 d일', { locale: ko })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">일정 목록을 불러오는 중...</p>

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
          <h2 className="text-2xl font-bold text-gray-900">일정 관리</h2>
          <p className="text-gray-600">총 {filteredEvents.length}개의 일정</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              일정 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
              <DialogDescription>
                워크숍 일정을 추가합니다. 모든 필수 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목 *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="일정 제목"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    순서
                  </label>
                  <Input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: e.target.value})}
                    placeholder="일정 순서 (선택사항)"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="일정 설명"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 시간 *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 시간
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    장소
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="장소"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    일정 날짜 *
                  </label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateEvent}>
                  일정 추가
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 일정</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">예정된 일정</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.event_date >= new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">오늘 일정</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => 
                    e.event_date === new Date().toISOString().split('T')[0]
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">이번 주</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => {
                    const eventDate = new Date(e.event_date)
                    const today = new Date()
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                    const weekEnd = new Date(weekStart)
                    weekEnd.setDate(weekStart.getDate() + 6)
                    return eventDate >= weekStart && eventDate <= weekEnd
                  }).length}
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
            <Search className="h-5 w-5 mr-2" />
            검색 및 필터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="제목, 설명, 장소로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-48"
            >
              <option value="all">모든 날짜</option>
              <option value="today">오늘</option>
              <option value="tomorrow">내일</option>
              <option value="upcoming">예정된 일정</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 일정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>일정 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <Badge variant="outline">
                        {getDateLabel(event.event_date)}
                      </Badge>
                      {event.order_index && (
                        <Badge variant="secondary" className="text-xs">#{event.order_index}</Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-gray-600 mb-2">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(event.start_time), 'M월 d일 HH:mm', { locale: ko })}
                            {event.end_time && ` - ${format(new Date(event.end_time), 'HH:mm', { locale: ko })}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.order_index && (
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>순서: {event.order_index}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditModal(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteEvent(event)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">일정이 없습니다</h3>
                <p className="text-gray-500">첫 번째 일정을 추가해보세요.</p>

              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
            <DialogDescription>
              선택한 일정의 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="일정 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  순서
                </label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({...formData, order_index: e.target.value})}
                  placeholder="일정 순서 (선택사항)"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="일정 설명"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작 시간 *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료 시간
                </label>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장소
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="장소"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  일정 날짜 *
                </label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleUpdateEvent}>
                수정 완료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
