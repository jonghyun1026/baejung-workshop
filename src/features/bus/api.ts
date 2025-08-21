import { supabase } from '@/lib/supabase'

export interface BusAssignment {
  id: string
  user_id: string
  user_name: string
  departure_bus?: string
  departure_time?: string
  departure_location?: string
  return_bus?: string
  return_time?: string
  arrival_location?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateBusAssignmentData {
  user_name: string
  departure_bus?: string
  departure_time?: string
  departure_location?: string
  return_bus?: string
  return_time?: string
  arrival_location?: string
  notes?: string
}

// 모든 버스 배정 조회
export async function getBusAssignments() {
  const { data, error } = await supabase
    .from('bus_assignments')
    .select('*')
    .order('departure_bus', { ascending: true })
    .order('user_name', { ascending: true })

  if (error) {
    throw new Error(`버스 배정 조회 실패: ${error.message}`)
  }

  return data as BusAssignment[]
}

// 특정 사용자의 버스 배정 조회
export async function getBusAssignmentByUser(userName: string) {
  const { data, error } = await supabase
    .from('bus_assignments')
    .select('*')
    .eq('user_name', userName)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // 배정이 없음
    }
    throw new Error(`버스 배정 조회 실패: ${error.message}`)
  }

  return data as BusAssignment
}

// 특정 출발 버스의 배정 목록 조회
export async function getBusAssignmentsByDeparture(busNumber: string) {
  const { data, error } = await supabase
    .from('bus_assignments')
    .select('*')
    .eq('departure_bus', busNumber)
    .order('user_name', { ascending: true })

  if (error) {
    throw new Error(`출발 버스 배정 조회 실패: ${error.message}`)
  }

  return data as BusAssignment[]
}

// 특정 귀가 버스의 배정 목록 조회
export async function getBusAssignmentsByReturn(busNumber: string) {
  const { data, error } = await supabase
    .from('bus_assignments')
    .select('*')
    .eq('return_bus', busNumber)
    .order('user_name', { ascending: true })

  if (error) {
    throw new Error(`귀가 버스 배정 조회 실패: ${error.message}`)
  }

  return data as BusAssignment[]
}

// 버스 배정 생성/수정
export async function assignBus(assignmentData: CreateBusAssignmentData) {
  console.log('🚌 버스 배정:', assignmentData)
  
  // 빈 문자열을 null로 변환
  const cleanData = {
    p_user_name: assignmentData.user_name,
    p_departure_bus: assignmentData.departure_bus?.trim() || null,
    p_departure_time: assignmentData.departure_time?.trim() || null,
    p_departure_location: assignmentData.departure_location?.trim() || null,
    p_return_bus: assignmentData.return_bus?.trim() || null,
    p_return_time: assignmentData.return_time?.trim() || null,
    p_arrival_location: assignmentData.arrival_location?.trim() || null,
    p_notes: assignmentData.notes?.trim() || null
  }
  
  console.log('🚌 정리된 데이터:', cleanData)
  
  const { data, error } = await supabase.rpc('admin_assign_bus', cleanData)

  if (error) {
    console.error('❌ 버스 배정 실패:', error)
    throw new Error(`버스 배정 실패: ${error.message}`)
  }

  console.log('✅ 버스 배정 성공:', data)
  return data as BusAssignment
}

// 버스 배정 삭제
export async function removeBusAssignment(userName: string) {
  console.log('🗑️ 버스 배정 삭제:', userName)
  
  const { data, error } = await supabase.rpc('admin_remove_bus_assignment', {
    p_user_name: userName
  })

  if (error) {
    console.error('❌ 버스 배정 삭제 실패:', error)
    throw new Error(`버스 배정 삭제 실패: ${error.message}`)
  }

  console.log('✅ 버스 배정 삭제 성공:', data)
  return data
}

// 버스별 통계
export async function getBusStatistics() {
  const { data, error } = await supabase
    .from('bus_assignments')
    .select('departure_bus, return_bus')

  if (error) {
    throw new Error(`버스 통계 조회 실패: ${error.message}`)
  }

  const departureStats = data.reduce((acc, assignment) => {
    if (assignment.departure_bus) {
      acc[assignment.departure_bus] = (acc[assignment.departure_bus] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const returnStats = data.reduce((acc, assignment) => {
    if (assignment.return_bus) {
      acc[assignment.return_bus] = (acc[assignment.return_bus] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return {
    departure: {
      '1호차': departureStats['1호차'] || 0,
      '2호차': departureStats['2호차'] || 0,
      '3호차': departureStats['3호차'] || 0,
      total: Object.values(departureStats).reduce((sum, count) => sum + count, 0)
    },
    return: {
      '1호차': returnStats['1호차'] || 0,
      '2호차': returnStats['2호차'] || 0,
      '3호차': returnStats['3호차'] || 0,
      total: Object.values(returnStats).reduce((sum, count) => sum + count, 0)
    },
    total: data.length
  }
}
