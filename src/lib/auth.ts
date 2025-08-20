import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

// 회원가입 (이메일 인증 포함)
export async function signUpWithEmail(email: string, password: string, additionalData?: {
  name?: string
}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: additionalData?.name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    // 사용자가 생성되었지만 이메일 확인이 필요한 경우
    if (data.user && !data.user.email_confirmed_at) {
      return {
        user: data.user,
        session: data.session,
        needsEmailConfirmation: true,
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.'
      }
    }

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: false
    }
  } catch (error) {
    console.error('회원가입 에러:', error)
    throw error
  }
}

// 로그인
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // 로그인 성공 후 users 테이블에 사용자 정보 동기화
    if (data.user) {
      await syncUserToDatabase(data.user)
    }

    return data
  } catch (error) {
    console.error('로그인 에러:', error)
    throw error
  }
}

// 로그아웃
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('로그아웃 에러:', error)
    throw error
  }
}

// 비밀번호 재설정 이메일 발송
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      throw error
    }

    return {
      message: '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.'
    }
  } catch (error) {
    console.error('비밀번호 재설정 에러:', error)
    throw error
  }
}

// 비밀번호 업데이트
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return {
      message: '비밀번호가 성공적으로 변경되었습니다.'
    }
  } catch (error) {
    console.error('비밀번호 업데이트 에러:', error)
    throw error
  }
}

// 이메일 재발송
export async function resendConfirmationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    return {
      message: '확인 이메일이 재발송되었습니다. 이메일을 확인해주세요.'
    }
  } catch (error) {
    console.error('이메일 재발송 에러:', error)
    throw error
  }
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('현재 사용자 정보 조회 에러:', error)
    return null
  }
}

// 현재 세션 정보 가져오기
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('현재 세션 정보 조회 에러:', error)
    return null
  }
}

// Auth 사용자 정보를 users 테이블에 동기화
export async function syncUserToDatabase(user: User) {
  try {
    // 기존 사용자 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    const userData = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      school: '미설정',
      major: '미설정',
      status: 'active',
      ws_group: '미정',
      gender: '미설정',
      generation: '1'
    }

    if (existingUser) {
      // 기존 사용자 업데이트
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name
        })
        .eq('id', user.id)

      if (error) throw error
    } else {
      // 새 사용자 생성
      const { error } = await supabase
        .from('users')
        .insert(userData)

      if (error) throw error
    }

    return userData
  } catch (error) {
    console.error('사용자 데이터베이스 동기화 에러:', error)
    throw error
  }
}

// Auth 상태 변경 리스너 설정
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
