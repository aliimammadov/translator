import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditWordForm from './EditWordForm'

export default async function EditWordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const wordRes = await db.execute({ sql: 'SELECT * FROM words WHERE id = ?', args: [id] })
  if (!wordRes.rows.length) notFound()

  const w = wordRes.rows[0]
  const [defs, exs, syns] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM definitions WHERE word_id = ? ORDER BY order_num', args: [id] }),
    db.execute({ sql: 'SELECT * FROM examples WHERE word_id = ? ORDER BY order_num', args: [id] }),
    db.execute({ sql: 'SELECT * FROM synonyms WHERE word_id = ?', args: [id] }),
  ])

  const wordData = {
    id: Number(w.id),
    word: String(w.word),
    pronunciation: w.pronunciation ? String(w.pronunciation) : '',
    category: String(w.category),
    source: w.source ? String(w.source) : '',
    definitions: (defs.rows as unknown as { definition: string }[]).map(d => d.definition),
    examples: (exs.rows as unknown as { example: string }[]).map(e => e.example),
    synonyms: (syns.rows as unknown as { synonym: string; type: string }[]).map(s => ({ word: s.synonym, type: s.type })),
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="breadcrumb">
            <a href="/admin">Dashboard</a>
            <span>›</span>
            <span>Düzəliş et: {wordData.word}</span>
          </div>
          <h1>Söz Düzəlişi</h1>
        </div>
      </div>
      <EditWordForm initialData={wordData} />
    </>
  )
}
