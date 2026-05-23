import React, { useState } from 'react'
import { addReservation, getReservationsByStudentNumber } from '../services/storageService'
import { CLASS_ROSTER } from '../data/classRoster'

const ROSTER_MAP = Object.fromEntries(CLASS_ROSTER.map(s => [s.name, s.studentNumber]))
const BIRTHDATE_MAP = Object.fromEntries(CLASS_ROSTER.map(s => [s.name, s.birthdate]))

const RELATION_OPTIONS = ['모', '부', '부모 둘다', '기타']

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
    studentNumber: '',
    studentBirthdate: '',
    parentName: '',
    visitorRelation: '',
    visitorRelationCustom: '',
    parentPhone: '010-',
    counselingContent: '',
    counselingMethod: (slot.allowedMethods ?? [])[0] ?? '',
    consent: false,
  })
  const [nameError, setNameError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consentError, setConsentError] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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

  const handleParentNameChange = (value) => {
    set('parentName', value.replace(/[0-9]/g, ''))
  }

  // 생년월일 숫자만, 최대 6자리
  const handleBirthdateChange = (value) => {
    set('studentBirthdate', value.replace(/\D/g, '').slice(0, 6))
  }

  // 010-XXXX-XXXX 자동 포맷: 중간 4번째 숫자 입력 시 자동으로 - 추가
  const handlePhoneChange = (raw) => {
    const isDeleting = raw.length < form.parentPhone.length
    const digits = raw.replace(/\D/g, '')
    const d = ('010' + digits.replace(/^010/, '')).slice(0, 11)
    let formatted = d.slice(0, 3)
    if (d.length > 3) formatted += '-' + d.slice(3, 7)
    if (d.length > 7) formatted += '-' + d.slice(7, 11)
    else if (d.length === 7 && !isDeleting) formatted += '-'
    if (d.length <= 3) formatted = '010-'
    set('parentPhone', formatted)
  }

  const handleSubmit = async () => {
    if (!ROSTER_MAP[form.studentName]) {
      setError('학급 명단에 없는 학생입니다. 이름을 정확히 입력해 주세요.')
      return
    }
    if (!form.studentBirthdate || form.studentBirthdate.length < 6) {
      setError('자녀의 생년월일 6자리를 입력해 주세요. (예: 090820)')
      return
    }
    if (form.studentBirthdate !== BIRTHDATE_MAP[form.studentName]) {
      setError('학생 이름과 생년월일이 일치하지 않습니다. 다시 확인해 주세요.')
      return
    }
    if (!form.parentName) {
      setError('학부모 성함을 입력해 주세요.')
      return
    }
    if (!form.visitorRelation) {
      setError('방문자 관계를 선택해 주세요.')
      return
    }
    if (form.visitorRelation === '기타' && !form.visitorRelationCustom.trim()) {
      setError('방문자 관계를 직접 입력해 주세요.')
      return
    }
    if (!form.parentPhone || form.parentPhone.length < 13) {
      setError('학부모 연락처를 010-XXXX-XXXX 형식으로 입력해 주세요.')
      return
    }
    if (!form.counselingContent || !form.counselingMethod) {
      setError('모든 항목을 입력해 주세요.')
      return
    }
    if (!form.consent) {
      setConsentError(true)
      setError('개인정보 수집 동의를 체크해 주세요.')
      return
    }

    setLoading(true)
    setError('')
    try {
      // 중복 예약 확인
      const existing = await getReservationsByStudentNumber(form.studentNumber)
      const activeRes = existing.find(r => r.status !== '예약 취소')
      if (activeRes) {
        setError('이미 상담 예약이 완료된 학생입니다. 중복 신청은 불가합니다.')
        return
      }

      const finalRelation = form.visitorRelation === '기타'
        ? form.visitorRelationCustom.trim()
        : form.visitorRelation

      await addReservation({
        slotId: slot.id,
        studentNumber: form.studentNumber,
        studentName: form.studentName,
        parentName: form.parentName,
        visitorRelation: finalRelation,
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
  const displayRelation = form.visitorRelation === '기타'
    ? form.visitorRelationCustom || '기타'
    : form.visitorRelation

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
                <span>{form.parentName} ({displayRelation})</span>
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

            {/* 학생 이름 */}
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

            {/* 생년월일 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>자녀 생년월일 <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                style={inputStyle}
                placeholder="6자리 입력 (예: 090820)"
                value={form.studentBirthdate}
                onChange={e => handleBirthdateChange(e.target.value)}
                inputMode="numeric"
                maxLength={6}
              />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                학생 이름과 생년월일이 일치해야 예약할 수 있습니다.
              </p>
            </div>

            {/* 학번 자동 입력 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학번 (자동 입력)</label>
              <input
                style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280', cursor: 'default' }}
                value={form.studentNumber || '이름 입력 시 자동으로 채워집니다'}
                readOnly
              />
            </div>

            {/* 학부모 성함 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학부모 성함 <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                style={inputStyle}
                placeholder="학부모 성함"
                value={form.parentName}
                onChange={e => handleParentNameChange(e.target.value)}
              />
            </div>

            {/* 방문자 관계 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>방문자 관계 <span style={{ color: '#dc2626' }}>*</span></label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                {RELATION_OPTIONS.map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="visitorRelation"
                      value={opt}
                      checked={form.visitorRelation === opt}
                      onChange={() => set('visitorRelation', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {form.visitorRelation === '기타' && (
                <input
                  style={{ ...inputStyle, marginTop: 8 }}
                  placeholder="관계를 직접 입력해 주세요"
                  value={form.visitorRelationCustom}
                  onChange={e => set('visitorRelationCustom', e.target.value)}
                />
              )}
            </div>

            {/* 학부모 연락처 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>학부모 연락처 <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                style={inputStyle}
                placeholder="010-0000-0000"
                value={form.parentPhone}
                onChange={e => handlePhoneChange(e.target.value)}
                inputMode="numeric"
              />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                예약 확인 시 입력한 번호가 필요합니다.
              </p>
            </div>

            {/* 상담 희망 내용 */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>상담 희망 내용 <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                placeholder="상담하고 싶은 내용을 적어주세요."
                value={form.counselingContent}
                onChange={e => set('counselingContent', e.target.value)}
              />
            </div>

            {/* 상담 방식 */}
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

            {/* 개인정보 동의 - 미동의 시 붉은 테두리 */}
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13,
              color: consentError ? '#dc2626' : '#6b7280',
              margin: '12px 0 16px',
              background: consentError ? '#fef2f2' : 'transparent',
              border: consentError ? '2px solid #fca5a5' : '2px solid transparent',
              borderRadius: 8,
              padding: '8px 10px',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={form.consent}
                onChange={e => {
                  set('consent', e.target.checked)
                  if (e.target.checked) setConsentError(false)
                }}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
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
