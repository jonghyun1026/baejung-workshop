import { supabase } from '@/lib/supabase'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  updated_at: string
}

// FAQ 목록 가져오기
export async function getFAQs(): Promise<FAQ[]> {
  try {
    console.log('📋 FAQ 데이터 로드 시작...')
    
    const { data, error } = await supabase
      .from('faq')
      .select('id, question, answer, category, updated_at')
      .order('category', { ascending: true })
      .order('updated_at', { ascending: true })

    if (error) {
      console.error('❌ FAQ 로드 에러:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    console.log('✅ FAQ 로드 성공:', data?.length, '개')
    return data || []
  } catch (error) {
    console.error('💥 FAQ 로드 실패:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    throw error
  }
}

// 카테고리별로 FAQ 그룹화
export function groupFAQsByCategory(faqs: FAQ[]): Record<string, FAQ[]> {
  const grouped: Record<string, FAQ[]> = {}
  
  faqs.forEach(faq => {
    const category = faq.category || '기타'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(faq)
  })
  
  return grouped
}

