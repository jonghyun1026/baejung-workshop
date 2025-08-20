'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  MapPin, 
  Phone, 
  GraduationCap,
  Building,
  UserCheck,
  AlertCircle,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { 
  getUserRoomAssignment, 
  getUserRoomAssignmentByName,
  getRoommates
} from '@/features/rooms/api'

export default function RoomsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [myRoomInfo, setMyRoomInfo] = useState<any>(null)
  const [roommates, setRoommates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoomData()
  }, [user])

  const loadRoomData = async () => {
    try {
      setLoading(true)

      if (user) {
        console.log('🏠 방 정보 조회 시작:', { userId: user.id, userName: user.name, userObj: user })
        
        // 디버깅: users 테이블에서 유사한 이름 찾기
        if (user.name) {
          try {
            const { data: allNames } = await supabase
              .from('users')
              .select('name')
              .ilike('name', `%${user.name}%`)
            console.log('🔍 users 테이블에서 유사한 이름들:', allNames)
          } catch (err) {
            console.log('⚠️ 유사 이름 조회 실패:', err)
          }
        }
        
        let myRoom = null
        
        // 이름으로 조회 (directory 기반 시스템에서는 이름이 primary key)
        if (user.name) {
          try {
            console.log('📍 이름으로 방 배정 조회:', user.name)
            myRoom = await getUserRoomAssignmentByName(user.name)
            console.log('✅ 이름으로 조회 성공:', myRoom)
          } catch (error: any) {
            console.log('❌ 이름으로 조회 실패:', error.message, 'Error Code:', error.code)
            if (error.code !== 'PGRST116') {
              console.error('이름으로 조회 중 오류:', error)
            }
          }
        } else {
          console.log('⚠️ 사용자 이름이 없음')
        }
        
        // 이름으로 찾지 못했고 user_id가 있으면 user_id로 시도
        if (!myRoom && user.id) {
          try {
            console.log('📍 user_id로 방 배정 조회:', user.id)
            myRoom = await getUserRoomAssignment(user.id)
            console.log('✅ user_id로 조회 성공:', myRoom)
          } catch (error: any) {
            console.log('❌ user_id로 조회 실패:', error.message)
            if (error.code !== 'PGRST116') {
              console.error('user_id로 조회 중 오류:', error)
            }
          }
        }
        
        setMyRoomInfo(myRoom)
        console.log('🏠 최종 내 방 정보:', myRoom)

        // 같은 방 동숙자 정보 조회
        if (myRoom?.room_id) {
          console.log('👥 동숙자 조회 시작, 방 ID:', myRoom.room_id)
          const mates = await getRoommates(myRoom.room_id)
          const filteredMates = Array.isArray(mates) ? mates.filter((mate: any) => 
            mate.user_id !== user.id && mate.user_name !== user.name
          ) : []
          setRoommates(filteredMates)
          console.log('👥 동숙자 조회 완료:', filteredMates)
        } else {
          console.log('❌ 방 배정 정보 없음')
          setRoommates([])
        }
      }

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



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">숙소 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">내 숙소 정보</h1>
              <p className="text-sm text-gray-600">배정된 방과 동숙자 정보를 확인하세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {!user ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
                <p className="text-gray-500 mb-4">방 정보를 확인하려면 로그인해주세요.</p>
                <Button asChild>
                  <Link href="/auth">로그인하기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : !myRoomInfo ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">방 배정 정보가 없습니다</h3>
                <p className="text-gray-500">아직 방이 배정되지 않았거나 배정 정보를 확인할 수 없습니다.</p>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">디버깅 정보:</p>
                  <p className="text-xs text-gray-600">로그인한 사용자: {user?.name || '이름 없음'}</p>
                  <p className="text-xs text-gray-600">사용자 ID: {user?.id || 'ID 없음'}</p>
                  <p className="text-xs text-gray-600">전화번호: {user?.phone_number || '전화번호 없음'}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    브라우저 개발자 도구 콘솔에서 상세한 로그를 확인하세요.
                  </p>
                </div>
                <p className="text-gray-400 text-sm mt-2">관리자에게 문의해주세요.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 내 방 정보 카드 */}
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <Home className="h-6 w-6 mr-3" />
                    내 방 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <span className="text-sm text-gray-600 block">방 번호</span>
                          <span className="text-lg font-bold text-blue-600">
                            {myRoomInfo.rooms?.room_number}
                          </span>
                          <span className="ml-2 text-gray-500">
                            ({myRoomInfo.rooms?.building_name})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Users className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <span className="text-sm text-gray-600 block">수용 인원</span>
                          <span className="text-lg font-semibold">{myRoomInfo.rooms?.capacity}명</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <Building className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <span className="text-sm text-gray-600 block">방 유형</span>
                          <span className="text-lg font-semibold">{myRoomInfo.rooms?.Type || '일반'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                        <UserCheck className="h-5 w-5 mr-3 text-orange-600" />
                        <div>
                          <span className="text-sm text-gray-600 block">현재 인원</span>
                          <span className="text-lg font-semibold">{roommates.length + 1}명</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {myRoomInfo.assigned_at && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">배정일:</span>
                        <span className="ml-2 text-sm font-medium">
                          {new Date(myRoomInfo.assigned_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 동숙자 정보 카드 */}
              <Card className="border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <Users className="h-6 w-6 mr-3" />
                    동숙자 정보 ({roommates.length}명)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {roommates.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">동숙자가 없습니다</h3>
                      <p className="text-gray-500">현재 혼자 사용하고 있는 방입니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {roommates.map((mate, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-gray-900">{mate.users?.name}</h4>
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                {mate.users?.generation}기
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                                <GraduationCap className="h-4 w-4 mr-3 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {mate.users?.school}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {mate.users?.major}
                                  </div>
                                </div>
                              </div>
                              
                              {mate.users?.phone_number && (
                                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                                  <Phone className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm text-gray-600">연락처</div>
                                    <a 
                                      href={`tel:${mate.users.phone_number}`}
                                      className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                                    >
                                      {mate.users.phone_number}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
