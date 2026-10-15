// 2026학년도 2학기 학부모 상담 주간(11/2~11/6) 슬롯 데이터
// 근거: 가정통신문 제103호 '상담 오픈 일정' + 2학기 시정표
// 교시당 25분 단위 (전반부/후반부). 1학기(6월) 슬롯·예약은 DB에 그대로 두고 화면에서만 제외한다.

// 달력에 표시할 연·월 (month: 1~12)
export const CALENDAR_YEAR = 2026
export const CALENDAR_MONTH = 11

// 2학기 시정표
const PERIODS = {
  1: ['08:20', '08:45', '09:10'],
  2: ['09:20', '09:45', '10:10'],
  3: ['10:20', '10:45', '11:10'],
  4: ['11:20', '11:45', '12:10'],
  5: ['13:10', '13:35', '14:00'],
  6: ['14:10', '14:35', '15:00'],
  7: ['15:10', '15:35', '16:00'],
}

// 저녁 상담 시간 (가정통신문 기준, 11/4 수요일만 운영)
const EVENING = [['17:00', '17:25'], ['17:27', '17:50'], ['18:30', '18:55'], ['18:55', '19:20']]

// 날짜별 상담 가능 교시 / 저녁 상담
const SCHEDULE = [
  { date: '2026-11-02', dayLabel: '월요일', periods: [2, 3, 4, 5], evening: [] },
  { date: '2026-11-03', dayLabel: '화요일', periods: [4, 5, 6], evening: [] },
  { date: '2026-11-04', dayLabel: '수요일', periods: [2, 4, 5, 6, 7], evening: EVENING },
  { date: '2026-11-05', dayLabel: '목요일', periods: [2, 4, 5], evening: [] },
  { date: '2026-11-06', dayLabel: '금요일', periods: [1, 2, 3, 4, 7], evening: [] },
]

const baseSlot = { location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false }

export const INITIAL_SLOTS = SCHEDULE.flatMap(({ date, dayLabel, periods, evening }) => {
  const prefix = 's' + date.slice(5).replace('-', '')
  const periodSlots = periods.flatMap(p => {
    const [start, mid, end] = PERIODS[p]
    return [
      { ...baseSlot, id: `${prefix}-${p}A`, date, dayLabel, title: `${p}교시 전반부`, startTime: start, endTime: mid },
      { ...baseSlot, id: `${prefix}-${p}B`, date, dayLabel, title: `${p}교시 후반부`, startTime: mid, endTime: end },
    ]
  })
  const eveningSlots = evening.map(([start, end], i) => (
    { ...baseSlot, id: `${prefix}-e${i + 1}`, date, dayLabel, title: `저녁 상담 ${i + 1}`, startTime: start, endTime: end }
  ))
  return [...periodSlots, ...eveningSlots]
})

// 상담 불가일 (안내 문구 포함)
export const HOLIDAY_MAP = {}

// 특별 운영일 안내 (학력평가일 등). 키가 있는 날짜는 달력에 보라색으로 표시
export const SPECIAL_DAY_NOTICE = {}

// 예약 가능한 날짜 목록
export const AVAILABLE_DATES = SCHEDULE.map(d => d.date)

// 현재 상담 기간 (이 기간 밖의 슬롯·예약은 화면·중복 확인에서 제외)
export const PERIOD_START = AVAILABLE_DATES[0]
export const PERIOD_END = AVAILABLE_DATES[AVAILABLE_DATES.length - 1]
export const isInCurrentPeriod = (date) => !!date && date >= PERIOD_START && date <= PERIOD_END
