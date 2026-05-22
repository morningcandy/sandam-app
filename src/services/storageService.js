// API 클라이언트 - Express+SQLite 백엔드와 통신
// 로컬: /api (Vite proxy → localhost:3001)
// 프로덕션: VITE_API_URL/api (Railway 백엔드 URL)
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  // JSON 파싱 실패(HTML 등 비정상 응답) 시 에러로 처리
  const data = await res.json().catch(() => {
    throw new Error(`응답 파싱 오류 (${res.status})`)
  })
  if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`)
  return data
}

// ── 설정 ─────────────────────────────────────────────────────
export async function getConfig() {
  return apiFetch('/config')
}

export async function updateConfig(data) {
  return apiFetch('/config', { method: 'PUT', body: JSON.stringify(data) })
}

// ── 슬롯 ─────────────────────────────────────────────────────
export async function getAllSlots() {
  return apiFetch('/slots')
}

export async function getSlotsByDate(date) {
  return apiFetch(`/slots?date=${date}`)
}

export async function addSlot(slot) {
  return apiFetch('/slots', { method: 'POST', body: JSON.stringify(slot) })
}

export async function deleteSlot(slotId) {
  return apiFetch(`/slots/${slotId}`, { method: 'DELETE' })
}

// ── 예약 ─────────────────────────────────────────────────────
export async function getAllReservations() {
  return apiFetch('/reservations')
}

export async function getReservationsByDate(date) {
  return apiFetch(`/reservations?date=${date}`)
}

export async function getReservationsByStudentNumber(studentNumber) {
  return apiFetch(`/reservations?studentNumber=${encodeURIComponent(studentNumber)}`)
}

// 이름 + 학부모 전화번호 두 가지 모두 일치해야 조회됨
export async function getReservationsByStudentName(studentName, parentPhone) {
  return apiFetch(
    `/reservations?studentName=${encodeURIComponent(studentName)}&parentPhone=${encodeURIComponent(parentPhone)}`
  )
}

export async function addReservation(reservation) {
  return apiFetch('/reservations', { method: 'POST', body: JSON.stringify(reservation) })
}

export async function updateReservationStatus(reservationId, newStatus) {
  return apiFetch(`/reservations/${reservationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  })
}

export async function deleteReservation(reservationId) {
  return apiFetch(`/reservations/${reservationId}`, { method: 'DELETE' })
}
