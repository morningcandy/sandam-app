const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const path = require('path')

const app = express()
const PORT = 3001

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173']
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

// 학급 명단 (이름 → 학번 매핑)
const ROSTER_MAP = {
  '강민희': '20301', '김도연': '20302', '김미소': '20303', '김서진': '20304',
  '김서현': '20305', '김지원': '20306', '박지현': '20307', '서다애': '20308',
  '손예지': '20309', '송윤서': '20310', '신연우': '20311', '신지은': '20312',
  '신현서': '20313', '신혜연': '20314', '안안나': '20315', '염서정': '20316',
  '이서현': '20317', '이선유': '20318', '이예나': '20319', '이현정': '20320',
  '전채희': '20322', '정서연': '20323', '정아인': '20324', '조연서': '20325',
  '차예린': '20326', '최은성': '20327', '한정흔': '20329', '최민서': '20330',
}

const db = new Database(path.join(__dirname, 'sandam.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS slots (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    dayLabel TEXT,
    title TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    location TEXT DEFAULT '2교무실',
    allowedMethods TEXT DEFAULT '["대면","전화"]',
    maxReservations INTEGER DEFAULT 1,
    notice TEXT DEFAULT '',
    isSpecial INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    slotId TEXT NOT NULL,
    studentNumber TEXT NOT NULL,
    studentName TEXT NOT NULL,
    parentName TEXT NOT NULL,
    parentPhone TEXT NOT NULL,
    counselingContent TEXT,
    counselingMethod TEXT,
    status TEXT DEFAULT '예약 완료',
    createdAt TEXT,
    FOREIGN KEY (slotId) REFERENCES slots(id)
  );
`)

const INITIAL_SLOTS = [
  // ── 6월 1일 (월) ──────────────────────────────────────────
  { id: 's0601-1A', date: '2026-06-01', dayLabel: '월요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-1B', date: '2026-06-01', dayLabel: '월요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-3A', date: '2026-06-01', dayLabel: '월요일', title: '3교시 전반부', startTime: '10:20', endTime: '10:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-3B', date: '2026-06-01', dayLabel: '월요일', title: '3교시 후반부', startTime: '10:45', endTime: '11:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-4A', date: '2026-06-01', dayLabel: '월요일', title: '4교시 전반부', startTime: '12:10', endTime: '12:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-4B', date: '2026-06-01', dayLabel: '월요일', title: '4교시 후반부', startTime: '12:35', endTime: '13:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-5A', date: '2026-06-01', dayLabel: '월요일', title: '5교시 전반부', startTime: '13:10', endTime: '13:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0601-5B', date: '2026-06-01', dayLabel: '월요일', title: '5교시 후반부', startTime: '13:35', endTime: '14:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  // ── 6월 2일 (화) ──────────────────────────────────────────
  { id: 's0602-1A', date: '2026-06-02', dayLabel: '화요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-1B', date: '2026-06-02', dayLabel: '화요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-3A', date: '2026-06-02', dayLabel: '화요일', title: '3교시 전반부', startTime: '10:20', endTime: '10:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-3B', date: '2026-06-02', dayLabel: '화요일', title: '3교시 후반부', startTime: '10:45', endTime: '11:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-6A', date: '2026-06-02', dayLabel: '화요일', title: '6교시 전반부', startTime: '14:10', endTime: '14:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0602-6B', date: '2026-06-02', dayLabel: '화요일', title: '6교시 후반부', startTime: '14:35', endTime: '15:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  // ── 6월 4일 (목) 전국연합학력평가 ──────────────────────────
  { id: 's0604-mg', date: '2026-06-04', dayLabel: '목요일', title: '전반 전화 상담', startTime: '08:10', endTime: '12:10', location: '전화 상담', allowedMethods: ['전화'], maxReservations: 3, notice: '전국연합학력평가 운영으로 인해 해당 시간대에는 전화 상담만 가능합니다. 정확한 상담 시각은 고정되지 않으며, 08:10~12:10 사이에 전화 상담이 진행됩니다.', isSpecial: true },
  { id: 's0604-ag', date: '2026-06-04', dayLabel: '목요일', title: '후반 전화 상담', startTime: '13:10', endTime: '16:00', location: '전화 상담', allowedMethods: ['전화'], maxReservations: 3, notice: '전국연합학력평가 운영으로 인해 해당 시간대에는 전화 상담만 가능합니다. 정확한 상담 시각은 고정되지 않으며, 13:10~16:00 사이에 전화 상담이 진행됩니다.', isSpecial: true },
  { id: 's0604-e1', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 1', startTime: '17:00', endTime: '17:25', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0604-e2', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 2', startTime: '17:25', endTime: '17:50', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0604-e3', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 3', startTime: '18:30', endTime: '18:55', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0604-e4', date: '2026-06-04', dayLabel: '목요일', title: '추가 상담 4', startTime: '18:55', endTime: '19:20', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  // ── 6월 5일 (금) ──────────────────────────────────────────
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
  { id: 's0610-1A', date: '2026-06-10', dayLabel: '수요일', title: '1교시 전반부', startTime: '08:20', endTime: '08:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-1B', date: '2026-06-10', dayLabel: '수요일', title: '1교시 후반부', startTime: '08:45', endTime: '09:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-2A', date: '2026-06-10', dayLabel: '수요일', title: '2교시 전반부', startTime: '09:20', endTime: '09:45', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-2B', date: '2026-06-10', dayLabel: '수요일', title: '2교시 후반부', startTime: '09:45', endTime: '10:10', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-4A', date: '2026-06-10', dayLabel: '수요일', title: '4교시 전반부', startTime: '12:10', endTime: '12:35', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
  { id: 's0610-4B', date: '2026-06-10', dayLabel: '수요일', title: '4교시 후반부', startTime: '12:35', endTime: '13:00', location: '2교무실', allowedMethods: ['대면', '전화'], maxReservations: 1, notice: '', isSpecial: false },
]

function seedSlots() {
  const { cnt } = db.prepare('SELECT COUNT(*) as cnt FROM slots').get()
  if (cnt > 0) return
  const insert = db.prepare(`
    INSERT OR IGNORE INTO slots
    (id, date, dayLabel, title, startTime, endTime, location, allowedMethods, maxReservations, notice, isSpecial)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  db.transaction(() => {
    for (const s of INITIAL_SLOTS) {
      insert.run(s.id, s.date, s.dayLabel, s.title, s.startTime, s.endTime,
        s.location, JSON.stringify(s.allowedMethods), s.maxReservations, s.notice || '', s.isSpecial ? 1 : 0)
    }
  })()
}

seedSlots()

// config 기본값 삽입 (openAt: null = 제한 없음)
db.prepare("INSERT OR IGNORE INTO config (key, value) VALUES ('openAt', NULL)").run()

// ── config 조회 ──────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  const row = db.prepare("SELECT value FROM config WHERE key = 'openAt'").get()
  res.json({ openAt: row ? row.value : null })
})

// ── config 업데이트 ──────────────────────────────────────────
app.put('/api/config', (req, res) => {
  const { openAt } = req.body
  db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('openAt', ?)").run(openAt ?? null)
  res.json({ success: true })
})

// ── 슬롯 조회 ────────────────────────────────────────────────
app.get('/api/slots', (req, res) => {
  const { date } = req.query
  const rows = date
    ? db.prepare('SELECT * FROM slots WHERE date = ? ORDER BY startTime').all(date)
    : db.prepare('SELECT * FROM slots ORDER BY date, startTime').all()

  const countStmt = db.prepare(
    `SELECT COUNT(*) as cnt FROM reservations WHERE slotId = ? AND status != '예약 취소'`
  )
  res.json(rows.map(s => ({
    ...s,
    allowedMethods: JSON.parse(s.allowedMethods),
    isSpecial: Boolean(s.isSpecial),
    activeCount: countStmt.get(s.id).cnt,
  })))
})

// ── 슬롯 추가 ────────────────────────────────────────────────
app.post('/api/slots', (req, res) => {
  const s = req.body
  try {
    db.prepare(`
      INSERT INTO slots (id, date, dayLabel, title, startTime, endTime, location, allowedMethods, maxReservations, notice, isSpecial)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(s.id, s.date, s.dayLabel, s.title, s.startTime, s.endTime,
      s.location, JSON.stringify(s.allowedMethods), s.maxReservations, s.notice || '', s.isSpecial ? 1 : 0)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── 슬롯 삭제 ────────────────────────────────────────────────
app.delete('/api/slots/:id', (req, res) => {
  db.prepare('DELETE FROM slots WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ── 예약 조회 ────────────────────────────────────────────────
app.get('/api/reservations', (req, res) => {
  const { date, studentNumber, studentName } = req.query

  // 이름 + 학부모 전화번호 → 내 예약 확인 (두 가지 모두 일치해야)
  if (studentName && parentPhone) {
    const rows = db.prepare(`
      SELECT r.*, s.date, s.title, s.startTime, s.endTime, s.location, s.dayLabel
      FROM reservations r
      JOIN slots s ON r.slotId = s.id
      WHERE r.studentName = ? AND r.parentPhone = ?
      ORDER BY r.createdAt DESC
    `).all(studentName, parentPhone)
    return res.json(rows)
  }

  if (studentName) {
    // 이름만 있을 경우 (내부용 — 전화번호 없으면 빈 배열 반환으로 보안 강화)
    return res.json([])
  }

  if (studentNumber) {
    const rows = db.prepare(`
      SELECT r.*, s.date, s.title, s.startTime, s.endTime, s.location, s.dayLabel
      FROM reservations r
      JOIN slots s ON r.slotId = s.id
      WHERE r.studentNumber = ?
      ORDER BY r.createdAt DESC
    `).all(studentNumber)
    return res.json(rows)
  }

  if (date) {
    const slotIds = db.prepare('SELECT id FROM slots WHERE date = ?').all(date).map(s => s.id)
    if (slotIds.length === 0) return res.json([])
    const ph = slotIds.map(() => '?').join(',')
    return res.json(
      db.prepare(`SELECT * FROM reservations WHERE slotId IN (${ph}) ORDER BY createdAt`).all(...slotIds)
    )
  }

  // 파라미터 없음 → 전체 조회 (슬롯 정보 JOIN 포함)
  res.json(db.prepare(`
    SELECT r.*, s.date, s.title, s.startTime, s.endTime, s.location, s.dayLabel
    FROM reservations r
    LEFT JOIN slots s ON r.slotId = s.id
    ORDER BY r.createdAt DESC
  `).all())
})

// ── 예약 영구 삭제 ────────────────────────────────────────────
app.delete('/api/reservations/:id', (req, res) => {
  db.prepare('DELETE FROM reservations WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ── 예약 등록 (명단 검증 + 1인 1회 + 정원 확인, 트랜잭션) ──────
app.post('/api/reservations', (req, res) => {
  const r = req.body
  try {
    db.transaction(() => {
      // 1) 학급 명단 검증
      const officialNumber = ROSTER_MAP[r.studentName]
      if (!officialNumber) {
        throw new Error('학급 명단에 없는 학생입니다. 이름을 다시 확인해 주세요.')
      }

      // 2) 학번은 명단 기준으로 서버에서 강제 설정 (클라이언트 입력 무시)
      r.studentNumber = officialNumber

      // 3) 슬롯 존재 및 정원 확인
      const slot = db.prepare('SELECT * FROM slots WHERE id = ?').get(r.slotId)
      if (!slot) throw new Error('존재하지 않는 상담 시간입니다.')

      const { cnt } = db.prepare(
        `SELECT COUNT(*) as cnt FROM reservations WHERE slotId = ? AND status != '예약 취소'`
      ).get(r.slotId)
      if (cnt >= slot.maxReservations) throw new Error('해당 시간대는 이미 예약이 마감되었습니다.')

      // 4) 전체 기간 통틀어 1인 1회 제한 (취소 이력은 재신청 허용)
      const existing = db.prepare(
        `SELECT id FROM reservations WHERE studentNumber = ? AND status != '예약 취소'`
      ).get(r.studentNumber)
      if (existing) throw new Error('이미 상담을 신청하셨습니다. 학생 1인당 1회만 신청 가능합니다.')

      db.prepare(`
        INSERT INTO reservations (id, slotId, studentNumber, studentName, parentName, parentPhone, counselingContent, counselingMethod, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '예약 완료', ?)
      `).run(r.id, r.slotId, r.studentNumber, r.studentName, r.parentName,
        r.parentPhone, r.counselingContent, r.counselingMethod, new Date().toISOString())
    })()
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// ── 예약 상태 변경 ───────────────────────────────────────────
app.patch('/api/reservations/:id', (req, res) => {
  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ success: true })
})

app.listen(PORT, () => console.log(`Sandam API server → http://localhost:${PORT}`))
