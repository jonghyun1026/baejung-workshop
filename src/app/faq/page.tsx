'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ArrowLeft, Search, MessageCircle, AlertCircle } from 'lucide-react'
import { getFAQs, groupFAQsByCategory, type FAQ } from '@/features/faq/api'

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [groupedFaqs, setGroupedFaqs] = useState<Record<string, FAQ[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFaqs, setFilteredFaqs] = useState<Record<string, FAQ[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFAQs()
  }, [])

  useEffect(() => {
    filterFAQs()
  }, [searchTerm, groupedFaqs])

  const loadFAQs = async () => {
    try {
      setLoading(true)
      const data = await getFAQs()
      setFaqs(data)
      const grouped = groupFAQsByCategory(data)
      setGroupedFaqs(grouped)
      setError(null)
    } catch (err) {
      console.error('FAQ 로드 실패:', err)
      setError('FAQ 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filterFAQs = () => {
    if (!searchTerm.trim()) {
      setFilteredFaqs(groupedFaqs)
      return
    }

    const filtered: Record<string, FAQ[]> = {}
    const term = searchTerm.toLowerCase()

    Object.entries(groupedFaqs).forEach(([category, categoryFaqs]) => {
      const matchingFaqs = categoryFaqs.filter(faq => 
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term)
      )
      
      if (matchingFaqs.length > 0) {
        filtered[category] = matchingFaqs
      }
    })

    setFilteredFaqs(filtered)
  }

  const getTotalFAQCount = () => {
    return Object.values(filteredFaqs).reduce((total, categoryFaqs) => total + categoryFaqs.length, 0)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '객실 관련': 'bg-blue-100 text-blue-800 border-blue-200',
      '연수 관련': 'bg-green-100 text-green-800 border-green-200',
      '준비사항 관련': 'bg-purple-100 text-purple-800 border-purple-200',
      '프로그램 관련': 'bg-pink-100 text-pink-800 border-pink-200',
      '기타': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category] || colors['기타']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
                <p className="text-sm text-gray-600">자주 묻는 질문</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">FAQ를 불러오는 중...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
                <p className="text-sm text-gray-600">자주 묻는 질문</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>데이터 로드 오류</span>
              </CardTitle>
              <CardDescription className="text-red-700">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
              <p className="text-sm text-gray-600">자주 묻는 질문</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 검색 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span>질문 검색</span>
            </CardTitle>
            <CardDescription>
              궁금한 내용을 검색해보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="질문이나 답변 내용을 검색하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                "{searchTerm}"에 대한 검색 결과: <strong>{getTotalFAQCount()}개</strong>
              </p>
            )}
          </CardContent>
        </Card>

        {/* FAQ 목록 */}
        {Object.keys(filteredFaqs).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? '검색 결과가 없습니다' : 'FAQ가 없습니다'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? '다른 키워드로 검색해보세요' : '곧 업데이트될 예정입니다'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredFaqs).map(([category, categoryFaqs]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{category}</span>
                    </CardTitle>
                    <Badge variant="outline" className={getCategoryColor(category)}>
                      {categoryFaqs.length}개
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {categoryFaqs.map((faq, index) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border border-gray-200 rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-start space-x-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mt-0.5">
                              Q
                            </span>
                            <span className="font-medium text-gray-900">
                              {faq.question}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          <div className="flex items-start space-x-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 text-xs font-bold rounded-full mt-0.5">
                              A
                            </span>
                            <div className="text-gray-700 leading-relaxed">
                              {faq.answer ? (
                                <pre className="whitespace-pre-wrap font-sans">
                                  {faq.answer}
                                </pre>
                              ) : (
                                <span className="text-gray-500 italic">
                                  답변이 준비 중입니다.
                                </span>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 하단 안내 */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="text-center py-6">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">추가 문의사항이 있으신가요?</h3>
            <p className="text-blue-800 text-sm">
              카카오 채널 'OK장학재단 워크숍' 또는 장학재단 Staff에게 문의해 주세요.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

