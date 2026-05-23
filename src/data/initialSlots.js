// 2026년 6월 학부모 상담 예약 초기 슬롯 데이터
// 교사 수업 시간을 제외한 공강 교시 기준 25분 단위 (전반부/후반부)

export const INITIAL_SLOTS = [
  // ── 6월 1일 (월) ──────────────────────────────────────────
  // 수업: 2·6·7교시 / 상담가능: 1·3·4·5교시
  { id: 's0601-1A', date: '2026-06-01', dayLabel: '월요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-1B', date: '2026-06-01', dayLabel: '월요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-3A', date: '2026-06-01', dayLabel: '월요일', title: '3교시 전반부', startTime: '10:20', endTime: '10:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-3B', date: '2026-06-01', dayLabel: '월요일', title: '3교시 후반부', startTime: '10:45', endTime: '11:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-4A', date: '2026-06-01', dayLabel: '월요일', title: '4교시 전반부', startTime: '12:10', endTime: '12:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-4B', date: '2026-06-01', dayLabel: '월요일', title: '4교시 후반부', startTime: '12:35', endTime: '13:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-5A', date: '2026-06-01', dayLabel: '월요일', title: '5교시 전반부', startTime: '13:10', endTime: '13:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-5B', date: '2026-06-01', dayLabel: '월요일', title: '5교시 후반부', startTime: '13:35', endTime: '14:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },

  // ── 6월 2일 (화) ──────────────────────────────────────────
  // 수업: 2·4·5·7교시 / 상담가능: 1·3·6교시
  { id: 's0602-1A', date: '2026-06-02', dayLabel: '화요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-1B', date: '2026-06-02', dayLabel: '화요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-3A', date: '2026-06-02', dayLabel: '화요일', title: '3교시 전반부', startTime: '10:20', endTime: '10:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-3B', date: '2026-06-02', dayLabel: '화요일', title: '3교시 후반부', startTime: '10:45', endTime: '11:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-6A', date: '2026-06-02', dayLabel: '화요일', title: '6교시 전반부', startTime: '14:10', endTime: '14:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-6B', date: '2026-06-02', dayLabel: '화요일', title: '6교시 후반부', startTime: '14:35', endTime: '15:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },

  // ── 6월 3일 (수) 지방선거 → 슬롯 없음 ────────────────────

  // ── 6월 4일 (목) 전국연합학력평가 특별 운영 ──────────────
  { id: 's0604-mg', date: '2026-06-04', dayLabel: '목요일', title: '전반 전화 상담', startTime: '08:10', endTime: '12:10', location: '전화 상담', allowedMethods: ['전화'], maxReservations: 3, notice: '전국연합학력평가 운영으로 인해 해당 시간대에는 전화 상담만 가능합니다. 정확한 상담 시각은 고정되지 않으며, 08:10~12:10 사이에 전화 상담이 진행됩니다.', isSpecial: true },
  { id: 's0604-ag', date: '2026-06-04', dayLabel: '목요일', title: '후반 전화 상담', startTime: '13:10', endTime: '16:00', location: '전화 상담', allowedMethods: ['전화'], maxReservations: 3, notice: '전국연합학력평가 운영으로 인해 해당 시간대에는 전화 상담만 가능합니다. 정확한 상담 시각은 고정되지 않으며, 13:10~16:00 사이에 전화 상담이 진행됩니다.', isSpecial: true },
  { id: 's0604-e1', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 1', startTime: '17:00', endTime: '17:25', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0604-e2', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 2', startTime: '17:25', endTime: '17:50', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0604-e3', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 3', startTime: '18:30', endTime: '18:55', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0604-e4', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 4', startTime: '18:55', endTime: '19:20', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },

  // ── 6월 5일 (금) 수요일 수업 대체 → 수요일 시간표 적용 ───
  // 수요일 수업: 3·5·6·7교시 / 상담가능: 1·2·4교시
  { id: 's0605-1A', date: '2026-06-05', dayLabel: '금요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0605-1B', date: '2026-06-05', dayLabel: '금요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0605-2A', date: '2026-06-05', dayLabel: '금요일', title: '2교시 전반부', startTime: '09:20', endTime: '09:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0605-2B', date: '2026-06-05', dayLabel: '금요일', title: '2교시 후반부', startTime: '09:45', endTime: '10:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0605-4A', date: '2026-06-05', dayLabel: '금요일', title: '4교시 전반부', startTime: '12:10', endTime: '12:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0605-4B', date: '2026-06-05', dayLabel: '금요일', title: '4교시 후반부', startTime: '12:35', endTime: '13:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },

  // ── 6월 8일 (월) ──────────────────────────────────────────
  { id: 's0608-1A', date: '2026-06-08', dayLabel: '월요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-1B', date: '2026-06-08', dayLabel: '월요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-3A', date: '2026-06-08', dayLabel: '월요일', title: '3교시 전반부', startTime: '10:20', endTime: '10:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-3B', date: '2026-06-08', dayLabel: '월요일', title: '3교시 후반부', startTime: '10:45', endTime: '11:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-4A', date: '2026-06-08', dayLabel: '월요일', title: '4교시 전반부', startTime: '12:10', endTime: '12:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-4B', date: '2026-06-08', dayLabel: '월요일', title: '4교시 후반부', startTime: '12:35', endTime: '13:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-5A', date: '2026-06-08', dayLabel: '월요일', title: '5교시 전반부', startTime: '13:10', endTime: '13:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0608-5B', date: '2026-06-08', dayLabel: '월요일', title: '5교시 후반부', startTime: '13:35', endTime: '14:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },

  // ── 6월 9일 (화) ──────────────────────────────────────────
  { id: 's0609-1A', date: '2026-06-09', dayLabel: '화요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0609-1B', date: '2026-06-09', dayLabel: '화요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0609-3A', date: '2026-06-09', dayLabel: '화요일', title: '3교시 전반부', startTime: '10:20', endTime: '10:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0609-3B', date: '2026-06-09', dayLabel: '화요일', title: '3교시 후반부', startTime: '10:45', endTime: '11:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0609-6A', date: '2026-06-09', dayLabel: '화요일', title: '6교시 전반부', startTime: '14:10', endTime: '14:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0609-6B', date: '2026-06-09', dayLabel: '화요일', title: '6교시 후반부', startTime: '14:35', endTime: '15:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },

  // ── 6월 10일 (수) ─────────────────────────────────────────
  // 수업: 3·5·6·7교시 / 상담가능: 1·2·4교시
  { id: 's0610-1A', date: '2026-06-10', dayLabel: '수요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-1B', date: '2026-06-10', dayLabel: '수요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-2A', date: '2026-06-10', dayLabel: '수요일', title: '2교시 전반부', startTime: '09:20', endTime: '09:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-2B', date: '2026-06-10', dayLabel: '수요일', title: '2교시 후반부', startTime: '09:45', endTime: '10:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-4A', date: '2026-06-10', dayLabel: '수요일', title: '4교시 전반부', startTime: '12:10', endTime: '12:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-4B', date: '2026-06-10', dayLabel: '수요일', title: '4교시 후반부', startTime: '12:35', endTime: '13:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
]

// 상담 불가일 (안내 문구 포함)
export const HOLIDAY_MAP = {
  '2026-06-03': '6월 3일은 지방선거로 인해 상담 예약을 운영하지 않습니다.',
  '2026-06-06': '주말에는 상담 예약을 운영하지 않습니다.',
  '2026-06-07': '주말에는 상담 예약을 운영하지 않습니다.',
}

// 6월 4일 학력평가 안내
export const SPECIAL_DAY_NOTICE = {
  '2026-06-04': '6월 4일은 전국연합학력평가 운영으로 인해 수업 중에는 전화 상담만 가능합니다. 전반 상담과 후반 상담은 상담 시간이 고정되지 않으며, 해당 시간대 사이에 전화 상담이 진행됩니다.',
}

// 캘린더에 표시할 전체 6월 날짜 목록
export const ALL_JUNE_DATES = Array.from({ length: 30 }, (_, i) => {
  const d = i + 1
  return `2026-06-${String(d).padStart(2, '0')}`
})

// 예약 가능한 날짜 목록
export const AVAILABLE_DATES = [
  '2026-06-01', '2026-06-02', '2026-06-04', '2026-06-05',
  '2026-06-08', '2026-06-09', '2026-06-10',
]
