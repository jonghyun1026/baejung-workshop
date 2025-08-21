'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Camera, Home, FileText, MessageCircle, Bus, Waves } from 'lucide-react'
import Link from 'next/link'
import AuthStatus from '@/components/auth/AuthStatus'
import NoticesSection from '@/components/NoticesSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-40 w-20 h-20 border-2 border-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 border-2 border-white/10 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-2 h-20 bg-white/20 transform rotate-45"></div>
        <div className="absolute bottom-1/3 right-10 w-2 h-20 bg-white/20 transform -rotate-45"></div>
      </div>

      {/* 헤더 */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <div className="text-white font-bold text-lg">OK</div>
              </div>
            <div>
                <h1 className="text-2xl font-bold text-white">
                OK배·정장학재단
              </h1>
                <p className="text-white/80">2025 하반기 워크숍</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <AuthStatus />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                2025.08.23 - 08.24
              </Badge>
              <div className="text-white/90 font-medium">서울대학교 시흥캠퍼스</div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 타이틀 섹션 */}
      <section className="relative z-10 py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            2025년 하반기 장학생 Workshop
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            장학생 여러분을 위한 다양한 프로그램이 준비되어 있습니다.<br />
            아래 메뉴에서 확인해 보세요.
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        {/* 메뉴 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 일정표 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/schedule">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">일정표</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  워크숍 전체 일정과 세션 정보를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-200 text-blue-700">2일간</Badge>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 자기소개 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/introduction">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">자기소개</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  나를 소개하고 다른 참가자들을 알아보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">등록 필요</Badge>
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-800">
                    작성 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 참석자 디렉토리 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/directory">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">참석자 디렉토리</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  다른 참가자들의 자기소개를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 사진첩 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/photos">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Camera className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">사진첩</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  워크숍 추억을 사진으로 공유하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 숙소배정내역 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/rooms">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">숙소배정내역</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  방 배정 현황과 동숙자 정보를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-green-200 text-green-700">배정 현황</Badge>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 단체버스 배정 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/bus">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bus className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">단체버스 배정</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  워크숍 단체버스 탑승 정보를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-orange-200 text-orange-700">1~3호차</Badge>
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 웨이브파크 프로그램 */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/wavepark">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Waves className="h-6 w-6 text-cyan-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">웨이브파크 프로그램</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  서핑과 미오코스타 프로그램 배정을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-cyan-200 text-cyan-700">서핑·미오코스타</Badge>
                  <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* FAQ */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/95 backdrop-blur-sm border-0 hover:scale-105">
            <Link href="/faq">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">FAQ</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  자주 묻는 질문과 답변을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-indigo-200 text-indigo-700">27개</Badge>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800">
                    보기 →
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* 공지사항 */}
        <NoticesSection />
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-2xl z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link href="/" className="flex flex-col items-center space-y-1 text-blue-600">
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">홈</span>
            </Link>
            <Link href="/photos" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors">
              <Camera className="h-5 w-5" />
              <span className="text-xs">사진첩</span>
            </Link>
            <Link href="/introduction" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors">
              <FileText className="h-5 w-5" />
              <span className="text-xs">자기소개</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors">
              <Users className="h-5 w-5" />
              <span className="text-xs">마이페이지</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
