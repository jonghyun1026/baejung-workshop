import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { message: '서버 환경변수가 설정되지 않았습니다. SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL 확인 필요' },
        { status: 500 }
      )
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.json()
    const { userName, imageUrl, description } = body as {
      userName?: string
      imageUrl?: string
      description?: string | null
    }

    if (!userName || !imageUrl) {
      return NextResponse.json({ message: 'userName 과 imageUrl 이 필요합니다.' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('name', userName)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { data: photoData, error: dbError } = await supabaseAdmin
      .from('photos')
      .insert({
        user_id: userData.id,
        image_url: imageUrl,
        description: description ?? null,
        likes_count: 0,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 500 })
    }

    return NextResponse.json(photoData, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || '서버 오류' }, { status: 500 })
  }
}


