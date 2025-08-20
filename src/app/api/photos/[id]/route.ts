import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ message: '서버 환경변수 미설정' }, { status: 500 })
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const { id: photoId } = await params
    if (!photoId) {
      return NextResponse.json({ message: '사진 ID 필요' }, { status: 400 })
    }

    // 파일 경로 가져오기
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('photos')
      .select('image_url')
      .eq('id', photoId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ message: '사진을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (photo.image_url) {
      const fileName = photo.image_url.split('/').pop() || ''
      if (fileName) {
        await supabaseAdmin.storage.from('photos').remove([`photos/${fileName}`])
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || '서버 오류' }, { status: 500 })
  }
}


