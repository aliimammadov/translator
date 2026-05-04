import { db } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await db.execute({ sql: 'SELECT word FROM words WHERE slug = ?', args: [slug] })
  if (!res.rows.length) return { title: 'Söz tapılmadı' }
  const wordData = res.rows[0] as any
  return { title: `${wordData.word} — Lüğət AZ` }
}

export default async function WordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const wordRes = await db.execute({ sql: 'SELECT * FROM words WHERE slug = ?', args: [slug] })
  if (!wordRes.rows.length) notFound()

  const w = wordRes.rows[0] as any

  const [defs, exs, syns] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM definitions WHERE word_id = ? ORDER BY order_num', args: [w.id] }),
    db.execute({ sql: 'SELECT * FROM examples WHERE word_id = ? ORDER BY order_num', args: [w.id] }),
    db.execute({ sql: 'SELECT * FROM synonyms WHERE word_id = ?', args: [w.id] }),
  ])

  const sinonimlər = (syns.rows as unknown as { synonym: string; type: string }[]).filter(s => s.type === 'sinonim')
  const antonimler = (syns.rows as unknown as { synonym: string; type: string }[]).filter(s => s.type === 'antonim')

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">Lüğət <span>AZ</span></Link>
          <nav className="header-nav">
            <Link href="/" className="nav-link">Sözlər</Link>
            <Link href="/admin" className="btn btn-primary btn-sm">Admin Panel</Link>
          </nav>
        </div>
      </header>

      <div className="detail-wrap">
        <Link href="/" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Geri qayıt
        </Link>

        <div className="word-header">
          <h1 className="word-title">{w.word}</h1>
          <div className="word-meta">
            <span className="badge badge-cat">{w.category as string}</span>
            {w.pronunciation && <span className="word-pron">/{w.pronunciation}/</span>}
            {w.source && <span className="badge badge-src">📖 {w.source as string}</span>}
          </div>
        </div>

        {defs.rows.length > 0 && (
          <div className="section">
            <div className="section-title">Təriflər</div>
            <ol className="def-list">
              {(defs.rows as unknown as { definition: string }[]).map((d, i) => (
                <li key={i} className="def-item">
                  <span className="def-num">{i + 1}</span>
                  <span className="def-text">{d.definition}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {exs.rows.length > 0 && (
          <div className="section">
            <div className="section-title">Nümunə Cümlələr</div>
            <ul className="ex-list">
              {(exs.rows as unknown as { example: string }[]).map((ex, i) => (
                <li key={i} className="ex-item">&quot;{ex.example}&quot;</li>
              ))}
            </ul>
          </div>
        )}

        {sinonimlər.length > 0 && (
          <div className="section">
            <div className="section-title">Sinonimlər</div>
            <div className="syn-list">
              {sinonimlər.map((s, i) => (
                <Link key={i} href={`/?search=${encodeURIComponent(s.synonym)}`} className="syn-chip">
                  {s.synonym}
                </Link>
              ))}
            </div>
          </div>
        )}

        {antonimler.length > 0 && (
          <div className="section">
            <div className="section-title">Antonimlər</div>
            <div className="syn-list">
              {antonimler.map((s, i) => (
                <Link key={i} href={`/?search=${encodeURIComponent(s.synonym)}`} className="syn-chip antonym">
                  {s.synonym}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:'16px',fontSize:'0.8rem',color:'var(--text2)'}}>
          Əlavə edilib: {new Date(w.created_at as string).toLocaleDateString('az-AZ')}
        </div>
      </div>

      <footer className="footer">© {new Date().getFullYear()} Lüğət AZ</footer>
    </>
  )
}
