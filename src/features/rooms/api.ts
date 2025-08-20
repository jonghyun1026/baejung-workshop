import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'

export type Room = Tables<'rooms'>
export type RoomAssignment = Tables<'room_assignments'>

// 사용자의 방 배정 정보 조회 (user_id로)
export async function getUserRoomAssignment(userId: string) {
  try {
    const { data, error } = await supabase
      .from('room_assignments')
      .select(`
        *,
        rooms:room_id (
          room_number,
          building_name,
          capacity,
          Type
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  } catch (error) {
    console.error('❌ getUserRoomAssignment 오류:', error)
    throw error
  }
}

// 사용자의 방 배정 정보 조회 (이름으로)
export async function getUserRoomAssignmentByName(userName: string) {
  try {
    console.log('🔍 getUserRoomAssignmentByName 호출:', userName)
    
    // RLS를 우회하는 Supabase 함수 사용
    const { data, error } = await supabase
      .rpc('get_user_room_by_name', { p_user_name: userName })

    console.log('📊 방 배정 조회 결과:', { data, error })

    if (error) {
      console.error('❌ 방 배정 조회 오류:', error)
      throw error
    }

    if (!data) {
      console.log('📭 방 배정 정보 없음')
      return null
    }

    console.log('✅ 방 배정 정보 조회 성공:', {
      userName: data.user_name,
      roomNumber: data.room_number,
      building: data.building_name
    })

    return data
  } catch (error) {
    console.error('❌ getUserRoomAssignmentByName 오류:', error)
    throw error
  }
}

// 특정 방의 모든 거주자 정보 조회
export async function getRoommates(roomId: string) {
  try {
    console.log('👥 getRoommates 호출:', roomId)
    
    // RLS를 우회하는 Supabase 함수 사용
    const { data, error } = await supabase
      .rpc('get_roommates_by_room_id', { p_room_id: roomId })

    console.log('👥 동숙자 조회 결과:', { data, error })

    if (error) {
      console.error('❌ 동숙자 조회 오류:', error)
      throw error
    }

    // JSON 배열을 일반 배열로 변환
    const roommates = data || []
    console.log('👥 동숙자 수:', roommates.length)
    
    return roommates
  } catch (error) {
    console.error('❌ getRoommates 오류:', error)
    throw error
  }
}

// 모든 방 배정 정보 조회 (관리자용)
export async function getAllRoomAssignments() {
  try {
    const { data, error } = await supabase
      .from('room_assignments')
      .select(`
        *,
        users:user_id (
          name,
          school,
          major,
          generation,
          phone_number,
          gender
        ),
        rooms:room_id (
          room_number,
          building_name,
          capacity,
          Type
        )
      `)
      .order('room_number')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('❌ getAllRoomAssignments 오류:', error)
    throw error
  }
}

// 방별 배정 현황 조회
export async function getRoomOccupancy() {
  try {
    const { data, error } = await supabase
      .from('room_assignment_summary')
      .select('*')
      .order('building_name, room_number')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('❌ getRoomOccupancy 오류:', error)
    throw error
  }
}

// 사용자 이름으로 방 정보 검색
export async function searchUserRoom(userName: string) {
  try {
    const { data, error } = await supabase
      .from('room_assignments')
      .select(`
        *,
        users:user_id (
          name,
          school,
          major,
          generation
        ),
        rooms:room_id (
          room_number,
          building_name,
          capacity,
          Type
        )
      `)
      .ilike('user_name', `%${userName}%`)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('❌ searchUserRoom 오류:', error)
    throw error
  }
}

// 건물별 방 배정 현황
export async function getRoomsByBuilding() {
  try {
    const { data, error } = await supabase
      .from('room_assignment_summary')
      .select('*')
      .order('building_name, room_number')

    if (error) throw error

    // 건물별로 그룹화
    const groupedByBuilding = (data || []).reduce((acc: any, room: any) => {
      const building = room.building_name || '기타'
      if (!acc[building]) {
        acc[building] = []
      }
      acc[building].push(room)
      return acc
    }, {})

    return groupedByBuilding
  } catch (error) {
    console.error('❌ getRoomsByBuilding 오류:', error)
    throw error
  }
}
