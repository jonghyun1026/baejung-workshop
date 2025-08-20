import { supabase } from '@/lib/supabase'

export interface Introduction {
  id: string
  user_id: string
  keywords: string
  interests: string
  bucketlist: string
  stress_relief: string
  foundation_activity: string
  name?: string
  school?: string
  major?: string
  birth_date?: string
  location?: string
  mbti?: string
  submitted_at: string
  updated_at: string
}

export interface IntroductionWithUser extends Introduction {
  user: {
    id: string
    name: string
    school: string
    major: string
    ws_group: string
    profile_image_url?: string
  }
}

export interface IntroductionFormData {
  name: string
  school: string
  major: string
  birthDate: string
  location: string
  mbti: string
  keywords: string
  interests: string
  bucketlist: string
  stressRelief: string
  foundationActivity: string
}

// 자기소개 저장
export async function saveIntroduction(userId: string, data: IntroductionFormData): Promise<Introduction> {
  try {
    console.log('📝 자기소개 저장 시작:', { userId, data })

    // 1. users 테이블 업데이트 (기본 정보)
    const { error: userError } = await supabase
      .from('users')
      .update({
        name: data.name,
        school: data.school,
        major: data.major
      })
      .eq('id', userId)

    if (userError) {
      console.error('❌ 사용자 정보 업데이트 에러:', userError)
      throw userError
    }

    // 2. introductions 테이블에 저장/업데이트
    const introData = {
      user_id: userId,
      keywords: data.keywords,
      interests: data.interests,
      bucketlist: data.bucketlist,
      stress_relief: data.stressRelief,
      foundation_activity: data.foundationActivity,
      name: data.name,
      school: data.school,
      major: data.major,
      birth_date: data.birthDate || null,
      location: data.location || null,
      mbti: data.mbti || null
    }

    // 기존 자기소개 확인
    const { data: existingIntro } = await supabase
      .from('introductions')
      .select('id')
      .eq('user_id', userId)
      .single()

    let result
    if (existingIntro) {
      // 업데이트
      const { data: updatedData, error } = await supabase
        .from('introductions')
        .update(introData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      result = updatedData
    } else {
      // 새로 생성
      const { data: newData, error } = await supabase
        .from('introductions')
        .insert(introData)
        .select()
        .single()

      if (error) throw error
      result = newData
    }

    console.log('✅ 자기소개 저장 성공')
    return result
  } catch (error) {
    console.error('💥 자기소개 저장 실패:', error)
    throw error
  }
}

// 특정 사용자의 자기소개 가져오기
export async function getUserIntroduction(userId: string): Promise<IntroductionWithUser | null> {
  try {
    console.log('📖 자기소개 조회:', userId)

    const { data, error } = await supabase
      .from('introductions')
      .select(`
        *,
        user:users!inner (
          id,
          name,
          school,
          major,
          ws_group,
          profile_image_url
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터가 없는 경우
        console.log('📭 자기소개 데이터 없음:', userId)
        return null
      }
      throw error
    }

    console.log('✅ 자기소개 조회 성공')
    return data as IntroductionWithUser
  } catch (error) {
    console.error('💥 자기소개 조회 실패:', error)
    throw error
  }
}

// 모든 자기소개 가져오기 (참가자 디렉토리용)
export async function getAllIntroductions(): Promise<IntroductionWithUser[]> {
  try {
    console.log('📚 모든 자기소개 조회 시작')

    const { data, error } = await supabase
      .from('introductions')
      .select(`
        *,
        user:users!inner (
          id,
          name,
          school,
          major,
          ws_group,
          profile_image_url
        )
      `)
      .order('submitted_at', { ascending: false })

    if (error) throw error

    console.log('✅ 모든 자기소개 조회 성공:', data?.length, '개')
    return data || []
  } catch (error) {
    console.error('💥 모든 자기소개 조회 실패:', error)
    throw error
  }
}

// 자기소개 삭제
export async function deleteIntroduction(userId: string): Promise<void> {
  try {
    console.log('🗑️ 자기소개 삭제:', userId)

    const { error } = await supabase
      .from('introductions')
      .delete()
      .eq('user_id', userId)

    if (error) throw error

    console.log('✅ 자기소개 삭제 성공')
  } catch (error) {
    console.error('💥 자기소개 삭제 실패:', error)
    throw error
  }
}
