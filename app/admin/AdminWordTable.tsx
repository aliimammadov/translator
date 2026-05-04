'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Word = { id: number; word: string; slug: string; category: string; created_at: string }

export default function AdminWordTable({ words: initial }: { words: Word[] }) {
  const [words, setWords] = useState(initial)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: number, word: string) {
    if (!confirm(`"${word}" sözünü silmək istədiyinizə əminsiniz?`)) return
    const res = await fetch(`/api/words/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setWords(prev => prev.filter(w => w.id !== id))
    } else {
      alert('Silmə zamanı xəta baş verdi')
    }
  }

  return (
    <>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <input
          className="form-input"
          type="text"
          placeholder="Cədvəldə axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Söz</th>
            <th>Kateqoriya</th>
            <th>Tarix</th>
            <th>Əməliyyatlar</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>Söz tapılmadı</td></tr>
          ) : filtered.map(word => (
            <tr key={word.id}>
              <td>
                <Link href={`/word/${word.slug}`} target="_blank" className="td-word" style={{ color: 'var(--accent2)' }}>
                  {word.word}
                </Link>
              </td>
              <td><span className="card-badge" style={{ fontSize: '0.72rem' }}>{word.category}</span></td>
              <td>{new Date(word.created_at).toLocaleDateString('az-AZ')}</td>
              <td>
                <div className="td-actions">
                  <Link href={`/admin/edit/${word.id}`} className="btn btn-ghost btn-sm">
                    ✏️ Düzəliş
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(word.id, word.word)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
