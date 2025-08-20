import { supabase } from '@/lib/supabase'

// 프로필 이미지 업로드
export async function uploadProfileImage(file: File, userInfo: { id?: string, name?: string }) {
  try {
    if (!userInfo) {
      throw new Error('사용자 정보가 필요합니다.')
    }

    console.log('📤 프로필 이미지 업로드 시작:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userInfo: userInfo
    })

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기가 5MB를 초과합니다.')
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원되지 않는 파일 형식입니다. JPG, PNG, WebP 파일만 업로드 가능합니다.')
    }

    // Directory 기반 인증에서는 실제 users 테이블의 user_id를 찾아야 함
    let actualUserId = userInfo.id
    
    console.log('👤 사용자 정보 확인:', {
      providedId: userInfo.id,
      providedName: userInfo.name
    })
    
    if (userInfo.name) {
      // 이름으로 실제 user_id 찾기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('name', userInfo.name)
        .single()
      
      if (userData && !userError) {
        actualUserId = userData.id
        console.log('✅ 이름으로 실제 사용자 ID 찾음:', {
          name: userData.name,
          id: actualUserId,
          providedId: userInfo.id,
          idsMatch: actualUserId === userInfo.id
        })
      } else {
        console.log('⚠️ 사용자 ID를 찾지 못함:', userError, '제공된 ID 사용:', userInfo.id)
      }
    }

    if (!actualUserId) {
      throw new Error('유효한 사용자 ID를 찾을 수 없습니다.')
    }

    // 기존 프로필 이미지가 있다면 삭제
    try {
      await deleteExistingProfileImage(actualUserId)
    } catch (error) {
      console.warn('⚠️ 기존 이미지 삭제 중 오류 (계속 진행):', error)
    }

    // 파일 이름 생성 (사용자 ID 기반)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `profile_${actualUserId}_${Date.now()}.${fileExt}`
    const filePath = `${actualUserId}/${fileName}`
    
    console.log('📁 업로드 경로:', filePath)
    
    // 1. Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ 프로필 이미지 업로드 실패:', uploadError)
      throw new Error(`업로드 실패: ${uploadError.message}`)
    }

    console.log('✅ 스토리지 업로드 성공:', uploadData)

    // 2. 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    console.log('🔗 공개 URL 생성:', {
      filePath: filePath,
      generatedUrl: urlData.publicUrl,
      isValidUrl: urlData.publicUrl.includes('supabase.co'),
      pathCheck: urlData.publicUrl.includes('profiles/profiles') ? 'DUPLICATE_PATH_ERROR' : 'PATH_OK'
    })

    // URL에 중복 경로가 있으면 수정
    let finalUrl = urlData.publicUrl
    if (finalUrl.includes('profiles/profiles/')) {
      finalUrl = finalUrl.replace('profiles/profiles/', 'profiles/')
      console.log('🔧 중복 경로 수정:', finalUrl)
    }

    // 3. RPC 함수로 프로필 이미지 URL 업데이트 (RLS 우회)
    console.log('🔧 RPC 함수로 DB 업데이트 시도:', {
      userId: actualUserId,
      imageUrl: finalUrl
    })
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('update_user_profile_image', {
      p_user_id: actualUserId,
      p_profile_image_url: finalUrl
    })
    
    if (rpcError) {
      console.error('❌ RPC DB 업데이트 실패:', rpcError)
      // 업로드된 파일 삭제
      try {
        await supabase.storage.from('profiles').remove([filePath])
      } catch (cleanupError) {
        console.warn('⚠️ 업로드된 파일 정리 실패:', cleanupError)
      }
      throw new Error(`데이터베이스 업데이트 실패: ${rpcError.message}`)
    }
    
    console.log('✅ RPC로 DB 업데이트 성공:', rpcResult?.[0] || rpcResult)
    
    // RPC 함수에서 반환된 사용자 데이터 사용
    const userData = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult
    
    if (!userData) {
      console.error('❌ RPC 함수에서 사용자 데이터를 반환하지 않음')
      throw new Error('사용자 데이터를 가져올 수 없습니다.')
    }
    
    console.log('📊 RPC 업데이트 후 사용자 데이터 확인:', {
      name: userData.name,
      profileImageUrl: userData.profile_image_url,
      urlMatches: userData.profile_image_url === finalUrl,
      originalUrl: urlData.publicUrl,
      finalUrl: finalUrl
    })
    
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
    if (fileName && (fileName.startsWith('profile_') || fileName.includes('profile'))) {
      // URL에서 파일 경로 추출
      const pathMatch = user.profile_image_url.match(/\/profiles\/(.+)$/)
      if (pathMatch) {
        const filePath = pathMatch[1] // userId/filename 형태
        await supabase.storage.from('profiles').remove([filePath])
        console.log('🗑️ 기존 프로필 이미지 삭제 완료:', filePath)
      }
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

    // 기존 프로필 이미지 삭제 (스토리지에서)
    await deleteExistingProfileImage(actualUserId)

    // DB에서 프로필 이미지 URL 제거 - RPC 함수를 우선적으로 사용
    console.log('🔧 RPC 함수로 프로필 이미지 URL 삭제 시도:', actualUserId)
    
    const { data: deleteResult, error: rpcError } = await supabase.rpc('delete_profile_image_url', {
      p_user_id: actualUserId
    })
    
    if (rpcError) {
      console.error('❌ RPC 삭제 실패, 직접 DB 업데이트 시도:', rpcError)
      
      // RPC 실패 시 직접 업데이트 시도
      const { error: dbError } = await supabase
        .from('users')
        .update({
          profile_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', actualUserId)
      
      if (dbError) {
        console.error('❌ 직접 DB 업데이트도 실패:', dbError)
        throw new Error(`데이터베이스 업데이트 실패: ${dbError.message}`)
      } else {
        console.log('✅ 직접 DB 업데이트로 프로필 이미지 삭제 성공')
      }
    } else {
      console.log('✅ RPC로 프로필 이미지 삭제 성공:', deleteResult)
    }

    // 삭제 후 확인
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('profile_image_url')
      .eq('id', actualUserId)
      .single()
    
    if (verifyUser) {
      console.log('🔍 삭제 후 확인 - profile_image_url:', verifyUser.profile_image_url)
      if (verifyUser.profile_image_url !== null) {
        console.warn('⚠️ 프로필 이미지 URL이 완전히 삭제되지 않았습니다!')
      }
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
      console.log('👤 이름으로 사용자 프로필 조회:', userInfo.name)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('name', userInfo.name)
        .single()
      
      if (userData && !userError) {
        console.log('✅ 이름으로 사용자 조회 성공:', userData.name, '프로필 이미지:', userData.profile_image_url)
        return userData
      } else {
        console.log('⚠️ 이름으로 사용자 조회 실패:', userError)
      }
    }

    if (actualUserId) {
      console.log('👤 ID로 사용자 프로필 조회:', actualUserId)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', actualUserId)
        .single()
      
      if (userError) {
        console.error('❌ ID로 사용자 조회 실패:', userError)
        throw userError
      }
      
      console.log('✅ ID로 사용자 조회 성공:', userData.name, '프로필 이미지:', userData.profile_image_url)
      return userData
    }

    throw new Error('사용자를 찾을 수 없습니다.')
  } catch (error) {
    console.error('❌ getUserProfile 오류:', error)
    throw error
  }
}

// 프로필 이미지 URL이 실제로 접근 가능한지 확인
export async function checkImageExists(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.warn('🔍 이미지 존재 확인 실패:', imageUrl, error)
    return false
  }
}

// 사용자가 실제 프로필 이미지를 업로드했는지 확인 (개선된 버전)
export async function hasUploadedProfileImage(user: any): Promise<boolean> {
  console.log('🔍 hasUploadedProfileImage 확인:', {
    user: user?.name,
    profileImageUrl: user?.profile_image_url,
    hasUrl: !!user?.profile_image_url,
    urlType: typeof user?.profile_image_url,
    includesPicksum: user?.profile_image_url?.includes('picsum.photos'),
    includesSupabase: user?.profile_image_url?.includes('supabase'),
    includesProfiles: user?.profile_image_url?.includes('profiles/')
  })
  
  // profile_image_url이 없거나 플레이스홀더 이미지면 false
  if (!user?.profile_image_url || 
      typeof user.profile_image_url !== 'string' || 
      user.profile_image_url.trim() === '' ||
      user.profile_image_url.includes('picsum.photos')) {
    console.log('🔍 실제 업로드된 이미지 없음: 빈 URL이거나 플레이스홀더')
    return false
  }
  
  // Supabase storage 또는 profiles 경로가 포함된 URL인지 확인
  const isSupabaseUrl = user.profile_image_url.includes('supabase') || 
                       user.profile_image_url.includes('profiles/')
  
  if (!isSupabaseUrl) {
    console.log('🔍 Supabase URL이 아님')
    return false
  }
  
  // 실제로 이미지가 존재하는지 확인
  const imageExists = await checkImageExists(user.profile_image_url)
  console.log('🔍 실제 업로드된 이미지 존재:', imageExists)
  
  return imageExists
}

// 동기 버전 (기존 호환성 유지)
export function hasUploadedProfileImageSync(user: any): boolean {
  console.log('🔍 hasUploadedProfileImageSync 확인:', {
    user: user?.name,
    profileImageUrl: user?.profile_image_url,
    hasUrl: !!user?.profile_image_url,
    urlType: typeof user?.profile_image_url,
    includesPicksum: user?.profile_image_url?.includes('picsum.photos'),
    includesSupabase: user?.profile_image_url?.includes('supabase'),
    includesProfiles: user?.profile_image_url?.includes('profiles/')
  })
  
  // profile_image_url이 없거나 플레이스홀더 이미지면 false
  if (!user?.profile_image_url || 
      typeof user.profile_image_url !== 'string' || 
      user.profile_image_url.trim() === '' ||
      user.profile_image_url.includes('picsum.photos')) {
    console.log('🔍 실제 업로드된 이미지 없음: 빈 URL이거나 플레이스홀더')
    return false
  }
  
  // Supabase storage 또는 profiles 경로가 포함된 실제 업로드된 이미지인지 확인
  const hasRealImage = user.profile_image_url.includes('supabase') || 
                      user.profile_image_url.includes('profiles/')
  
  console.log('🔍 실제 업로드된 이미지 존재 (동기):', hasRealImage)
  return hasRealImage
}

// 프로필 이미지 URL 가져오기 (플레이스홀더 포함)
export function getProfileImageUrl(user: any) {
  console.log('🖼️ getProfileImageUrl 호출:', {
    user: user?.name,
    profileImageUrl: user?.profile_image_url,
    hasUrl: !!user?.profile_image_url,
    hasExtension: user?.profile_image_url?.includes?.('.'),
    urlType: typeof user?.profile_image_url,
    urlLength: user?.profile_image_url?.length,
    hasUploadedImage: hasUploadedProfileImage(user)
  })
  
  // 실제 업로드된 이미지가 있는지 확인 (동기 버전 사용)
  if (hasUploadedProfileImageSync(user)) {
    // 캐시 버스팅을 위해 timestamp 추가
    const urlWithTimestamp = `${user.profile_image_url}?t=${Date.now()}`
    console.log('✅ 업로드된 이미지 URL 반환:', urlWithTimestamp)
    return urlWithTimestamp
  }
  
  // 기본 프로필 이미지 (플레이스홀더)
  const defaultUrl = 'https://picsum.photos/200/200?grayscale&blur=1'
  console.log('⚠️ 기본 이미지 URL 사용 (업로드된 이미지 없음):', defaultUrl)
  return defaultUrl
}

