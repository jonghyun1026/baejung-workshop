import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'

export type Photo = Tables<'photos'>

// 사진 목록 조회
export async function getPhotos() {
  try {
    console.log('1️⃣ photos 테이블에서 데이터 조회 시작...')
    
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        users!photos_user_id_fkey (
          name,
          school,
          major
        )
      `)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('❌ photos 데이터 조회 실패:', error)
      throw error
    }

    console.log('✅ photos 데이터 조회 성공:', data?.length || 0, '개')
    return data || []
  } catch (error: any) {
    console.error('❌ getPhotos 오류:', error)
    throw error
  }
}

// 파일 타입 및 크기 검증
export function validateMediaFile(file: File) {
  // 허용되는 파일 확장자
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'mov', 'avi', 'mkv', 'wmv', 'flv']
  // 동영상 확장자
  const videoExtensions = ['mp4', 'mp3', 'mov', 'avi', 'mkv', 'wmv', 'flv']
  // 이미지 확장자
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    throw new Error(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedExtensions.join(', ')}`)
  }
  
  // 동영상 파일의 경우 100MB 제한, 이미지의 경우 10MB 제한
  const maxSize = videoExtensions.includes(fileExt) ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB or 10MB
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    throw new Error(`파일 크기가 너무 큽니다. 최대 크기: ${maxSizeMB}MB`)
  }
  
  return {
    isVideo: videoExtensions.includes(fileExt),
    isImage: imageExtensions.includes(fileExt),
    extension: fileExt
  }
}

// 미디어 파일 업로드 (사진 + 동영상)
export async function uploadPhoto(file: File, description?: string, userInfo?: { id?: string, name?: string }) {
  try {
    if (!userInfo) {
      throw new Error('사용자 정보가 필요합니다.')
    }

    // 파일 검증
    const fileInfo = validateMediaFile(file)
    console.log('📤 미디어 파일 업로드 시작:', file.name, 'Type:', fileInfo.isVideo ? 'Video' : 'Image', 'User Info:', userInfo)

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

    // 파일 이름 생성 (중복 방지)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `photos/${actualUserId}/${fileName}`
    
    // 1. Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file)

    if (uploadError) {
      console.error('❌ 파일 업로드 실패:', uploadError)
      throw uploadError
    }

    // 2. 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath)

    // 3. photos 테이블에 메타데이터 저장
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: actualUserId,
        image_url: urlData.publicUrl,
        description: description || null,
        file_type: fileInfo.isVideo ? 'video' : 'image',
        file_extension: fileInfo.extension,
        file_size: file.size
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ DB 저장 실패:', dbError)
      // 업로드된 파일 삭제
      await supabase.storage.from('photos').remove([filePath])
      throw dbError
    }

    console.log('✅ 사진 업로드 완료:', photoData)
    return photoData
  } catch (error) {
    console.error('❌ uploadPhoto 오류:', error)
    throw error
  }
}

// 사진 삭제
export async function deletePhoto(photoId: string) {
  try {
    console.log('🗑️ 사진 삭제 시작:', photoId)

    // 1. 사진 정보 조회
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('image_url')
      .eq('id', photoId)
      .single()
    
    if (fetchError) {
      console.error('❌ 사진 정보 조회 실패:', fetchError)
      throw fetchError
    }

    // 2. Storage에서 파일 삭제
    if (photo.image_url) {
      // URL에서 파일 경로 추출 (photos/userId/filename 형태)
      const urlParts = photo.image_url.split('/')
      const fileName = urlParts.pop()
      const userId = urlParts[urlParts.length - 1]
      if (fileName && userId) {
        await supabase.storage.from('photos').remove([`photos/${userId}/${fileName}`])
      }
    }

    // 3. DB에서 사진 레코드 삭제
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('❌ 사진 삭제 실패:', deleteError)
      throw deleteError
    }

    console.log('✅ 사진 삭제 완료')
    return true
  } catch (error) {
    console.error('❌ deletePhoto 오류:', error)
    throw error
  }
}

// 좋아요 추가
export async function likePhoto(photoId: string, userInfo: { id?: string, name?: string }) {
  try {
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

    const { data, error } = await supabase
      .from('photo_likes')
      .insert({
        photo_id: photoId,
        user_id: actualUserId
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ likePhoto 오류:', error)
    throw error
  }
}

// 좋아요 취소
export async function unlikePhoto(photoId: string, userInfo: { id?: string, name?: string }) {
  try {
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
    
    const { error } = await supabase
      .from('photo_likes')
      .delete()
      .eq('photo_id', photoId)
      .eq('user_id', actualUserId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('❌ unlikePhoto 오류:', error)
    throw error
  }
}

// 사용자의 좋아요 상태 확인
export async function checkPhotoLike(photoId: string, userInfo: { id?: string, name?: string }) {
  try {
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
      return false
    }

    const { data, error } = await supabase
      .from('photo_likes')
      .select('id')
      .eq('photo_id', photoId)
      .eq('user_id', actualUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !!data
  } catch (error) {
    console.error('❌ checkPhotoLike 오류:', error)
    return false
  }
}

// 사용자의 좋아요한 사진들 조회
export async function getUserLikedPhotos(userInfo: { id?: string, name?: string }) {
  try {
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
      return new Set<string>()
    }

    const { data, error } = await supabase
      .from('photo_likes')
      .select('photo_id')
      .eq('user_id', actualUserId)

    if (error) throw error
    return new Set((data || []).map(like => like.photo_id))
  } catch (error) {
    console.error('❌ getUserLikedPhotos 오류:', error)
    return new Set<string>()
  }
}

// Storage 버킷 확인 및 생성
export async function checkStorageBucket() {
  try {
    // 버킷 존재 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ 버킷 목록 조회 실패:', listError)
      return false
    }

    const photoBucket = buckets?.find(bucket => bucket.name === 'photos')
    
    if (!photoBucket) {
      console.log('📦 photos 버킷이 없습니다. 생성이 필요합니다.')
      return false
    }

    console.log('✅ photos 버킷이 존재합니다.')
    return true
  } catch (error) {
    console.error('❌ checkStorageBucket 오류:', error)
    return false
  }
}

// 미디어 파일 URL 생성
export function getMediaUrl(media: any) {
  if (media.image_url && media.image_url.includes('.')) {
    return media.image_url
  }
  // 플레이스홀더 이미지
  return 'https://picsum.photos/400/400?grayscale'
}

// 미디어 파일 타입 확인
export function isVideoFile(media: any) {
  return media.file_type === 'video' || 
         ['mp4', 'mp3', 'mov', 'avi', 'mkv', 'wmv', 'flv'].includes(media.file_extension?.toLowerCase())
}

// 파일 크기를 읽기 쉬운 형식으로 변환
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 기존 호환성을 위한 함수
export function getPhotoUrl(photo: any) {
  return getMediaUrl(photo)
}
