'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Bus, Search, MapPin, Clock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getBusAssignments, getBusStatistics, type BusAssignment } from '@/features/bus/api'

export default function BusPage() {
  const [assignments, setAssignments] = useState<BusAssignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<BusAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [busFilter, setBusFilter] = useState('all')
  const [busType, setBusType] = useState<'departure' | 'return'>('departure')
  const [statistics, setStatistics] = useState({ 
    departure: { '1호차': 0, '2호차': 0, '3호차': 0, total: 0 },
    return: { '1호차': 0, '2호차': 0, '3호차': 0, total: 0 },
    total: 0
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [assignmentsData, statsData] = await Promise.all([
          getBusAssignments(),
          getBusStatistics()
        ])
        setAssignments(assignmentsData)
        setFilteredAssignments(assignmentsData)
        setStatistics(statsData)
      } catch (err) {
        console.error('버스 배정 데이터 로딩 실패:', err)
        setError('버스 배정 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 필터링 로직
  useEffect(() => {
    let filtered = assignments

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.departure_bus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.return_bus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.departure_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.arrival_location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 버스 필터링 (출발/귀가 버스 기준)
    if (busFilter !== 'all') {
      if (busType === 'departure') {
        filtered = filtered.filter(assignment => assignment.departure_bus === busFilter)
      } else {
        filtered = filtered.filter(assignment => assignment.return_bus === busFilter)
      }
    }

    setFilteredAssignments(filtered)
  }, [searchTerm, busFilter, busType, assignments])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">버스 배정 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">데이터를 불러올 수 없습니다</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Link href="/">
              <Button 
                variant="outline" 
                className="bg-white/80 hover:bg-white mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">단체버스 배정</h1>
                <p className="text-gray-600">워크숍 단체버스 탑승 정보를 확인하세요</p>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Bus className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">출발 1호차</p>
                    <p className="text-2xl font-bold">{statistics.departure['1호차']}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Bus className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">출발 2호차</p>
                    <p className="text-2xl font-bold">{statistics.departure['2호차']}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Bus className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">출발 3호차</p>
                    <p className="text-2xl font-bold">{statistics.departure['3호차']}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">전체 탑승</p>
                    <p className="text-2xl font-bold">{statistics.total}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 및 필터 */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                검색 및 필터
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="참가자명, 버스번호, 탑승장소, 도착장소로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white"
                  />
                </div>
                <Select value={busType} onValueChange={(value: 'departure' | 'return') => setBusType(value)}>
                  <SelectTrigger className="w-full md:w-32 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departure">출발</SelectItem>
                    <SelectItem value="return">귀가</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={busFilter} onValueChange={setBusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-white">
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

          {/* 버스 배정 목록 */}
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => (
              <Card 
                key={assignment.id}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Bus className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.user_name}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* 출발 정보 */}
                        {(assignment.departure_bus || assignment.departure_time || assignment.departure_location) && (
                          <div className="space-y-2">
                            <div className="flex items-center text-blue-600 font-medium">
                              <Bus className="h-4 w-4 mr-2" />
                              <span>출발 정보</span>
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
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span>탑승: {assignment.departure_location}</span>
                              </div>
                            )}
                            {assignment.departure_time && (
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span>시간: {new Date(assignment.departure_time).toLocaleString('ko-KR')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 귀가 정보 */}
                        {(assignment.return_bus || assignment.return_time || assignment.arrival_location) && (
                          <div className="space-y-2">
                            <div className="flex items-center text-green-600 font-medium">
                              <ArrowRight className="h-4 w-4 mr-2" />
                              <span>귀가 정보</span>
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
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span>도착: {assignment.arrival_location}</span>
                              </div>
                            )}
                            {assignment.return_time && (
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span>시간: {new Date(assignment.return_time).toLocaleString('ko-KR')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {assignment.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <strong>메모:</strong> {assignment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 빈 상태 */}
          {filteredAssignments.length === 0 && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || busFilter !== 'all' ? '검색 결과가 없습니다' : '배정된 버스가 없습니다'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || busFilter !== 'all' 
                    ? '다른 검색어나 필터를 시도해보세요.' 
                    : '아직 버스 배정이 완료되지 않았습니다.'
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* 하단 여백 */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  )
}
