'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['isim', 'fel', 'sifət', 'zərf', 'bağlayıcı', 'əvəzlik']

type SynEntry = { word: string; type: string }

type WordData = {
  id: number; word: string; pronunciation: string; category: string; source: string
  definitions: string[]; examples: string[]; synonyms: SynEntry[]
}

export default function EditWordForm({ initialData }: { initialData: WordData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [word, setWord] = useState(initialData.word)
  const [pronunciation, setPronunciation] = useState(initialData.pronunciation)
  const [category, setCategory] = useState(initialData.category)
  const [source, setSource] = useState(initialData.source)
  const [definitions, setDefinitions] = useState(initialData.definitions.length ? initialData.definitions : [''])
  const [examples, setExamples] = useState(initialData.examples.length ? initialData.examples : [''])
  const [synonyms, setSynonyms] = useState<SynEntry[]>(initialData.synonyms.length ? initialData.synonyms : [{ word: '', type: 'sinonim' }])

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
      const res = await fetch(`/api/words/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, pronunciation, category, source, definitions, examples, synonyms })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Söz uğurla yeniləndi!')
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
      {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="success-msg" style={{ marginBottom: '20px' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="form-wrap">
        <div className="form-card">
          <div className="form-card-title">Əsas Məlumat</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Söz *</label>
              <input className="form-input" value={word} onChange={e => setWord(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tələffüz</label>
              <input className="form-input" value={pronunciation} onChange={e => setPronunciation(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Kateqoriya</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mənbə</label>
              <input className="form-input" value={source} onChange={e => setSource(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-title">Təriflər *</div>
          <div className="dynamic-list">
            {definitions.map((def, i) => (
              <div key={i} className="dynamic-item">
                <textarea className="form-textarea" value={def} onChange={e => updateField(setDefinitions, i, e.target.value)} rows={2} />
                {definitions.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeField(setDefinitions, i)}>×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={() => setDefinitions(p => [...p, ''])}>+ Tərif əlavə et</button>
        </div>

        <div className="form-card">
          <div className="form-card-title">Nümunə Cümlələr</div>
          <div className="dynamic-list">
            {examples.map((ex, i) => (
              <div key={i} className="dynamic-item">
                <input className="form-input" value={ex} onChange={e => updateField(setExamples, i, e.target.value)} />
                {examples.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeField(setExamples, i)}>×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={() => setExamples(p => [...p, ''])}>+ Cümlə əlavə et</button>
        </div>

        <div className="form-card">
          <div className="form-card-title">Sinonimlər / Antonimlər</div>
          <div className="dynamic-list">
            {synonyms.map((s, i) => (
              <div key={i} className="dynamic-item syn-row">
                <input className="form-input" value={s.word} onChange={e => updateSyn(i, 'word', e.target.value)} />
                <select className="form-select" value={s.type} onChange={e => updateSyn(i, 'type', e.target.value)}>
                  <option value="sinonim">Sinonim</option>
                  <option value="antonim">Antonim</option>
                </select>
                <button type="button" className="btn-remove" onClick={() => setSynonyms(prev => prev.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add" onClick={() => setSynonyms(p => [...p, { word: '', type: 'sinonim' }])}>+ Əlavə et</button>
        </div>

        <div className="form-actions">
          <a href="/admin" className="btn btn-ghost">Ləğv et</a>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading-dots"><span/><span/><span/></span> : '✓ Yenilə'}
          </button>
        </div>
      </form>
    </>
  )
}
