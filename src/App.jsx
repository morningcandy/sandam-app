import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ParentReservationPage from './pages/ParentReservationPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'

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

        {/* 잘못된 경로 → 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
