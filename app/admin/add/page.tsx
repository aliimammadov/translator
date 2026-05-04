'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['isim', 'fel', 'sifət', 'zərf', 'bağlayıcı', 'əvəzlik']

type SynEntry = { word: string; type: string }

export default function AddWordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [word, setWord] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [category, setCategory] = useState('isim')
  const [source, setSource] = useState('')
  const [definitions, setDefinitions] = useState([''])
  const [examples, setExamples] = useState([''])
  const [synonyms, setSynonyms] = useState<SynEntry[]>([{ word: '', type: 'sinonim' }])

  function addField(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter(prev => [...prev, ''])
  }

  function updateField(setter: React.Dispatch<React.SetStateAction<string[]>>, i: number, val: string) {
    setter(prev => prev.map((p, idx) => idx === i ? val : p))
  }

  function removeField(setter: React.Dispatch<React.SetStateAction<string[]>>, i: number) {
    setter(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateSyn(i: number, key: 'word' | 'type', val: string) {
    setSynonyms(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, pronunciation, category, source, definitions, examples, synonyms })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`"${word}" uğurla əlavə edildi!`)
        setTimeout(() => router.push('/admin'), 1500)
      } else {
        setError(data.error || 'Xəta baş verdi')
      }
    } catch {
      setError('Serverə qoşulmaq mümkün olmadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="breadcrumb">
            <a href="/admin">Dashboard</a>
            <span>›</span>
            <span>Söz Əlavə Et</span>
          </div>
          <h1>Yeni Söz Əlavə Et</h1>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="success-msg" style={{ marginBottom: '20px' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="form-wrap">
        <div className="form-card">
          <div className="form-card-title">Əsas Məlumat</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="word-input">Söz *</label>
              <input id="word-input" className="form-input" placeholder="məs: kitab" value={word} onChange={e => setWord(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pron-input">Tələffüz</label>
              <input id="pron-input" className="form-input" placeholder="məs: kʰɪtɑːb" value={pronunciation} onChange={e => setPronunciation(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cat-select">Kateqoriya</label>
              <select id="cat-select" className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="source-input">Mənbə</label>
              <input id="source-input" className="form-input" placeholder="məs: AzərLex" value={source} onChange={e => setSource(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-title">Təriflər *</div>
          <div className="dynamic-list">
            {definitions.map((def, i) => (
              <div key={i} className="dynamic-item">
                <textarea
                  className="form-textarea"
                  placeholder={`${i + 1}. tərif`}
                  value={def}
                  onChange={e => updateField(setDefinitions, i, e.target.value)}
                  rows={2}
                />
                {definitions.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeField(setDefinitions, i)}>×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={() => addField(setDefinitions)}>+ Tərif əlavə et</button>
        </div>

        <div className="form-card">
          <div className="form-card-title">Nümunə Cümlələr</div>
          <div className="dynamic-list">
            {examples.map((ex, i) => (
              <div key={i} className="dynamic-item">
                <input
                  className="form-input"
                  placeholder={`${i + 1}. nümunə cümlə`}
                  value={ex}
                  onChange={e => updateField(setExamples, i, e.target.value)}
                />
                {examples.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeField(setExamples, i)}>×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={() => addField(setExamples)}>+ Cümlə əlavə et</button>
        </div>

        <div className="form-card">
          <div className="form-card-title">Sinonimlər / Antonimlər</div>
          <div className="dynamic-list">
            {synonyms.map((s, i) => (
              <div key={i} className="dynamic-item syn-row">
                <input
                  className="form-input"
                  placeholder="Söz"
                  value={s.word}
                  onChange={e => updateSyn(i, 'word', e.target.value)}
                />
                <select className="form-select" value={s.type} onChange={e => updateSyn(i, 'type', e.target.value)}>
                  <option value="sinonim">Sinonim</option>
                  <option value="antonim">Antonim</option>
                </select>
                <button type="button" className="btn-remove" onClick={() => setSynonyms(prev => prev.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={() => setSynonyms(prev => [...prev, { word: '', type: 'sinonim' }])}>+ Sinonim/Antonim əlavə et</button>
        </div>

        <div className="form-actions">
          <a href="/admin" className="btn btn-ghost">Ləğv et</a>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading-dots"><span/><span/><span/></span> : '✓ Yadda saxla'}
          </button>
        </div>
      </form>
    </>
  )
}
