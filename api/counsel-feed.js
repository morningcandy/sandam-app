// 담임 개인 알림장(GitHub Pages)의 '상담 일정표'용 학부모 상담 예약 목록.
// 취소·보류 건은 빼고 날짜·시간·학생 번호·상담 방법·상태만 내보낸다(학생·학부모 이름, 연락처, 상담 내용 없음).
// Supabase 키는 Vercel 환경변수에 있는 값을 서버에서만 쓴다.
const PLANNER_ORIGINS = ['https://morningcandy.github.io', 'http://localhost:4599']

module.exports = async function handler(req, res) {
  const origin = req.headers.origin
  if (PLANNER_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return res.status(500).json({ error: '서버 설정이 없습니다.' })

  const query = '/rest/v1/reservations'
    + '?select=student_number,counseling_method,status,slots(date,title,start_time,end_time)'
    + '&status=neq.' + encodeURIComponent('예약 취소')
  const response = await fetch(url + query, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!response.ok) return res.status(502).json({ error: '예약을 불러오지 못했습니다.' })

  const rows = await response.json()
  const items = rows
    // 보류는 시간이 정해지지 않은 상태라 일정표에서 뺀다
    .filter((r) => r.slots && r.slots.date && r.status !== '보류')
    .map((r) => ({
      date: r.slots.date,
      start: String(r.slots.start_time || '').slice(0, 5),
      end: String(r.slots.end_time || '').slice(0, 5),
      tag: r.slots.title || '',
      number: Number(String(r.student_number || '').slice(-2)) || null,
      method: r.counseling_method || '',
      status: r.status,
    }))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ items })
}
