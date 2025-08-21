import { supabase } from '@/lib/supabase'

export interface WaveparkAssignment {
  id: string
  user_id: string
  user_name: string
  program_type: string
  session_time?: string
  location?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateWaveparkAssignmentData {
  user_name: string
  program_type: string
  session_time?: string
  location?: string
  notes?: string
}

// 모든 웨이브파크 배정 조회
export async function getWaveparkAssignments() {
  const { data, error } = await supabase
    .from('wavepark_assignments')
    .select('*')
    .order('program_type', { ascending: true })
    .order('user_name', { ascending: true })

  if (error) {
    throw new Error(`웨이브파크 배정 조회 실패: ${error.message}`)
  }

  return data as WaveparkAssignment[]
}

// 특정 사용자의 웨이브파크 배정 조회
export async function getWaveparkAssignmentByUser(userName: string) {
  const { data, error } = await supabase
    .from('wavepark_assignments')
    .select('*')
    .eq('user_name', userName)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // 배정이 없음
    }
    throw new Error(`웨이브파크 배정 조회 실패: ${error.message}`)
  }

  return data as WaveparkAssignment
}

// 특정 프로그램의 배정 목록 조회
export async function getWaveparkAssignmentsByProgram(programType: string) {
  const { data, error } = await supabase
    .from('wavepark_assignments')
    .select('*')
    .eq('program_type', programType)
    .order('user_name', { ascending: true })

  if (error) {
    throw new Error(`웨이브파크 배정 조회 실패: ${error.message}`)
  }

  return data as WaveparkAssignment[]
}

// 웨이브파크 배정 생성/수정
export async function assignWavepark(assignmentData: CreateWaveparkAssignmentData) {
  console.log('🏄 웨이브파크 배정:', assignmentData)
  
  const { data, error } = await supabase.rpc('admin_assign_wavepark', {
    p_user_name: assignmentData.user_name,
    p_program_type: assignmentData.program_type,
    p_session_time: assignmentData.session_time || null,
    p_location: assignmentData.location || null,
    p_notes: assignmentData.notes || null
  })

  if (error) {
    console.error('❌ 웨이브파크 배정 실패:', error)
    throw new Error(`웨이브파크 배정 실패: ${error.message}`)
  }

  console.log('✅ 웨이브파크 배정 성공:', data)
  return data as WaveparkAssignment
}

// 웨이브파크 배정 삭제
export async function removeWaveparkAssignment(userName: string) {
  console.log('🗑️ 웨이브파크 배정 삭제:', userName)
  
  const { data, error } = await supabase.rpc('admin_remove_wavepark_assignment', {
    p_user_name: userName
  })

  if (error) {
    console.error('❌ 웨이브파크 배정 삭제 실패:', error)
    throw new Error(`웨이브파크 배정 삭제 실패: ${error.message}`)
  }

  console.log('✅ 웨이브파크 배정 삭제 성공:', data)
  return data
}

// 프로그램별 통계
export async function getWaveparkStatistics() {
  const { data, error } = await supabase
    .from('wavepark_assignments')
    .select('program_type')

  if (error) {
    throw new Error(`웨이브파크 통계 조회 실패: ${error.message}`)
  }

  const stats = data.reduce((acc, assignment) => {
    acc[assignment.program_type] = (acc[assignment.program_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    '서핑': stats['서핑'] || 0,
    '미오코스타': stats['미오코스타'] || 0,
    total: data.length
  }
}
