import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * ⚠️ 임시 보안: 클라이언트 사이드 비밀번호 비교 방식입니다.
 * 실제 운영 환경에서는 반드시 Supabase Auth, Firebase Auth, 또는
 * 별도 백엔드 인증 서버 방식으로 교체하세요.
 * 이 방식은 개발·테스트 단계에서만 사용하는 것을 권장합니다.
 */

// 비밀번호를 바꾸려면 이 값만 수정하세요.
// 실제 운영 시에는 환경변수(VITE_ADMIN_PASSWORD)로 관리하는 것을 권장합니다.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin1234'

export default function AdminLoginPage() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // 이미 로그인 상태라면 바로 /admin으로
  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === 'true') {
      navigate('/admin', { replace: true })
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 실제 운영 시 이 부분을 서버 API 호출로 교체하세요
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_authed', 'true')
        navigate('/admin', { replace: true })
      } else {
        setError('비밀번호가 올바르지 않습니다.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
        width: '100%', maxWidth: 380, border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 24,
          }}>🔐</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>관리자 로그인</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>학부모 상담 예약실 관리자 전용</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              관리자 비밀번호
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb',
                borderRadius: 8, fontSize: 14, outline: 'none',
                borderColor: error ? '#fca5a5' : '#e5e7eb',
              }}
            />
            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', marginTop: 6 }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px 0', background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 14, background: '#fef9ec', borderRadius: 8, border: '1px solid #fde68a' }}>
          <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
            ⚠️ 현재 임시 비밀번호 방식입니다. 실제 운영 시 Supabase Auth 등으로 교체를 권장합니다.
          </p>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← 학부모 예약 페이지로 돌아가기</a>
        </p>
      </div>
    </div>
  )
}
