import { supabase } from '@/lib/supabase'

export interface Notice {
  id: string
  title: string
  content: string
  author_id?: string
  is_important: boolean
  created_at: string
  updated_at: string
}

export interface CreateNoticeData {
  title: string
  content: string
  is_important: boolean
}

export interface UpdateNoticeData extends Partial<CreateNoticeData> {
  id: string
}

// 공지사항 목록 조회
export async function getNotices() {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`공지사항 조회 실패: ${error.message}`)
  }

  return data as Notice[]
}

// 공지사항 단일 조회
export async function getNotice(id: string) {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`공지사항 조회 실패: ${error.message}`)
  }

  return data as Notice
}

// 공지사항 생성 (RLS 우회)
export async function createNotice(noticeData: CreateNoticeData) {
  const { data, error } = await supabase
    .rpc('admin_create_notice', {
      p_title: noticeData.title,
      p_content: noticeData.content,
      p_is_important: noticeData.is_important
    })

  if (error) {
    throw new Error(`공지사항 생성 실패: ${error.message}`)
  }

  // 생성된 공지사항을 다시 조회해서 반환
  const { data: notice, error: fetchError } = await supabase
    .from('notices')
    .select('*')
    .eq('id', data)
    .single()

  if (fetchError) {
    throw new Error(`생성된 공지사항 조회 실패: ${fetchError.message}`)
  }

  return notice as Notice
}

// 공지사항 수정 (RLS 우회)
export async function updateNotice({ id, ...updateData }: UpdateNoticeData) {
  const { data, error } = await supabase
    .rpc('admin_update_notice', {
      p_id: id,
      p_title: updateData.title || '',
      p_content: updateData.content || '',
      p_is_important: updateData.is_important || false
    })

  if (error || !data) {
    throw new Error(`공지사항 수정 실패: ${error?.message || '수정 실패'}`)
  }

  // 수정된 공지사항을 다시 조회해서 반환
  const { data: notice, error: fetchError } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`수정된 공지사항 조회 실패: ${fetchError.message}`)
  }

  return notice as Notice
}

// 공지사항 삭제 (RLS 우회)
export async function deleteNotice(id: string) {
  const { data, error } = await supabase
    .rpc('admin_delete_notice', {
      p_id: id
    })

  if (error || !data) {
    throw new Error(`공지사항 삭제 실패: ${error?.message || '삭제 실패'}`)
  }

  return true
}

// 관리자 권한 확인
export async function checkAdminPermission(userId?: string) {
  // 사용자 ID가 없으면 로컬스토리지에서 확인
  if (!userId) {
    const userInfo = localStorage.getItem('directory_user')
    if (!userInfo) {
      throw new Error('로그인이 필요합니다')
    }
    
    const user = JSON.parse(userInfo)
    userId = user.id || user.name
  }

  // 사용자 권한 확인
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .or(`id.eq.${userId},name.eq.${userId}`)
    .single()

  if (error) {
    throw new Error(`권한 확인 실패: ${error.message}`)
  }

  if (data?.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다')
  }

  return true
}
