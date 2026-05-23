import React from 'react'

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cardFull: { opacity: 0.65 },
  title: { fontSize: 14, fontWeight: 600, color: '#111827' },
  time: { fontSize: 13, color: '#6b7280' },
  loc: { fontSize: 12, color: '#9ca3af' },
  badge: { display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600 },
  badgePhone: { background: '#ede9fe', color: '#5b21b6' },
  badgeBoth: { background: '#d1fae5', color: '#065f46' },
  notice: { fontSize: 12, color: '#6b7280', lineHeight: 1.6 },
  count: { fontSize: 12, color: '#9ca3af' },
  btnReserve: {
    marginTop: 4, padding: '8px 0', borderRadius: 8,
    border: '1px solid #2563eb', background: '#eff6ff',
    color: '#1d4ed8', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
  },
  btnClosed: {
    marginTop: 4, padding: '8px 0', borderRadius: 8,
    border: '1px solid #e5e7eb', background: '#f3f4f6',
    color: '#9ca3af', fontSize: 13, width: '100%', cursor: 'default',
  },
  btnPending: {
    marginTop: 4, padding: '8px 0', borderRadius: 8,
    border: '1px solid #7c3aed', background: '#f5f3ff',
    color: '#5b21b6', fontSize: 13, fontWeight: 600, width: '100%', cursor: 'default',
  },
}

export default function SlotCard({ slot, onReserve, isBeforeOpen, isAfterClose }) {
  const activeCount = slot.activeCount ?? 0
  const isFull = activeCount >= slot.maxReservations
  const allowedMethods = Array.isArray(slot.allowedMethods) ? slot.allowedMethods : []
  const isPhoneOnly = allowedMethods.length === 1 && allowedMethods[0] === '전화'

  const renderButton = () => {
    if (isBeforeOpen) {
      return <div style={styles.btnPending}>🕐 오픈 예정</div>
    }
    if (isAfterClose || isFull) {
      return <div style={styles.btnClosed}>예약 마감</div>
    }
    return (
      <button
        style={styles.btnReserve}
        onClick={() => onReserve(slot)}
        onMouseOver={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff' }}
        onMouseOut={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8' }}
      >
        예약하기
      </button>
    )
  }

  return (
    <div style={{ ...styles.card, ...((isFull || isAfterClose) ? styles.cardFull : {}) }}>
      <div style={styles.title}>{slot.title}</div>
      <div style={styles.time}>{slot.startTime} ~ {slot.endTime}</div>
      <div style={styles.loc}>{slot.location}</div>

      <span style={{ ...styles.badge, ...(isPhoneOnly ? styles.badgePhone : styles.badgeBoth) }}>
        {isPhoneOnly ? '전화 상담' : '대면 / 전화'}
      </span>

      {slot.notice && <div style={styles.notice}>{slot.notice}</div>}

      {slot.maxReservations > 1 && (
        <div style={styles.count}>예약 {activeCount} / {slot.maxReservations}명</div>
      )}

      {renderButton()}
    </div>
  )
}
