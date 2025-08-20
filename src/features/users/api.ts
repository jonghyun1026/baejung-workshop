import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'
import bcrypt from 'bcryptjs'

export type User = Tables<'users'>

export interface UserFilters {
  school?: string
  major?: string
  generation?: string
  role?: string
  search?: string
}

export interface CreateUserData {
  name: string
  phone_number?: string
  school: string
  major: string
  generation: string
  gender: string
  role?: string
  status?: string
  ws_group?: string
  birth_date?: string
  program?: string
}

// 전화번호 정규화
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/-/g, '').trim()
}

// 사용자 목록 조회 (필터링 및 검색 지원)
export async function getUsers(filters: UserFilters = {}) {
  let query = supabase
    .from('users')
    .select('*')

  // 필터 적용
  if (filters.school) {
    query = query.eq('school', filters.school)
  }
  if (filters.major) {
    query = query.eq('major', filters.major)
  }
  if (filters.generation) {
    query = query.eq('generation', filters.generation)
  }
  if (filters.role) {
    query = query.eq('role', filters.role)
  }
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    throw new Error(`사용자 조회 실패: ${error.message}`)
  }

  return data
}

// 사용자 ID로 조회
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`사용자 조회 실패: ${error.message}`)
  }

  return data
}

// 이름으로 사용자 조회
export async function getUserByName(name: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name.trim())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // 사용자가 없음
    }
    throw new Error(`사용자 조회 실패: ${error.message}`)
  }

  return data
}

// 이름과 전화번호로 사용자 조회 (인증용)
export async function getUserByNameAndPhone(name: string, phone: string) {
  const normalizedPhone = normalizePhoneNumber(phone)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name.trim())
  
  if (error) {
    throw new Error(`사용자 조회 실패: ${error.message}`)
  }
  
  if (!data || data.length === 0) {
    return null
  }
  
  // 전화번호가 일치하는 사용자 찾기
  const matchedUser = data.find(user => {
    const userPhone = user.phone_number ? normalizePhoneNumber(user.phone_number) : ''
    return userPhone === normalizedPhone
  })
  
  return matchedUser || null
}

// 사용자 생성
export async function createUser(userData: CreateUserData) {
  // 필수 필드 추가
  const insertData = {
    ...userData,
    status: userData.status || 'active',
    ws_group: userData.ws_group || '미정'
  }

  const { data, error } = await supabase
    .from('users')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw new Error(`사용자 생성 실패: ${error.message}`)
  }

  return data
}

// 사용자 업데이트
export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`사용자 업데이트 실패: ${error.message}`)
  }

  return data
}

// 사용자 삭제
export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`사용자 삭제 실패: ${error.message}`)
  }

  return true
}

// 사용자 비밀번호 설정
export async function setUserPassword(userId: string, password: string) {
  console.log('🔐 setUserPassword 호출:', { userId, passwordLength: password.length, userIdType: typeof userId })
  
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('🔐 비밀번호 해시 완료')
  
  // userId가 실제 UUID인지 확인하고, 그렇지 않으면 name으로 검색
  let updateQuery = supabase.from('users').update({ password_hash: hashedPassword })
  
  // UUID 형식인지 확인 (36자리, 하이픈 포함)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
  
  if (isUUID) {
    console.log('🔐 UUID로 사용자 업데이트:', userId)
    updateQuery = updateQuery.eq('id', userId)
  } else {
    console.log('🔐 이름으로 사용자 업데이트:', userId)
    updateQuery = updateQuery.eq('name', userId)
  }
  
  console.log('🔐 업데이트 쿼리 실행 전')
  const { data, error } = await updateQuery.select()
  console.log('🔐 업데이트 쿼리 결과:', { data, error, dataLength: data?.length })
  
  if (error) {
    console.error('🔐 비밀번호 설정 실패:', error)
    throw new Error(`비밀번호 설정 실패: ${error.message}`)
  }
  
  if (!data || data.length === 0) {
    console.error('🔐 사용자 찾기 실패 - userId:', userId, 'isUUID:', isUUID)
    // 실제로 해당 사용자가 존재하는지 확인해보자
    const checkQuery = isUUID 
      ? supabase.from('users').select('*').eq('id', userId)
      : supabase.from('users').select('*').eq('name', userId)
    const { data: checkData } = await checkQuery
    console.log('🔐 사용자 존재 확인:', { checkData, checkDataLength: checkData?.length })
    throw new Error('사용자를 찾을 수 없거나 비밀번호 설정에 실패했습니다.')
  }
  
  console.log('🔐 비밀번호 설정 성공:', data[0]?.name)
  return true
}

// 사용자 비밀번호 확인
export async function verifyUserPassword(userId: string, password: string) {
  console.log('🔐 verifyUserPassword 호출:', { userId, passwordLength: password.length })
  
  // userId가 실제 UUID인지 확인하고, 그렇지 않으면 name으로 검색
  let selectQuery = supabase.from('users').select('password_hash')
  
  // UUID 형식인지 확인
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
  
  if (isUUID) {
    console.log('🔐 UUID로 사용자 조회:', userId)
    selectQuery = selectQuery.eq('id', userId)
  } else {
    console.log('🔐 이름으로 사용자 조회:', userId)
    selectQuery = selectQuery.eq('name', userId)
  }
  
  const { data, error } = await selectQuery
  
  if (error) {
    console.error('🔐 비밀번호 확인 실패:', error)
    throw new Error(`비밀번호 확인 실패: ${error.message}`)
  }
  
  if (!data || data.length === 0 || !data[0]?.password_hash) {
    console.log('🔐 비밀번호가 설정되지 않음')
    return false
  }
  
  const isValid = await bcrypt.compare(password, data[0].password_hash)
  console.log('🔐 비밀번호 확인 결과:', isValid)
  return isValid
}

// 사용자 검색 (이름 부분 일치)
export async function searchUsers(searchQuery: string, limit = 50) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, school, major, generation, phone_number, role')
    .ilike('name', `%${searchQuery}%`)
    .order('name', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`사용자 검색 실패: ${error.message}`)
  }

  return data || []
} 