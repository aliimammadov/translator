import { db } from '@/lib/db'
import Link from 'next/link'
import AdminWordTable from './AdminWordTable'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  let words: any[] = []
  try {
    const wordsRes = await db.execute('SELECT * FROM words ORDER BY created_at DESC')
    words = wordsRes.rows as unknown as any[]
  } catch (error) {
    console.error("Dashboard DB error:", error)
  }

  const cats: Record<string, number> = words.reduce((acc, w) => {
    const cat = String(w.category || 'Naməlum')
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <Link href="/admin/add" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Söz Əlavə Et
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val">{words.length}</div>
          <div className="stat-label">Ümumi Söz</div>
        </div>
        {Object.entries(cats).slice(0, 3).map(([cat, count]) => (
          <div key={cat} className="stat-card">
            <div className="stat-val">{count}</div>
            <div className="stat-label">{cat}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <h3>Bütün Sözlər</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{words.length} söz</span>
        </div>
        <AdminWordTable words={words} />
      </div>
    </>
  )
}
