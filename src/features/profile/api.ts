import { supabase } from '@/lib/supabase'

// 프로필 이미지 업로드
export async function uploadProfileImage(file: File, userInfo: { id?: string, name?: string }) {
  try {
    if (!userInfo) {
      throw new Error('사용자 정보가 필요합니다.')
    }

    console.log('📤 프로필 이미지 업로드 시작:', file.name, 'User Info:', userInfo)

    // Directory 기반 인증에서는 실제 users 테이블의 user_id를 찾아야 함
    let actualUserId = userInfo.id
    
    if (userInfo.name) {
      // 이름으로 실제 user_id 찾기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('name', userInfo.name)
        .single()
      
      if (userData && !userError) {
        actualUserId = userData.id
        console.log('✅ 실제 사용자 ID 찾음:', actualUserId)
      } else {
        console.log('⚠️ 사용자 ID를 찾지 못함, 제공된 ID 사용:', userInfo.id)
      }
    }

    if (!actualUserId) {
      throw new Error('유효한 사용자 ID를 찾을 수 없습니다.')
    }

    // 기존 프로필 이미지가 있다면 삭제
    await deleteExistingProfileImage(actualUserId)

    // 파일 이름 생성 (사용자 ID 기반)
    const fileExt = file.name.split('.').pop()
    const fileName = `profile_${Date.now()}.${fileExt}`
    const filePath = `profiles/${actualUserId}/${fileName}`
    
    // 1. Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file)

    if (uploadError) {
      console.error('❌ 프로필 이미지 업로드 실패:', uploadError)
      throw uploadError
    }

    // 2. 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    // 3. users 테이블에 프로필 이미지 URL 업데이트
    const { data: updateResult, error: dbError } = await supabase
      .from('users')
      .update({
        profile_image_url: urlData.publicUrl
      })
      .eq('id', actualUserId)
      .select()
      .single()

    if (dbError) {
      console.error('❌ DB 업데이트 실패:', dbError)
      // 업로드된 파일 삭제
      await supabase.storage.from('profiles').remove([filePath])
      throw dbError
    }

    // 업데이트된 사용자 정보 조회
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', actualUserId)
      .single()

    if (fetchError) {
      console.error('❌ 업데이트된 사용자 정보 조회 실패:', fetchError)
      throw fetchError
    }

    console.log('✅ 프로필 이미지 업로드 완료:', userData)
    return userData
  } catch (error) {
    console.error('❌ uploadProfileImage 오류:', error)
    throw error
  }
}

// 기존 프로필 이미지 삭제 (내부 함수)
async function deleteExistingProfileImage(userId: string) {
  try {
    // 1. 현재 프로필 이미지 URL 조회
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('profile_image_url')
      .eq('id', userId)
      .single()
    
    if (fetchError || !user?.profile_image_url) {
      return // 기존 이미지가 없거나 조회 실패
    }

    // 2. Storage에서 파일 삭제
    const urlParts = user.profile_image_url.split('/')
    const fileName = urlParts.pop()
    if (fileName && fileName.startsWith('profile_')) {
      const filePath = `profiles/${userId}/${fileName}`
      await supabase.storage.from('profiles').remove([filePath])
      console.log('🗑️ 기존 프로필 이미지 삭제 완료:', filePath)
    }
  } catch (error) {
    console.warn('⚠️ 기존 프로필 이미지 삭제 실패:', error)
    // 기존 이미지 삭제 실패는 치명적이지 않으므로 계속 진행
  }
}

// 프로필 이미지 삭제 (사용자 호출용)
export async function deleteProfileImage(userInfo: { id?: string, name?: string }) {
  try {
    console.log('🗑️ 프로필 이미지 삭제 시작:', userInfo)

    // Directory 기반 인증에서는 실제 users 테이블의 user_id를 찾아야 함
    let actualUserId = userInfo.id
    
    if (userInfo.name) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('name', userInfo.name)
        .single()
      
      if (userData && !userError) {
        actualUserId = userData.id
      }
    }

    if (!actualUserId) {
      throw new Error('유효한 사용자 ID를 찾을 수 없습니다.')
    }

    // 기존 프로필 이미지 삭제
    await deleteExistingProfileImage(actualUserId)

    // DB에서 프로필 이미지 URL 제거
    const { data: deleteResult, error: dbError } = await supabase
      .from('users')
      .update({
        profile_image_url: null
      })
      .eq('id', actualUserId)
      .select()
      .single()

    if (dbError) {
      console.error('❌ DB 업데이트 실패:', dbError)
      throw dbError
    }

    console.log('✅ 프로필 이미지 삭제 완료')
    return true
  } catch (error) {
    console.error('❌ deleteProfileImage 오류:', error)
    throw error
  }
}

// 사용자 프로필 정보 조회 (프로필 이미지 포함)
export async function getUserProfile(userInfo: { id?: string, name?: string }) {
  try {
    // Directory 기반 인증에서는 실제 users 테이블의 user_id를 찾아야 함
    let actualUserId = userInfo.id
    
    if (userInfo.name) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('name', userInfo.name)
        .single()
      
      if (userData && !userError) {
        return userData
      }
    }

    if (actualUserId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', actualUserId)
        .single()
      
      if (userError) {
        throw userError
      }
      
      return userData
    }

    throw new Error('사용자를 찾을 수 없습니다.')
  } catch (error) {
    console.error('❌ getUserProfile 오류:', error)
    throw error
  }
}

// 프로필 이미지 URL 가져오기 (플레이스홀더 포함)
export function getProfileImageUrl(user: any) {
  if (user?.profile_image_url && user.profile_image_url.includes('.')) {
    return user.profile_image_url
  }
  // 기본 프로필 이미지 (플레이스홀더)
  return 'https://picsum.photos/200/200?grayscale&blur=1'
}

