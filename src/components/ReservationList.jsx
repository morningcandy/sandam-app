import React, { useState } from 'react'
import { updateReservationStatus } from '../services/storageService'

const STATUS_BADGE = {
  '예약 완료': { background: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  '상담 완료': { background: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  '예약 취소': { background: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
}

// 기본 뷰: 예약 취소된 건은 표시하지 않음 (관리자 필터 패널에서 별도 관리)
export default function ReservationList({ slots, reservations, onRefresh }) {
  const [loadingId, setLoadingId] = useState(null)

  const handleStatus = async (id, newStatus, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setLoadingId(id)
    try {
      await updateReservationStatus(id, newStatus)
      await onRefresh()
    } catch (e) {
      alert('상태 변경 실패: ' + e.message)
    } finally {
      setLoadingId(null)
    }
  }

  if (slots.length === 0) {
    return (
      <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '2rem 0' }}>
        해당 날짜에 상담 시간이 없습니다.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {slots.map(slot => {
        // 취소된 예약은 기본 목록에서 제외 (상단 통계 카드 클릭 시 별도 확인)
        const slotRes = reservations.filter(r => r.slotId === slot.id && r.status !== '예약 취소')
        const activeCount = slotRes.filter(r => r.status !== '예약 취소').length

        return (
          <div key={slot.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {/* 슬롯 헤더 */}
            <div style={{
              background: '#f8fafc', borderBottom: '1px solid #e5e7eb',
              padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{slot.title}</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{slot.startTime} ~ {slot.endTime}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{slot.location}</span>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                background: activeCount >= slot.maxReservations ? '#fee2e2' : '#f0fdf4',
                color: activeCount >= slot.maxReservations ? '#991b1b' : '#065f46',
              }}>
                {activeCount} / {slot.maxReservations}명
              </span>
            </div>

            {/* 예약 목록 */}
            {slotRes.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af', padding: '16px', margin: 0 }}>예약 없음</p>
            ) : (
              slotRes.map((res, idx) => {
                const badge = STATUS_BADGE[res.status] || STATUS_BADGE['예약 완료']
                const isLoading = loadingId === res.id
                const btnBase = {
                  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid', transition: 'opacity 0.15s',
                }

                return (
                  <div
                    key={res.id}
                    style={{
                      padding: '14px 16px',
                      borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none',
                      background: '#fff',
                    }}
                  >
                    {/* 이름 + 상태 배지 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{res.studentName} 학부모</span>
                      <span style={{
                        fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 700,
                        background: badge.background, color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}>
                        {res.status}
                      </span>
                    </div>

                    {/* 상세 정보 */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'auto 1fr',
                      gap: '5px 16px', fontSize: 13, marginBottom: 14,
                      background: '#f9fafb', borderRadius: 8, padding: '10px 12px',
                    }}>
                      <span style={{ color: '#9ca3af' }}>학번</span><span style={{ fontWeight: 500 }}>{res.studentNumber}</span>
                      <span style={{ color: '#9ca3af' }}>학생</span><span style={{ fontWeight: 500 }}>{res.studentName}</span>
                      <span style={{ color: '#9ca3af' }}>학부모</span><span>{res.parentName}</span>
                      <span style={{ color: '#9ca3af' }}>연락처</span><span>{res.parentPhone}</span>
                      <span style={{ color: '#9ca3af' }}>방식</span><span>{res.counselingMethod}</span>
                      <span style={{ color: '#9ca3af' }}>내용</span>
                      <span style={{ color: '#374151', lineHeight: 1.5 }}>{res.counselingContent}</span>
                    </div>

                    {/* ── 상태 변경 버튼 (항상 표시) ── */}
                    <div>
                      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, fontWeight: 600, letterSpacing: '0.03em' }}>
                        상태 변경
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {/* 상담 완료 버튼 */}
                        <button
                          disabled={res.status === '상담 완료' || isLoading}
                          onClick={() => handleStatus(res.id, '상담 완료', '상담 완료로 처리하겠습니까?')}
                          style={{
                            ...btnBase,
                            background: res.status === '상담 완료' ? '#d1fae5' : '#f0fdf4',
                            color: res.status === '상담 완료' ? '#065f46' : '#059669',
                            borderColor: res.status === '상담 완료' ? '#6ee7b7' : '#a7f3d0',
                            opacity: (res.status === '상담 완료' || isLoading) ? 0.55 : 1,
                            cursor: res.status === '상담 완료' ? 'default' : 'pointer',
                          }}
                        >
                          {res.status === '상담 완료' ? '✓ 상담 완료' : '상담 완료'}
                        </button>

                        {/* 예약 취소 버튼 */}
                        <button
                          disabled={res.status === '예약 취소' || isLoading}
                          onClick={() => handleStatus(res.id, '예약 취소', '예약을 취소하시겠습니까?')}
                          style={{
                            ...btnBase,
                            background: res.status === '예약 취소' ? '#fee2e2' : '#fff5f5',
                            color: res.status === '예약 취소' ? '#991b1b' : '#dc2626',
                            borderColor: res.status === '예약 취소' ? '#fca5a5' : '#fecaca',
                            opacity: (res.status === '예약 취소' || isLoading) ? 0.55 : 1,
                            cursor: res.status === '예약 취소' ? 'default' : 'pointer',
                          }}
                        >
                          {res.status === '예약 취소' ? '✕ 예약 취소됨' : '예약 취소'}
                        </button>

                        {/* 예약 완료 복원 버튼 (상담완료·취소 상태일 때만) */}
                        {res.status !== '예약 완료' && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatus(res.id, '예약 완료', '예약 완료 상태로 되돌리겠습니까?')}
                            style={{
                              ...btnBase,
                              background: '#fff',
                              color: '#6b7280',
                              borderColor: '#d1d5db',
                              opacity: isLoading ? 0.55 : 1,
                            }}
                          >
                            예약 완료로 복원
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )
      })}
    </div>
  )
}
