import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ParentReservationPage from './pages/ParentReservationPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import ReservationForm from './components/ReservationForm'

// 관리자 인증 상태를 세션 스토리지로 관리
// TODO: 실제 운영 시 Supabase Auth / Firebase Auth 로 교체 권장
function RequireAdminAuth({ children }) {
  const isAuthed = sessionStorage.getItem('admin_authed') === 'true'
  if (!isAuthed) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 학부모 예약 페이지 */}
        <Route path="/" element={<ParentReservationPage />} />

        {/* 관리자 로그인 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* 관리자 페이지 - 인증 필요 */}
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminPage />
            </RequireAdminAuth>
          }
        />

        {/* 로컬 체험용 예약 양식 (개발 서버에서만, 저장 안 함) */}
        {import.meta.env.DEV && (
          <Route path="/dev/form" element={
            <ReservationForm
              previewMode
              slot={{ id: 'preview', date: '2026-11-02', dayLabel: '월요일', title: '2교시 전반부', startTime: '09:20', endTime: '09:45', location: '2교무실', allowedMethods: ['대면', '전화'] }}
              onClose={() => window.location.reload()}
            />
          } />
        )}

        {/* 잘못된 경로 → 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
