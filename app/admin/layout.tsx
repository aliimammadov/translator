import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo">Lüğət <span>AZ</span></div>
          <small style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>Admin Panel</small>
        </div>
        <nav className="sidebar-nav">
          <Link href="/admin" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </Link>
          <Link href="/admin/add" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
            </svg>
            Söz Əlavə Et
          </Link>
          <Link href="/" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Sayta Bax
          </Link>
        </nav>
        <div style={{ padding: '12px 12px 0' }}>
          <LogoutButton />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action={async () => {
      'use server'
      const { destroySession } = await import('@/lib/auth')
      const { redirect } = await import('next/navigation')
      await destroySession()
      redirect('/admin/login')
    }}>
      <button type="submit" className="sidebar-link" style={{ width: '100%', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Çıxış
      </button>
    </form>
  )
}
