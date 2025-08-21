'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Waves, Search, MapPin, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { getWaveparkAssignments, getWaveparkStatistics, type WaveparkAssignment } from '@/features/wavepark/api'

export default function WaveparkPage() {
  const [assignments, setAssignments] = useState<WaveparkAssignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<WaveparkAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [programFilter, setProgramFilter] = useState('all')
  const [statistics, setStatistics] = useState({ '서핑': 0, '미오코스타': 0, total: 0 })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [assignmentsData, statsData] = await Promise.all([
          getWaveparkAssignments(),
          getWaveparkStatistics()
        ])
        setAssignments(assignmentsData)
        setFilteredAssignments(assignmentsData)
        setStatistics(statsData)
      } catch (err) {
        console.error('웨이브파크 배정 데이터 로딩 실패:', err)
        setError('웨이브파크 배정 정보를 불러오는데 실패했습니다.')
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
        assignment.program_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.session_time?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 프로그램 필터링
    if (programFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.program_type === programFilter)
    }

    setFilteredAssignments(filtered)
  }, [searchTerm, programFilter, assignments])

  const getProgramVariant = (programType: string) => {
    switch (programType) {
      case '서핑': return 'default'
      case '미오코스타': return 'secondary'
      default: return 'outline'
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
                <p className="text-gray-600">웨이브파크 배정 정보를 불러오는 중...</p>
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
                <Waves className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">웨이브파크 프로그램</h1>
                <p className="text-gray-600">워크숍 웨이브파크 프로그램 참여 정보를 확인하세요</p>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Waves className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">서핑</p>
                    <p className="text-2xl font-bold">{statistics['서핑']}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Waves className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">미오코스타</p>
                    <p className="text-2xl font-bold">{statistics['미오코스타']}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">전체 참여</p>
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
                    placeholder="참가자명, 프로그램, 위치, 세션시간으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white"
                  />
                </div>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-white">
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

          {/* 프로그램 배정 목록 */}
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => (
              <Card 
                key={assignment.id}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Waves className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.user_name}
                        </h3>
                        <Badge variant={getProgramVariant(assignment.program_type)}>
                          {assignment.program_type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {assignment.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span>위치: {assignment.location}</span>
                          </div>
                        )}
                        {assignment.session_time && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>세션: {assignment.session_time}</span>
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
                <Waves className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || programFilter !== 'all' ? '검색 결과가 없습니다' : '배정된 프로그램이 없습니다'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || programFilter !== 'all' 
                    ? '다른 검색어나 필터를 시도해보세요.' 
                    : '아직 웨이브파크 프로그램 배정이 완료되지 않았습니다.'
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
