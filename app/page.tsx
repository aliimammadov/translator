'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const CATEGORIES = ['Hamısı','isim','fel','sifət','zərf','bağlayıcı','əvəzlik']

type Word = {
  id: number
  word: string
  slug: string
  pronunciation: string | null
  category: string
}

type Definition = { id: number; definition: string }

type WordWithDef = Word & { definitions?: Definition[] }

export default function HomePage() {
  const [words, setWords] = useState<WordWithDef[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Hamısı')
  const [loading, setLoading] = useState(true)
  const [defs, setDefs] = useState<Record<number, string>>({})

  const fetchWords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category !== 'Hamısı') params.set('category', category)
      const res = await fetch(`/api/words?${params}`)
      const data = await res.json()
      setWords(data.words || [])
    } catch {
      setWords([])
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    const t = setTimeout(fetchWords, 300)
    return () => clearTimeout(t)
  }, [fetchWords])

  // Fetch first definition for each word
  useEffect(() => {
    const missing = words.filter(w => !defs[w.id])
    if (!missing.length) return
    missing.forEach(async (w) => {
      const res = await fetch(`/api/words/${w.id}`)
      const data = await res.json()
      const firstDef = data.word?.definitions?.[0]?.definition || ''
      setDefs(prev => ({ ...prev, [w.id]: firstDef }))
    })
  }, [words, defs])

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo">Lüğət <span>AZ</span></div>
          <nav className="header-nav">
            <Link href="/" className="nav-link active">Sözlər</Link>
            <Link href="/admin" className="btn btn-primary btn-sm">Admin Panel</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1 className="hero-title">Azərbaycan Lüğəti</h1>
        <p className="hero-sub">Sözlər, təriflər, nümunə cümlələr və çox daha çox şey kəşf edin.</p>
        <div className="search-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="search-input"
            className="search-input"
            type="text"
            placeholder="Söz axtar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </section>

      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="stats-bar">
        <span className="stats-count">{words.length}</span>
        <span>söz tapıldı</span>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="loading-dots"><span/><span/><span/></div>
        </div>
      ) : words.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p className="empty-title">Heç bir söz tapılmadı</p>
          <p className="empty-sub">Axtarışı dəyişdirməyi cəhd edin və ya admin paneldən söz əlavə edin.</p>
        </div>
      ) : (
        <div className="word-grid">
          {words.map(word => (
            <Link key={word.id} href={`/word/${word.slug}`} className="word-card">
              <div className="card-word">{word.word}</div>
              {word.pronunciation && <div className="card-pronunciation">/{word.pronunciation}/</div>}
              <span className="card-badge">{word.category}</span>
              <p className="card-def">{defs[word.id] || '...'}</p>
              <svg className="card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} Lüğət AZ — Bütün hüquqlar qorunur
      </footer>
    </>
  )
}
