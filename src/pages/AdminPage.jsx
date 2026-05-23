import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getAllSlots, getAllReservations, addSlot, deleteSlot,
  getSlotsByDate, getReservationsByDate,
  updateReservationStatus, deleteReservation,
  getConfig, updateConfig, seedSlots,
} from '../services/storageService'
import ReservationList from '../components/ReservationList'
import { AVAILABLE_DATES } from '../data/initialSlots'
import { CLASS_ROSTER } from '../data/classRoster'

const DAY_LABELS = {
  '2026-06-01': '월', '2026-06-02': '화', '2026-06-04': '목',
  '2026-06-05': '금', '2026-06-08': '월', '2026-06-09': '화', '2026-06-10': '수',
}

const STATUS_STYLE = {
  '예약 완료': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  '상담 완료': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  '예약 취소': { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
}

// ── 상태별 필터 패널 ──────────────────────────────────────────
function FilterPanel({ filter, reservations, onStatusChange, onDelete, onClose, loadingId }) {
  const s = STATUS_STYLE[filter] || STATUS_STYLE['예약 완료']
  const fmtDate = (d) => d ? d.replace('2026-', '').replace('-', '월 ') + '일' : ''

  return (
    <div style={{
      background: '#fff', border: `2px solid ${s.border}`, borderRadius: 14,
      padding: '18px 20px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}>
            {filter}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>전체 현황 — {reservations.length}건</span>
        </div>
        <button
          onClick={onClose}
          style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, cursor: 'pointer', color: '#6b7280' }}
        >
          닫기
        </button>
      </div>

      {reservations.length === 0 ? (
        <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
          해당 내역이 없습니다.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservations.map(res => (
            <div key={res.id} style={{
              background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 10, padding: '12px 14px',
            }}>
              {/* 날짜·슬롯 정보 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
                    {fmtDate(res.date)} ({res.dayLabel?.replace('요일', '')})
                  </span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {res.title} {res.startTime}~{res.endTime}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{res.location}</span>
                </div>
                <span style={{
                  fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600,
                  background: s.bg, color: s.color,
                }}>
                  {res.status}
                </span>
              </div>

              {/* 예약자 정보 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '4px 12px', fontSize: 12, marginBottom: 10 }}>
                <span style={{ color: '#9ca3af' }}>학번</span><span>{res.studentNumber}</span>
                <span style={{ color: '#9ca3af' }}>학생</span><span style={{ fontWeight: 600 }}>{res.studentName}</span>
                <span style={{ color: '#9ca3af' }}>학부모</span><span>{res.parentName}{res.visitorRelation ? ` (${res.visitorRelation})` : ''}</span>
                <span style={{ color: '#9ca3af' }}>연락처</span><span>{res.parentPhone}</span>
                <span style={{ color: '#9ca3af' }}>방식</span><span>{res.counselingMethod}</span>
                <span style={{ color: '#9ca3af' }}>내용</span><span style={{ color: '#374151' }}>{res.counselingContent}</span>
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {filter === '예약 완료' && (
                  <>
                    <button
                      disabled={loadingId === res.id}
                      onClick={() => onStatusChange(res.id, '상담 완료', '상담 완료 처리하겠습니까?')}
                      style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #6ee7b7', background: '#f0fdf4', color: '#065f46', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: loadingId === res.id ? 0.5 : 1 }}
                    >
                      상담 완료
                    </button>
                    <button
                      disabled={loadingId === res.id}
                      onClick={() => onStatusChange(res.id, '예약 취소', '예약을 취소하시겠습니까?')}
                      style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: loadingId === res.id ? 0.5 : 1 }}
                    >
                      예약 취소
                    </button>
                  </>
                )}
                {filter === '상담 완료' && (
                  <button
                    disabled={loadingId === res.id}
                    onClick={() => onStatusChange(res.id, '예약 완료', '예약 완료 상태로 되돌리겠습니까?')}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #d1d5db', background: '#f9fafb', color: '#6b7280', fontSize: 12, cursor: 'pointer', opacity: loadingId === res.id ? 0.5 : 1 }}
                  >
                    예약 완료로 복원
                  </button>
                )}
                {filter === '예약 취소' && (
                  <>
                    <button
                      disabled={loadingId === res.id}
                      onClick={() => onStatusChange(res.id, '예약 완료', '예약 완료 상태로 복원하겠습니까?')}
                      style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontSize: 12, cursor: 'pointer', opacity: loadingId === res.id ? 0.5 : 1 }}
                    >
                      예약 복원
                    </button>
                    <button
                      disabled={loadingId === res.id}
                      onClick={() => onDelete(res.id)}
                      style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #ef4444', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: loadingId === res.id ? 0.5 : 1 }}
                    >
                      영구 삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 학급 명단 패널 ────────────────────────────────────────────
function ClassRosterPanel({ roster, reservedCount }) {
  const total = roster.length

  const getStatusStyle = (status) => {
    if (status === '예약 완료') return { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }
    if (status === '상담 완료') return { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }
    if (status === '예약 취소 이력') return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }
    return { background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' }
  }

  const getStatusLabel = (status) => {
    if (status === '예약 완료') return '예약 완료'
    if (status === '상담 완료') return '상담 완료'
    if (status === '예약 취소 이력') return '취소 이력'
    return '미신청'
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>학급 명단 — 상담 신청 현황</h2>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            전체 {total}명 중 <strong style={{ color: '#2563eb' }}>{reservedCount}명</strong> 신청
            <span style={{ marginLeft: 8, color: '#9ca3af' }}>({total - reservedCount}명 미신청)</span>
          </p>
        </div>
        {/* 범례 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[
            { label: '예약 완료', ...getStatusStyle('예약 완료') },
            { label: '상담 완료', ...getStatusStyle('상담 완료') },
            { label: '취소 이력', ...getStatusStyle('예약 취소 이력') },
            { label: '미신청', ...getStatusStyle(null) },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.background, border: l.border }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 62px 72px 72px 52px 1fr 80px',
        background: '#f8fafc', borderRadius: '8px 8px 0 0', border: '1px solid #e5e7eb',
        padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b7280',
      }}>
        <span>번호</span>
        <span>학번</span>
        <span>이름</span>
        <span>학부모</span>
        <span>관계</span>
        <span>연락처</span>
        <span style={{ textAlign: 'center' }}>현황</span>
      </div>

      {/* 학생 행 */}
      <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        {roster.map((student, idx) => {
          const ss = getStatusStyle(student.status)
          const applied = student.status !== null
          const hasInfo = (student.status === '예약 완료' || student.status === '상담 완료') && student.parentName
          return (
            <div
              key={student.no}
              style={{
                display: 'grid', gridTemplateColumns: '36px 62px 72px 72px 52px 1fr 80px',
                padding: '8px 12px', fontSize: 12, alignItems: 'center',
                background: applied && student.status !== '예약 취소 이력' ? '#fafeff' : '#fff',
                borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <span style={{ color: '#9ca3af', fontSize: 11 }}>{student.no}</span>
              <span style={{ color: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}>{student.studentNumber}</span>
              <span style={{
                fontWeight: applied && student.status !== '예약 취소 이력' ? 700 : 400,
                color: applied && student.status !== '예약 취소 이력' ? '#111827' : '#374151',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {student.name}
                {student.birthdate && (
                  <span style={{ display: 'block', fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>
                    {student.birthdate}
                  </span>
                )}
              </span>
              <span style={{ color: hasInfo ? '#111827' : '#d1d5db', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {hasInfo ? student.parentName : '—'}
              </span>
              <span style={{ color: hasInfo ? '#374151' : '#d1d5db', fontSize: 12 }}>
                {hasInfo ? (student.visitorRelation || '—') : '—'}
              </span>
              <span style={{ color: hasInfo ? '#374151' : '#d1d5db', fontSize: 12, fontFamily: 'monospace' }}>
                {hasInfo ? student.parentPhone : '—'}
              </span>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 12,
                  ...ss,
                }}>
                  {getStatusLabel(student.status)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 메인 AdminPage ─────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState(null) // null | '예약 완료' | '상담 완료' | '예약 취소'
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0])
  const [slots, setSlots] = useState([])
  const [reservations, setReservations] = useState([])
  const [allReservations, setAllReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [openAt, setOpenAt] = useState('')
  const [openAtInput, setOpenAtInput] = useState('')
  const [openAtSaving, setOpenAtSaving] = useState(false)
  const [closeAt, setCloseAt] = useState('')
  const [closeAtInput, setCloseAtInput] = useState('')
  const [closeAtSaving, setCloseAtSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlot, setNewSlot] = useState({
    date: AVAILABLE_DATES[0], title: '', startTime: '', endTime: '',
    location: '2교무실', methods: ['대면', '전화'], maxReservations: 1, notice: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, r, all, cfg] = await Promise.all([
        getSlotsByDate(selectedDate),
        getReservationsByDate(selectedDate),
        getAllReservations(),
        getConfig(),
      ])
      setSlots(Array.isArray(s) ? s : [])
      setReservations(Array.isArray(r) ? r : [])
      setAllReservations(Array.isArray(all) ? all : [])
      const toKST = (v) => v ? (() => { const d = new Date(v); return new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 16) })() : ''
      const savedOpen = toKST(cfg?.openAt)
      const savedClose = toKST(cfg?.closeAt)
      setOpenAt(savedOpen); setOpenAtInput(savedOpen)
      setCloseAt(savedClose); setCloseAtInput(savedClose)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { load() }, [load])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed')
    navigate('/admin/login', { replace: true })
  }

  const handleFilterStatusChange = async (id, status, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setActionLoadingId(id)
    try {
      await updateReservationStatus(id, status)
      await load()
    } catch (e) {
      alert('변경 실패: ' + e.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleFilterDelete = async (id) => {
    if (!window.confirm('예약 내역을 영구 삭제합니다. 복구할 수 없습니다. 계속하시겠습니까?')) return
    setActionLoadingId(id)
    try {
      await deleteReservation(id)
      await load()
    } catch (e) {
      alert('삭제 실패: ' + e.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSaveOpenAt = async () => {
    setOpenAtSaving(true)
    try {
      const saveValue = openAtInput ? openAtInput + ':00+09:00' : null
      await updateConfig({ openAt: saveValue })
      setOpenAt(openAtInput)
      alert(openAtInput ? `오픈 시간이 저장되었습니다.\n${fmtOpenAt(openAtInput)}` : '예약 오픈 시간 제한이 해제되었습니다.')
    } catch (e) { alert('저장 실패: ' + e.message) }
    finally { setOpenAtSaving(false) }
  }

  const handleSaveCloseAt = async () => {
    setCloseAtSaving(true)
    try {
      const saveValue = closeAtInput ? closeAtInput + ':00+09:00' : null
      await updateConfig({ closeAt: saveValue })
      setCloseAt(closeAtInput)
      alert(closeAtInput ? `마감 시간이 저장되었습니다.\n${fmtOpenAt(closeAtInput)}` : '예약 마감 시간 제한이 해제되었습니다.')
    } catch (e) { alert('저장 실패: ' + e.message) }
    finally { setCloseAtSaving(false) }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('이 상담 시간을 삭제하시겠습니까?')) return
    try { await deleteSlot(slotId); await load() }
    catch (e) { alert('삭제 실패: ' + e.message) }
  }

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.title || !newSlot.startTime || !newSlot.endTime) {
      alert('날짜, 제목, 시작·종료 시간을 모두 입력해 주세요.'); return
    }
    try {
      const day = new Date(newSlot.date).toLocaleDateString('ko-KR', { weekday: 'long' })
      await addSlot({
        id: 'custom-' + Date.now(), date: newSlot.date, dayLabel: day,
        title: newSlot.title, startTime: newSlot.startTime, endTime: newSlot.endTime,
        location: newSlot.location || '2교무실', allowedMethods: newSlot.methods,
        maxReservations: Number(newSlot.maxReservations) || 1, notice: newSlot.notice, isSpecial: false,
      })
      setShowAddForm(false)
      setNewSlot({ date: selectedDate, title: '', startTime: '', endTime: '', location: '2교무실', methods: ['대면', '전화'], maxReservations: 1, notice: '' })
      await load()
    } catch (e) { alert('추가 실패: ' + e.message) }
  }

  // 통계
  const totalReserved = allReservations.filter(r => r.status === '예약 완료').length
  const totalDone = allReservations.filter(r => r.status === '상담 완료').length
  const totalCancelled = allReservations.filter(r => r.status === '예약 취소').length

  // 필터 패널용 데이터
  const filteredReservations = activeFilter
    ? allReservations.filter(r => r.status === activeFilter)
    : []

  // 학급 명단 매칭
  const rosterWithStatus = CLASS_ROSTER.map(student => {
    const reses = allReservations.filter(r => r.studentNumber === student.studentNumber)
    const active = reses.find(r => r.status === '예약 완료')
    const done = reses.find(r => r.status === '상담 완료')
    const cancelled = reses.find(r => r.status === '예약 취소')
    const mainRes = active || done || null
    let status = null
    if (active) status = '예약 완료'
    else if (done) status = '상담 완료'
    else if (cancelled) status = '예약 취소 이력'
    return {
      ...student,
      status,
      birthdate: student.birthdate ?? '',
      parentName: mainRes?.parentName ?? '',
      visitorRelation: mainRes?.visitorRelation ?? '',
      parentPhone: mainRes?.parentPhone ?? '',
    }
  })
  const reservedCount = rosterWithStatus.filter(s => s.status === '예약 완료' || s.status === '상담 완료').length

  const fmtDate = (d) => d.replace('2026-', '').replace('-', '월 ') + '일'
  // openAt/openAtInput은 KST "YYYY-MM-DDTHH:mm" 형식이므로 직접 파싱
  const fmtOpenAt = (dt) => {
    if (!dt) return ''
    const [date, time] = dt.split('T')
    const [, month, day] = date.split('-')
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour < 12 ? '오전' : '오후'
    const h12 = hour % 12 || 12
    return `${parseInt(month)}/${parseInt(day)} ${ampm} ${h12}:${m}`
  }
  const inp = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#111827' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 헤더 */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700 }}>관리자 페이지</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>학부모 상담 예약실</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>학부모 페이지</Link>
          <button
            onClick={async () => {
              if (!window.confirm('누락된 기본 상담 슬롯을 복구합니다. 기존 슬롯은 변경되지 않습니다.')) return
              try { await seedSlots(); await load(); alert('슬롯 복구 완료') }
              catch (e) { alert('복구 실패: ' + e.message) }
            }}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #f59e0b', background: '#fffbeb', fontSize: 13, color: '#92400e', cursor: 'pointer' }}
          >슬롯 복구</button>
          <button onClick={load} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>새로고침</button>
          <button onClick={handleLogout} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>로그아웃</button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── 예약 오픈/마감 시간 설정 ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 18px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>예약 기간 설정</h2>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>오픈 시간 이전에는 슬롯이 보이되 "오픈 예정"으로 표시되고, 마감 시간 이후에는 예약이 차단됩니다.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 오픈 시간 */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>🟢 예약 오픈 시간</span>
                {openAt
                  ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' }}>설정됨: {fmtOpenAt(openAt)}</span>
                  : <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: '#f0fdf4', color: '#059669', border: '1px solid #6ee7b7' }}>제한 없음 (즉시 오픈)</span>
                }
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="datetime-local" value={openAtInput} onChange={e => setOpenAtInput(e.target.value)}
                  style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', color: '#111827' }} />
                <button onClick={handleSaveOpenAt} disabled={openAtSaving || openAtInput === openAt}
                  style={{ padding: '7px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (openAtSaving || openAtInput === openAt) ? 0.5 : 1 }}>
                  {openAtSaving ? '저장 중...' : '저장'}
                </button>
                {openAtInput && <button onClick={() => setOpenAtInput('')}
                  style={{ padding: '7px 12px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>해제</button>}
              </div>
              {openAtInput && openAtInput !== openAt && <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>⚠ 저장 버튼을 눌러야 적용됩니다.</p>}
            </div>

            {/* 마감 시간 */}
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c2410c' }}>🔴 예약 마감 시간</span>
                {closeAt
                  ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>설정됨: {fmtOpenAt(closeAt)}</span>
                  : <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: '#f9fafb', color: '#9ca3af', border: '1px solid #e5e7eb' }}>마감 없음</span>
                }
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="datetime-local" value={closeAtInput} onChange={e => setCloseAtInput(e.target.value)}
                  style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', color: '#111827' }} />
                <button onClick={handleSaveCloseAt} disabled={closeAtSaving || closeAtInput === closeAt}
                  style={{ padding: '7px 16px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (closeAtSaving || closeAtInput === closeAt) ? 0.5 : 1 }}>
                  {closeAtSaving ? '저장 중...' : '저장'}
                </button>
                {closeAtInput && <button onClick={() => setCloseAtInput('')}
                  style={{ padding: '7px 12px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>해제</button>}
              </div>
              {closeAtInput && closeAtInput !== closeAt && <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>⚠ 저장 버튼을 눌러야 적용됩니다.</p>}
            </div>
          </div>
        </div>

        {/* ── 통계 카드 (클릭 가능) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: '예약 완료', value: totalReserved, color: '#2563eb', bg: '#eff6ff', activeBg: '#dbeafe', border: '#93c5fd' },
            { label: '상담 완료', value: totalDone,     color: '#059669', bg: '#f0fdf4', activeBg: '#dcfce7', border: '#6ee7b7' },
            { label: '예약 취소', value: totalCancelled,color: '#dc2626', bg: '#fff5f5', activeBg: '#fee2e2', border: '#fca5a5' },
          ].map(s => {
            const isActive = activeFilter === s.label
            return (
              <div
                key={s.label}
                onClick={() => setActiveFilter(isActive ? null : s.label)}
                style={{
                  background: isActive ? s.activeBg : s.bg,
                  borderRadius: 12, padding: '14px', textAlign: 'center',
                  border: isActive ? `2px solid ${s.color}` : `1px solid ${s.border}`,
                  cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none',
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 600 }}>
                  {isActive ? '▲ 닫기' : '▼ 클릭하여 보기'}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── 필터 패널 (카드 클릭 시 노출) ── */}
        {activeFilter && (
          <FilterPanel
            filter={activeFilter}
            reservations={filteredReservations}
            onStatusChange={handleFilterStatusChange}
            onDelete={handleFilterDelete}
            onClose={() => setActiveFilter(null)}
            loadingId={actionLoadingId}
          />
        )}

        {/* ── 날짜별 예약 현황 ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>날짜별 예약 현황</h2>
            <button
              onClick={() => setShowAddForm(v => !v)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #2563eb', background: showAddForm ? '#2563eb' : '#eff6ff', color: showAddForm ? '#fff' : '#1d4ed8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {showAddForm ? '닫기' : '+ 상담 시간 추가'}
            </button>
          </div>

          {/* 날짜 탭 */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {AVAILABLE_DATES.map(d => (
              <button key={d} onClick={() => setSelectedDate(d)} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: selectedDate === d ? '1px solid #2563eb' : '1px solid #e5e7eb',
                background: selectedDate === d ? '#2563eb' : '#fff',
                color: selectedDate === d ? '#fff' : '#374151',
              }}>
                {fmtDate(d)}({DAY_LABELS[d]})
              </button>
            ))}
          </div>

          {/* 상담 시간 추가 폼 */}
          {showAddForm && (
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>새 상담 시간 추가</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {[
                  { label: '날짜', el: <select value={newSlot.date} onChange={e => setNewSlot(s => ({ ...s, date: e.target.value }))} style={{ ...inp, width: '100%' }}>{AVAILABLE_DATES.map(d => <option key={d} value={d}>{fmtDate(d)}</option>)}</select> },
                  { label: '제목', el: <input style={{ ...inp, width: '100%' }} placeholder="예: 6교시 전반부" value={newSlot.title} onChange={e => setNewSlot(s => ({ ...s, title: e.target.value }))} /> },
                  { label: '시작 시간', el: <input type="time" style={{ ...inp, width: '100%' }} value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))} /> },
                  { label: '종료 시간', el: <input type="time" style={{ ...inp, width: '100%' }} value={newSlot.endTime} onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))} /> },
                  { label: '장소', el: <input style={{ ...inp, width: '100%' }} placeholder="2교무실" value={newSlot.location} onChange={e => setNewSlot(s => ({ ...s, location: e.target.value }))} /> },
                  { label: '최대 인원', el: <input type="number" min={1} max={10} style={{ ...inp, width: '100%' }} value={newSlot.maxReservations} onChange={e => setNewSlot(s => ({ ...s, maxReservations: e.target.value }))} /> },
                ].map(({ label, el }) => (
                  <div key={label}>
                    <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label}</label>
                    {el}
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>상담 방식</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    {['대면', '전화'].map(m => (
                      <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                        <input type="checkbox" checked={newSlot.methods.includes(m)}
                          onChange={e => setNewSlot(s => ({ ...s, methods: e.target.checked ? [...s.methods, m] : s.methods.filter(x => x !== m) }))} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>특이사항 (선택)</label>
                <textarea style={{ ...inp, width: '100%', resize: 'vertical', minHeight: 60 }} placeholder="특별 안내사항" value={newSlot.notice} onChange={e => setNewSlot(s => ({ ...s, notice: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={handleAddSlot} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>추가하기</button>
                <button onClick={() => setShowAddForm(false)} style={{ padding: '8px 14px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>취소</button>
              </div>
            </div>
          )}

          {/* 슬롯 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {loading && <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '0.5rem 0' }}>불러오는 중...</p>}
            {!loading && slots.length === 0 && <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>해당 날짜에 상담 시간이 없습니다.</p>}
            {slots.map(slot => (
              <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 8, padding: '10px 14px', border: '1px solid #f3f4f6' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{slot.title}</span>
                  <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{slot.startTime}~{slot.endTime}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{slot.location}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>예약 {slot.activeCount}/{slot.maxReservations}</span>
                </div>
                <button onClick={() => handleDeleteSlot(slot.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>삭제</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 예약자 상세 (취소 제외) ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 18px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>{fmtDate(selectedDate)} 예약자 상세</h2>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>예약 취소 건은 상단 빨간 카드에서 확인</span>
          </div>
          <ReservationList slots={slots} reservations={reservations} onRefresh={load} />
        </div>

        {/* ── 학급 명단 ── */}
        <ClassRosterPanel roster={rosterWithStatus} reservedCount={reservedCount} />

      </main>
    </div>
  )
}
