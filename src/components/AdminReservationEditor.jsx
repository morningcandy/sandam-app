import React, { useState } from 'react'
import { addReservation, updateReservation, updateReservationSlot, updateReservationStatus, getSlotAvailability } from '../services/storageService'

const RELATION_OPTIONS = ['모', '부', '부모 둘다', '기타']
const fmtSlotDate = (d) => d ? d.replace('2026-', '').replace('-', '월 ') + '일' : ''
const slotLabel = (s) => `${fmtSlotDate(s.date)}(${s.dayLabel?.replace('요일', '') ?? ''}) ${s.title} ${s.startTime}~${s.endTime} — ${s.activeCount}/${s.maxReservations}명`

// 관리자 전용 예약 추가·수정 창
// - 추가: 학생·상담 시간·학부모 정보를 직접 넣어 '예약 완료'로 등록 (신청 기간과 무관)
// - 수정: 학부모 정보·방식·내용·상담 시간을 바꾼다. 보류 건은 시간을 고르면서 예약 완료로 되돌릴 수 있다.
export default function AdminReservationEditor({ mode, reservation, roster, allSlots, onClose, onSaved }) {
  const isAdd = mode === 'add'
  const relationKnown = !reservation?.visitorRelation || RELATION_OPTIONS.includes(reservation.visitorRelation)
  const [form, setForm] = useState({
    studentNumber: reservation?.studentNumber ?? '',
    slotId: reservation?.slotId ?? '',
    parentName: reservation?.parentName ?? '',
    visitorRelation: relationKnown ? (reservation?.visitorRelation ?? '') : '기타',
    visitorRelationCustom: relationKnown ? '' : reservation.visitorRelation,
    parentPhone: reservation?.parentPhone ?? '010-',
    counselingMethod: reservation?.counselingMethod ?? '',
    counselingContent: reservation?.counselingContent ?? '',
    restore: reservation?.status === '보류',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const slot = allSlots.find(s => s.id === form.slotId)
  const methods = Array.isArray(slot?.allowedMethods) && slot.allowedMethods.length ? slot.allowedMethods : ['대면', '전화']
  const slotChanged = !isAdd && form.slotId !== reservation.slotId
  // 이미 예약(보류 포함)이 있는 학생은 추가 목록에서 막는다
  const busy = (st) => st.status === '예약 완료' || st.status === '상담 완료' || st.status === '보류'

  const handlePhone = (raw) => {
    const d = ('010' + raw.replace(/\D/g, '').replace(/^010/, '')).slice(0, 11)
    let f = d.slice(0, 3)
    if (d.length > 3) f += '-' + d.slice(3, 7)
    if (d.length > 7) f += '-' + d.slice(7, 11)
    set('parentPhone', d.length <= 3 ? '010-' : f)
  }

  const handleSave = async () => {
    const student = roster.find(r => r.studentNumber === form.studentNumber)
    if (isAdd && !student) { alert('학생을 선택해 주세요.'); return }
    if (!form.slotId) { alert('상담 시간을 선택해 주세요.'); return }
    if (!form.parentName.trim()) { alert('학부모 성함을 입력해 주세요.'); return }
    if (form.parentPhone.length < 13) { alert('연락처를 010-XXXX-XXXX 형식으로 입력해 주세요.'); return }
    const relation = form.visitorRelation === '기타' ? form.visitorRelationCustom.trim() : form.visitorRelation
    const method = methods.includes(form.counselingMethod) ? form.counselingMethod : methods[0]

    setSaving(true)
    try {
      if (isAdd || slotChanged) {
        const { activeCount, maxReservations } = await getSlotAvailability(form.slotId)
        if (activeCount >= maxReservations
          && !window.confirm('선택한 시간은 이미 정원이 찼습니다. 그래도 넣으시겠습니까?')) return
      }
      if (isAdd) {
        await addReservation({
          slotId: form.slotId,
          studentNumber: student.studentNumber,
          studentName: student.name,
          parentName: form.parentName.trim(),
          visitorRelation: relation,
          parentPhone: form.parentPhone,
          counselingContent: form.counselingContent.trim() || '(담임 직접 등록)',
          counselingMethod: method,
        })
      } else {
        await updateReservation(reservation.id, {
          parentName: form.parentName.trim(),
          visitorRelation: relation,
          parentPhone: form.parentPhone,
          counselingMethod: method,
          counselingContent: form.counselingContent,
        })
        if (slotChanged) await updateReservationSlot(reservation.id, form.slotId)
        if (reservation.status === '보류' && form.restore) await updateReservationStatus(reservation.id, '예약 완료')
      }
      await onSaved()
      onClose()
    } catch (e) {
      alert('저장 실패: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const inp = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', boxSizing: 'border-box' }
  const label = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{isAdd ? '예약 직접 추가' : '예약 수정'}</h3>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>
          {isAdd ? '신청 기간과 관계없이 담임이 직접 예약을 넣습니다. (예약 완료로 등록)' : `${reservation.studentName} (${reservation.studentNumber}) · 현재 상태: ${reservation.status}`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isAdd && (
            <div>
              <label style={label}>학생</label>
              <select value={form.studentNumber} onChange={e => set('studentNumber', e.target.value)} style={inp}>
                <option value="">학생 선택</option>
                {roster.map(st => (
                  <option key={st.studentNumber} value={st.studentNumber} disabled={busy(st)}>
                    {st.no}번 {st.name}{busy(st) ? ` (${st.status})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={label}>상담 시간</label>
            <select value={form.slotId} onChange={e => set('slotId', e.target.value)} style={inp}>
              <option value="">상담 시간 선택</option>
              {allSlots.map(s => (
                <option key={s.id} value={s.id}>{s.id === reservation?.slotId ? '(현재) ' : ''}{slotLabel(s)}</option>
              ))}
            </select>
            {!isAdd && reservation.status === '보류' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b21a8', marginTop: 6 }}>
                <input type="checkbox" checked={form.restore} onChange={e => set('restore', e.target.checked)} />
                저장하면서 보류를 풀고 예약 완료로 되돌리기
              </label>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={label}>학부모 성함</label>
              <input value={form.parentName} onChange={e => set('parentName', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={label}>연락처</label>
              <input value={form.parentPhone} onChange={e => handlePhone(e.target.value)} inputMode="numeric" style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={label}>방문자 관계</label>
              <select value={form.visitorRelation} onChange={e => set('visitorRelation', e.target.value)} style={inp}>
                <option value="">선택 안 함</option>
                {RELATION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {form.visitorRelation === '기타' && (
                <input value={form.visitorRelationCustom} onChange={e => set('visitorRelationCustom', e.target.value)} placeholder="관계 직접 입력" style={{ ...inp, marginTop: 6 }} />
              )}
            </div>
            <div>
              <label style={label}>상담 방식</label>
              <select value={methods.includes(form.counselingMethod) ? form.counselingMethod : methods[0]} onChange={e => set('counselingMethod', e.target.value)} style={inp}>
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={label}>상담 내용 (선택)</label>
            <textarea value={form.counselingContent} onChange={e => set('counselingContent', e.target.value)} rows={4}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} placeholder="문자로 받은 내용 등을 적어 두세요" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>닫기</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
            {saving ? '저장 중...' : isAdd ? '예약 추가' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
