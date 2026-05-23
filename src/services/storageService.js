import { createClient } from '@supabase/supabase-js'
import { INITIAL_SLOTS } from '../data/initialSlots'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── 매핑 헬퍼 ────────────────────────────────────────────────
function mapSlot(s, activeCount = 0) {
  return {
    id: s.id,
    date: s.date,
    dayLabel: s.day_label,
    title: s.title,
    startTime: s.start_time,
    endTime: s.end_time,
    location: s.location,
    allowedMethods: Array.isArray(s.allowed_methods) ? s.allowed_methods : [],
    maxReservations: s.max_reservations,
    notice: s.notice ?? '',
    isSpecial: s.is_special ?? false,
    activeCount,
  }
}

function mapReservation(r) {
  const slot = r.slots ?? {}
  return {
    id: r.id,
    slotId: r.slot_id,
    studentNumber: r.student_number,
    studentName: r.student_name,
    parentName: r.parent_name,
    visitorRelation: r.visitor_relation ?? '',
    parentPhone: r.parent_phone,
    counselingContent: r.counseling_content,
    counselingMethod: r.counseling_method,
    status: r.status,
    createdAt: r.created_at,
    date: slot.date,
    dayLabel: slot.day_label,
    title: slot.title,
    startTime: slot.start_time,
    endTime: slot.end_time,
    location: slot.location,
  }
}

async function withActiveCounts(slots) {
  if (!slots.length) return slots
  const { data } = await supabase
    .from('reservations')
    .select('slot_id')
    .neq('status', '예약 취소')
  const countMap = {}
  ;(data ?? []).forEach(r => {
    countMap[r.slot_id] = (countMap[r.slot_id] || 0) + 1
  })
  return slots.map(s => mapSlot(s, countMap[s.id] || 0))
}

// ── 설정 ─────────────────────────────────────────────────────
export async function getConfig() {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 1)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return { openAt: data?.open_at ?? null }
}

export async function updateConfig({ openAt }) {
  const { error } = await supabase
    .from('config')
    .upsert({ id: 1, open_at: openAt ?? null })
  if (error) throw new Error(error.message)
  return { openAt: openAt ?? null }
}

// ── 슬롯 ─────────────────────────────────────────────────────
export async function getAllSlots() {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .order('date')
    .order('start_time')
  if (error) throw new Error(error.message)
  return withActiveCounts(data ?? [])
}

export async function getSlotsByDate(date) {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('date', date)
    .order('start_time')
  if (error) throw new Error(error.message)
  return withActiveCounts(data ?? [])
}

export async function addSlot(slot) {
  const { data, error } = await supabase
    .from('slots')
    .insert({
      id: slot.id,
      date: slot.date,
      day_label: slot.dayLabel,
      title: slot.title,
      start_time: slot.startTime,
      end_time: slot.endTime,
      location: slot.location,
      allowed_methods: slot.allowedMethods,
      max_reservations: slot.maxReservations,
      notice: slot.notice ?? '',
      is_special: slot.isSpecial ?? false,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapSlot(data)
}

export async function deleteSlot(slotId) {
  const { error } = await supabase.from('slots').delete().eq('id', slotId)
  if (error) throw new Error(error.message)
}

export async function seedSlots() {
  const rows = INITIAL_SLOTS.map(s => ({
    id: s.id,
    date: s.date,
    day_label: s.dayLabel,
    title: s.title,
    start_time: s.startTime,
    end_time: s.endTime,
    location: s.location,
    allowed_methods: s.allowedMethods,
    max_reservations: s.maxReservations,
    notice: s.notice ?? '',
    is_special: s.isSpecial ?? false,
  }))
  const { error } = await supabase.from('slots').upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
}

// ── 예약 ─────────────────────────────────────────────────────
export async function getAllReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, slots(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReservation)
}

export async function getReservationsByDate(date) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, slots(*)')
    .eq('slots.date', date)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).filter(r => r.slots?.date === date).map(mapReservation)
}

export async function getReservationsByStudentNumber(studentNumber) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, slots(*)')
    .eq('student_number', studentNumber)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReservation)
}

export async function getReservationsByStudentName(studentName, parentPhone) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, slots(*)')
    .eq('student_name', studentName)
    .eq('parent_phone', parentPhone)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReservation)
}

export async function getSlotAvailability(slotId) {
  const [{ data: slotData, error: slotErr }, { data: resData }] = await Promise.all([
    supabase.from('slots').select('max_reservations').eq('id', slotId).single(),
    supabase.from('reservations').select('id').eq('slot_id', slotId).neq('status', '예약 취소'),
  ])
  if (slotErr) throw new Error(slotErr.message)
  return {
    maxReservations: slotData.max_reservations,
    activeCount: resData?.length ?? 0,
  }
}

export async function addReservation(reservation) {
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      id: crypto.randomUUID(),
      slot_id: reservation.slotId,
      student_number: reservation.studentNumber,
      student_name: reservation.studentName,
      parent_name: reservation.parentName,
      visitor_relation: reservation.visitorRelation ?? '',
      parent_phone: reservation.parentPhone,
      counseling_content: reservation.counselingContent,
      counseling_method: reservation.counselingMethod,
      status: reservation.status ?? '예약 완료',
    })
    .select('*, slots(*)')
    .single()
  if (error) throw new Error(error.message)
  return mapReservation(data)
}

export async function updateReservationStatus(reservationId, newStatus) {
  const { error } = await supabase
    .from('reservations')
    .update({ status: newStatus })
    .eq('id', reservationId)
  if (error) throw new Error(error.message)
}

export async function deleteReservation(reservationId) {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId)
  if (error) throw new Error(error.message)
}
