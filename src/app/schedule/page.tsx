'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calendar, MapPin, Clock, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getEvents, type Event } from '@/features/events/api'

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const data = await getEvents()
        setEvents(data)
      } catch (err) {
        console.error('이벤트 로딩 실패:', err)
        setError('일정을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // 날짜별로 이벤트 그룹화
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.event_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  const dates = Object.keys(eventsByDate).sort()

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), 'HH:mm', { locale: ko })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'M월 d일 (E)', { locale: ko })
    } catch {
      return dateString
    }
  }

  const getDayLabel = (dateString: string) => {
    const dayMap: Record<string, string> = {
      '2025-08-23': '첫째 날',
      '2025-08-24': '둘째 날'
    }
    return dayMap[dateString] || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">워크숍 일정표</h1>
                <p className="text-sm text-gray-600">2025년 8월 23일 - 24일</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">일정을 불러오는 중...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">워크숍 일정표</h1>
                <p className="text-sm text-gray-600">2025년 8월 23일 - 24일</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">워크숍 일정표</h1>
              <p className="text-sm text-gray-600">2025년 8월 23일 - 24일</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 일정 탭 - 2개만 표시 */}
        <Tabs defaultValue={dates[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {dates.slice(0, 2).map((date) => (
              <TabsTrigger key={date} value={date}>
                {formatDate(date)}
                <span className="ml-2 text-xs">({getDayLabel(date)})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {dates.slice(0, 2).map((date) => (
            <TabsContent key={date} value={date} className="mt-6">
              <div className="space-y-4">
                {eventsByDate[date]?.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* 안내사항 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>참고사항</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 일정은 현장 상황에 따라 변경될 수 있습니다.</p>
              <p>• 각 세션별 준비물이나 추가 안내사항은 별도 공지 예정입니다.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 