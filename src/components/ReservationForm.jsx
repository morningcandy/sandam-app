import React, { useState } from 'react'
import { addReservation } from '../services/storageService'
import { CLASS_ROSTER } from '../data/classRoster'

// 이름 → 학번 빠른 조회용 맵
const ROSTER_MAP = Object.fromEntries(CLASS_ROSTER.map(s => [s.name, s.studentNumber]))

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '1rem',
}
const modal = {
  background: '#fff', borderRadius: 16, padding: '1.5rem',
  width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}
const labelStyle = { display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 5, fontWeight: 500 }
const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 14, color: '#111827', background: '#fff', outline: 'none',
}
const primaryBtn = {
  flex: 1, padding: '10px 0', background: '#2563eb', color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
const secondaryBtn = {
  padding: '10px 16px', background: '#fff', color: '#6b7280',
  border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, cursor: 'pointer',
}

export default function ReservationForm({ slot, onClose, onSuccess }) {
  const [form, setForm] = useState({
    studentName: '',
    studentNumber: '',   // 명단 기준 자동 입력
    parentName: '',
    parentPhone: '',
    counselingContent: '',
    counselingMethod: (slot.allowedMethods ?? [])[0] ?? '',
    consent: false,
  })
  const [nameError, setNameError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // 학생 이름 입력 시 명단 검증 + 학번 자동 입력
  const handleNameChange = (name) => {
    set('studentName', name)
    if (!name) {
      setNameError('')
      set('studentNumber', '')
      return
    }
    const num = ROSTER_MAP[name]
    if (num) {
      setNameError('')
      set('studentNumber', num)
    } else {
      setNameError('학급 명단에 없는 이름입니다. 정확히 입력해 주세요.')
      set('studentNumber', '')
    }
  }

  const handleSubmit = async () => {
    // 명단 검증
    if (!ROSTER_MAP[form.studentName]) {
      setError('학급 명단에 없는 학생입니다. 이름을 정확히 입력해 주세요.')
      return
    }
    if (!form.parentName || !form.parentPhone || !form.counselingContent || !form.counselingMethod) {
      setError('모든 항목을 입력해 주세요.')
      return
    }
    if (!form.consent) {
      setError('개인정보 수집 동의를 체크해 주세요.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await addReservation({
        slotId: slot.id,
        studentNumber: form.studentNumber,
        studentName: form.studentName,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        counselingContent: form.counselingContent,
        counselingMethod: form.counselingMethod,
      })
      setSubmitted(true)
      onSuccess?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = slot.date.replace('2026-', '').replace('-', '월 ') + '일'

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>예약이 완료되었습니다.</h3>

            <div style={{
              background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 12,
              padding: '16px', marginBottom: 16, textAlign: 'left',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 10 }}>예약 내역 확인</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>날짜</span>
                <span style={{ fontWeight: 600 }}>{fmtDate} ({slot.dayLabel})</span>
                <span style={{ color: '#6b7280' }}>시간</span>
                <span style={{ fontWeight: 600 }}>{slot.title} ({slot.startTime}~{slot.endTime})</span>
                <span style={{ color: '#6b7280' }}>장소</span>
                <span>{slot.location}</span>
                <span style={{ color: '#6b7280' }}>학생</span>
                <span>{form.studentName} ({form.studentNumber})</span>
                <span style={{ color: '#6b7280' }}>학부모</span>
                <span>{form.parentName}</span>
                <span style={{ color: '#6b7280' }}>연락처</span>
                <span>{form.parentPhone}</span>
                <span style={{ color: '#6b7280' }}>방식</span>
                <span>{form.counselingMethod}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              <strong>내 예약 확인</strong> 탭에서 학생 이름과 학부모 휴대폰 번호로 예약 내역을 조회하실 수 있습니다.
            </p>
            <button style={{ ...primaryBtn, width: '100%', maxWidth: 160 }} onClick={onClose}>
              확인
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>예약하기</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              {fmtDate} · {slot.title} ({slot.startTime}~{slot.endTime})
            </p>

            {/* 학생 이름 — 명단 검증 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학생 이름 <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                style={{ ...inputStyle, borderColor: nameError ? '#fca5a5' : '#e5e7eb' }}
                placeholder="예: 김해성"
                value={form.studentName}
                onChange={e => handleNameChange(e.target.value)}
              />
              {nameError && (
                <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{nameError}</p>
              )}
            </div>

            {/* 학번 — 자동 입력 (읽기 전용) */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학번 (자동 입력)</label>
              <input
                style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280', cursor: 'default' }}
                value={form.studentNumber || '이름 입력 시 자동으로 채워집니다'}
                readOnly
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학부모 성함 <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={inputStyle} placeholder="학부모 성함"
                value={form.parentName} onChange={e => set('parentName', e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학부모 연락처 <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={inputStyle} placeholder="010-0000-0000"
                value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                예약 확인 시 입력한 번호가 필요합니다.
              </p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>상담 희망 내용 <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                placeholder="상담하고 싶은 내용을 적어주세요."
                value={form.counselingContent}
                onChange={e => set('counselingContent', e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>상담 방식</label>
              {(slot.allowedMethods ?? []).length === 1 ? (
                <p style={{ fontSize: 14, color: '#374151' }}>{slot.allowedMethods[0]}</p>
              ) : (
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  {(slot.allowedMethods ?? []).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                      <input type="radio" name="method" value={m}
                        checked={form.counselingMethod === m}
                        onChange={() => set('counselingMethod', m)} />
                      {m}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#6b7280', margin: '12px 0 16px' }}>
              <input type="checkbox" checked={form.consent}
                onChange={e => set('consent', e.target.checked)}
                style={{ marginTop: 2, flexShrink: 0 }} />
              상담 예약을 위해 입력한 개인정보 수집 및 이용에 동의합니다.
            </label>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={secondaryBtn} onClick={onClose} disabled={loading}>취소</button>
              <button
                style={{ ...primaryBtn, opacity: (loading || !!nameError) ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={loading || !!nameError}
              >
                {loading ? '처리 중...' : '예약 완료'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
