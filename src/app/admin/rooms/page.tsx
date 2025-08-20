'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Home, 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  GraduationCap,
  Building,
  Bed,
  UserCheck,
  AlertCircle,
  Calendar,
  Settings
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { 
  getRoomsByBuilding, 
  searchUserRoom 
} from '@/features/rooms/api'

export default function AdminRoomsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [allRooms, setAllRooms] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all-rooms' | 'search'>('all-rooms')

  useEffect(() => {
    loadRoomData()
  }, [])

  const loadRoomData = async () => {
    try {
      setLoading(true)
      const roomsByBuilding = await getRoomsByBuilding()
      setAllRooms(roomsByBuilding)
    } catch (error: any) {
      console.error('방 정보 로딩 실패:', error)
      toast({
        title: "데이터 로딩 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearchLoading(true)
      const results = await searchUserRoom(searchQuery)
      setSearchResults(results)
      
      if (results.length === 0) {
        toast({
          title: "검색 결과 없음",
          description: "해당하는 사용자를 찾을 수 없습니다.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('검색 실패:', error)
      toast({
        title: "검색 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case '빈방': return 'bg-gray-100 text-gray-800'
      case '여유있음': return 'bg-green-100 text-green-800'
      case '만실': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  // 관리자 권한 확인
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">관리자 권한이 필요합니다</h3>
            <p className="text-gray-500">이 페이지는 관리자만 접근할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">숙소 현황을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 숙소 관리</h1>
        <p className="text-gray-600">전체 숙소 현황과 참가자 검색 기능</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('all-rooms')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all-rooms' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building className="h-4 w-4 mr-2 inline" />
          전체 현황
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'search' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="h-4 w-4 mr-2 inline" />
          참가자 검색
        </button>
      </div>

      {/* 전체 현황 탭 */}
      {activeTab === 'all-rooms' && (
        <div className="space-y-6">
          {Object.keys(allRooms).map((building) => (
            <Card key={building}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {building}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allRooms[building].map((room: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{room.room_number}</h4>
                        <Badge className={getRoomStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">수용인원:</span>
                          <span>{room.capacity}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">현재인원:</span>
                          <span>{room.current_occupancy}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">잔여인원:</span>
                          <span>{room.available_spots}명</span>
                        </div>
                        {room.room_type && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">방 유형:</span>
                            <span>{room.room_type}</span>
                          </div>
                        )}
                      </div>

                      {room.occupants && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-1">거주자:</p>
                          <p className="text-sm font-medium text-gray-700">
                            {room.occupants}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 참가자 검색 탭 */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* 검색 입력 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                참가자 검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="이름을 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>검색 결과 ({searchResults.length}명)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">{result.users?.name}</h4>
                          <Badge variant="outline">{result.users?.generation}기</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <GraduationCap className="h-3 w-3 mr-2 text-gray-500" />
                            <span>{result.users?.school} {result.users?.major}</span>
                          </div>
                          <div className="flex items-center">
                            <Home className="h-3 w-3 mr-2 text-gray-500" />
                            <span className="font-medium text-blue-600">
                              {result.rooms?.room_number} ({result.rooms?.building_name})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-2 text-gray-500" />
                            <span>{result.rooms?.Type || '일반'} · {result.rooms?.capacity}인실</span>
                          </div>
                          {result.users?.phone_number && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-2 text-gray-500" />
                              <a 
                                href={`tel:${result.users.phone_number}`}
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {result.users.phone_number}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}