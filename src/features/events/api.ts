import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/database.types'

export type Event = Tables<'events'>

// 모든 이벤트 조회
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    throw error
  }

  return data
}

// 특정 날짜의 이벤트 조회
export async function getEventsByDate(date: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_date', date)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching events by date:', error)
    throw error
  }

  return data
}

// 새 이벤트 생성
export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    throw error
  }

  return data
}

// 이벤트 업데이트
export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    throw error
  }

  return data
}

// 이벤트 삭제
export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    throw error
  }
} 