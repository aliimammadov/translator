'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Şifrə səhvdir')
      }
    } catch {
      setError('Serverə qoşulmaq mümkün olmadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <h1 className="login-title">Admin Girişi</h1>
        <p className="login-sub">Lüğət idarəetmə panelinə daxil olun</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Şifrə</label>
            <input
              className="form-input"
              type="password"
              placeholder="Admin şifrəsini daxil edin"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-dots"><span/><span/><span/></span>
            ) : (
              'Daxil ol'
            )}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text2)' }}>
          <Link href="/" style={{ color: 'var(--accent2)' }}>← Əsas səhifəyə qayıt</Link>
        </p>
      </div>
    </div>
  )
}
