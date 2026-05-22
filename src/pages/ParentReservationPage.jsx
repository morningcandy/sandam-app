import React, { useState, useEffect, useCallback } from 'react'
import SlotCard from '../components/SlotCard'
import ReservationForm from '../components/ReservationForm'
import { getSlotsByDate, getReservationsByStudentName, getConfig } from '../services/storageService'
import { HOLIDAY_MAP, SPECIAL_DAY_NOTICE, AVAILABLE_DATES } from '../data/initialSlots'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const JUNE_FIRST_DOW = new Date(2026, 5, 1).getDay()

const STATUS_STYLE = {
  '예약 완료': { background: '#dbeafe', color: '#1e40af' },
  '상담 완료': { background: '#d1fae5', color: '#065f46' },
  '예약 취소': { background: '#fee2e2', color: '#991b1b' },
}

export default function ParentReservationPage() {
  const [tab, setTab] = useState('calendar') // 'calendar' | 'myreservation'
  const [selectedDate, setSelectedDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [reservingSlot, setReservingSlot] = useState(null)
  const [openAt, setOpenAt] = useState(null)   // null = 제한 없음
  const [configLoaded, setConfigLoaded] = useState(false)

  // 내 예약 조회
  const [lookupName, setLookupName] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [myReservations, setMyReservations] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  // 오픈 시간 조회 (최초 1회)
  useEffect(() => {
    getConfig().then(cfg => {
      setOpenAt(cfg.openAt || null)
      setConfigLoaded(true)
    }).catch(() => setConfigLoaded(true))
  }, [])

  const loadSlots = useCallback(async (date) => {
    if (!date) return
    setSlotsLoading(true)
    try {
      const data = await getSlotsByDate(date)
      setSlots(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSlots(selectedDate)
  }, [selectedDate, loadSlots])

  const handleReserveSuccess = () => loadSlots(selectedDate)
  const handleCloseForm = () => { setReservingSlot(null); loadSlots(selectedDate) }

  const handleLookup = async () => {
    if (!lookupName.trim() || !lookupPhone.trim()) return
    setLookupLoading(true)
    setLookupError('')
    setMyReservations(null)
    try {
      const data = await getReservationsByStudentName(lookupName.trim(), lookupPhone.trim())
      setMyReservations(Array.isArray(data) ? data : [])
    } catch (e) {
      setLookupError(e.message)
    } finally {
      setLookupLoading(false)
    }
  }

  const isReservationOpen = !openAt || new Date() >= new Date(openAt)
  // Supabase에서 오는 UTC ISO 문자열을 KST(+9)로 변환해서 표시
  const fmtOpenAt = (dt) => {
    if (!dt) return ''
    const d = new Date(dt)
    const kst = new Date(d.getTime() + 9 * 3600 * 1000)
    const month = kst.getUTCMonth() + 1
    const day = kst.getUTCDate()
    const h = kst.getUTCHours()
    const m = String(kst.getUTCMinutes()).padStart(2, '0')
    const ampm = h < 12 ? '오전' : '오후'
    const h12 = h % 12 || 12
    return `${month}월 ${day}일 ${ampm} ${h12}:${m}`
  }

  const getDayType = (dateStr) => {
    if (HOLIDAY_MAP[dateStr]) return 'holiday'
    if (dateStr === '2026-06-04') return 'special'
    if (AVAILABLE_DATES.includes(dateStr)) return 'available'
    return 'none'
  }

  const fmtDateKo = (d) => d ? d.replace('2026-', '').replace('-', '월 ') + '일' : ''

  const cellStyle = (dateStr, isSelected) => {
    const type = getDayType(dateStr)
    const base = {
      borderRadius: 10, padding: '8px 4px', textAlign: 'center',
      minHeight: 62, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 4, cursor: 'default', border: '1px solid transparent', transition: 'all 0.15s',
    }
    if (type === 'holiday') return { ...base, background: '#fef2f2', border: '1px solid #fecaca' }
    if (type === 'special') return { ...base, cursor: 'pointer', background: isSelected ? '#ede9fe' : '#f5f3ff', border: isSelected ? '2px solid #7c3aed' : '1px solid #c4b5fd' }
    if (type === 'available') return { ...base, cursor: 'pointer', background: isSelected ? '#dbeafe' : '#eff6ff', border: isSelected ? '2px solid #2563eb' : '1px solid #93c5fd' }
    return { ...base, background: '#f9fafb', border: '1px solid #f3f4f6' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '18px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>학부모 상담 예약실</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>날짜를 선택하고 원하는 시간에 예약해 주세요.</p>
      </header>

      {/* 담임 소개 배너 */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', borderBottom: '1px solid #e5e7eb', padding: '14px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            👩‍🏫
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>2-3 담임 이서연 선생님</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: '#dbeafe', color: '#1e40af', fontWeight: 600 }}>대면 · 전화 상담</span>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#4b5563' }}>
              <span>📞 010-9551-0903</span>
              <span>📅 상담 신청: 5월 27일 오후 1시 오픈</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: 0 }}>
        {[
          { key: 'calendar', label: '예약하기' },
          { key: 'myreservation', label: '내 예약 확인' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              border: 'none', background: 'none',
              color: tab === t.key ? '#2563eb' : '#9ca3af',
              borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── 예약하기 탭 ── */}
        {tab === 'calendar' && !configLoaded && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
            <p style={{ fontSize: 14 }}>불러오는 중...</p>
          </div>
        )}

        {tab === 'calendar' && configLoaded && !isReservationOpen && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              아직 예약 신청 기간이 아닙니다
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, lineHeight: 1.7 }}>
              상담 예약 신청은<br />
              <strong style={{ color: '#2563eb', fontSize: 16 }}>{fmtOpenAt(openAt)}</strong>부터 가능합니다.
            </p>
            <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#1d4ed8' }}>
              오픈 시간 이후 이 페이지를 새로고침 해주세요.
            </div>
          </div>
        )}

        {tab === 'calendar' && configLoaded && isReservationOpen && (
          <>
            {/* 캘린더 */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>2026년 6월</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                {DOW.map((d, i) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: i === 0 ? '#dc2626' : i === 6 ? '#2563eb' : '#9ca3af', padding: '4px 0' }}>
                    {d}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {Array.from({ length: JUNE_FIRST_DOW }).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1
                  const dateStr = `2026-06-${String(day).padStart(2, '0')}`
                  const dow = (JUNE_FIRST_DOW + i) % 7
                  const type = getDayType(dateStr)
                  const isSelected = selectedDate === dateStr
                  const clickable = type === 'available' || type === 'special'
                  return (
                    <div key={dateStr} style={cellStyle(dateStr, isSelected)} onClick={() => clickable && setSelectedDate(dateStr)}>
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: type === 'holiday' ? '#dc2626' : type === 'special' ? '#5b21b6'
                          : type === 'available' ? '#1d4ed8' : dow === 0 ? '#dc2626' : dow === 6 ? '#2563eb' : '#6b7280',
                      }}>
                        {day}
                      </span>
                      {type === 'available' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', opacity: 0.7 }} />}
                      {type === 'special' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', opacity: 0.7 }} />}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6', justifyContent: 'center' }}>
                {[
                  { color: '#eff6ff', border: '#93c5fd', label: '예약 가능' },
                  { color: '#f5f3ff', border: '#c4b5fd', label: '학력평가일 (전화 중심)' },
                  { color: '#fef2f2', border: '#fecaca', label: '상담 불가' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: item.color, border: `1px solid ${item.border}` }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* 슬롯 패널 */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.25rem' }}>
              {!selectedDate ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                  <p style={{ fontSize: 15 }}>캘린더에서 날짜를 선택해 주세요.</p>
                </div>
              ) : HOLIDAY_MAP[selectedDate] ? (
                <>
                  <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                    {fmtDateKo(selectedDate)} ({DOW[new Date(selectedDate).getDay()]}요일)
                  </h2>
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#92400e' }}>
                    {HOLIDAY_MAP[selectedDate]}
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                    {fmtDateKo(selectedDate)} ({DOW[new Date(selectedDate).getDay()]}요일) 상담 시간
                  </h2>
                  {SPECIAL_DAY_NOTICE[selectedDate] && (
                    <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1e40af', marginBottom: 14, lineHeight: 1.6 }}>
                      {SPECIAL_DAY_NOTICE[selectedDate]}
                    </div>
                  )}
                  {slotsLoading ? (
                    <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>불러오는 중...</p>
                  ) : slots.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>예약 가능한 시간이 없습니다.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {slots.map(slot => (
                        <SlotCard key={slot.id} slot={slot} onReserve={setReservingSlot} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ── 내 예약 확인 탭 ── */}
        {tab === 'myreservation' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>내 예약 확인</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>학생 이름과 학부모 휴대폰 번호를 모두 입력해야 조회할 수 있습니다.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <input
                style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                placeholder="학생 이름 입력 (예: 홍길동)"
                value={lookupName}
                onChange={e => setLookupName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                  placeholder="학부모 휴대폰 번호 (예: 010-1234-5678)"
                  value={lookupPhone}
                  onChange={e => setLookupPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                />
                <button
                  onClick={handleLookup}
                  disabled={lookupLoading || !lookupName.trim() || !lookupPhone.trim()}
                  style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (lookupLoading || !lookupName.trim() || !lookupPhone.trim()) ? 0.5 : 1 }}
                >
                  {lookupLoading ? '조회 중...' : '조회'}
                </button>
              </div>
            </div>

            {lookupError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
                {lookupError}
              </div>
            )}

            {myReservations !== null && (
              myReservations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                  <p style={{ fontSize: 14 }}>입력하신 학생 이름과 휴대폰 번호로 등록된 예약이 없습니다.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myReservations.map(r => (
                    <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{r.date?.replace('2026-', '').replace('-', '월 ')}일</span>
                          <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>{r.title} ({r.startTime}~{r.endTime})</span>
                        </div>
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600, ...(STATUS_STYLE[r.status] || {}) }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', fontSize: 13 }}>
                        <span style={{ color: '#9ca3af' }}>장소</span><span>{r.location}</span>
                        <span style={{ color: '#9ca3af' }}>학부모</span><span>{r.parentName} ({r.parentPhone})</span>
                        <span style={{ color: '#9ca3af' }}>방식</span><span>{r.counselingMethod}</span>
                        <span style={{ color: '#9ca3af' }}>내용</span><span style={{ color: '#374151' }}>{r.counselingContent}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                    ※ 예약 취소를 희망하실 경우, 담임 선생님께 개별 문자로 연락해 주시기 바랍니다.
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {reservingSlot && (
        <ReservationForm
          slot={reservingSlot}
          onClose={handleCloseForm}
          onSuccess={handleReserveSuccess}
        />
      )}
    </div>
  )
}
