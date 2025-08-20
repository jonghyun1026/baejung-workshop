import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ message: '서버 환경변수 미설정' }, { status: 500 })
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const { photoId, userName } = (await req.json()) as {
      photoId?: string
      userName?: string
    }

    if (!photoId || !userName) {
      return NextResponse.json({ message: 'photoId, userName 필요' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('name', userName)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('photo_likes')
      .insert({ photo_id: photoId, user_id: userData.id })
      .select()
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || '서버 오류' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ message: '서버 환경변수 미설정' }, { status: 500 })
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get('photoId') || undefined
    const userName = searchParams.get('userName') || undefined

    if (!photoId || !userName) {
      return NextResponse.json({ message: 'photoId, userName 필요' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('name', userName)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('photo_likes')
      .delete()
      .eq('photo_id', photoId)
      .eq('user_id', userData.id)

    if (error) return NextResponse.json({ message: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || '서버 오류' }, { status: 500 })
  }
}


