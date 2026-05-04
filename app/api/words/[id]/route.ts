import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// GET single word with all relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const wordResult = await db.execute({
      sql: 'SELECT * FROM words WHERE id = ?',
      args: [id]
    })

    if (wordResult.rows.length === 0) {
      return NextResponse.json({ error: 'Söz tapılmadı' }, { status: 404 })
    }

    const word = wordResult.rows[0]

    const definitions = await db.execute({
      sql: 'SELECT * FROM definitions WHERE word_id = ? ORDER BY order_num ASC',
      args: [id]
    })

    const examples = await db.execute({
      sql: 'SELECT * FROM examples WHERE word_id = ? ORDER BY order_num ASC',
      args: [id]
    })

    const synonyms = await db.execute({
      sql: 'SELECT * FROM synonyms WHERE word_id = ?',
      args: [id]
    })

    return NextResponse.json({
      word: {
        ...word,
        definitions: definitions.rows,
        examples: examples.rows,
        synonyms: synonyms.rows,
      }
    })
  } catch (error) {
    console.error('GET /api/words/[id] error:', error)
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 })
  }
}

// PUT update word
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { word, pronunciation, category, source, definitions, examples, synonyms } = body

    // Update word
    await db.execute({
      sql: 'UPDATE words SET word = ?, pronunciation = ?, category = ?, source = ?, updated_at = datetime(\'now\') WHERE id = ?',
      args: [word, pronunciation || null, category || 'isim', source || null, id]
    })

    // Delete and re-insert relations
    await db.execute({ sql: 'DELETE FROM definitions WHERE word_id = ?', args: [id] })
    await db.execute({ sql: 'DELETE FROM examples WHERE word_id = ?', args: [id] })
    await db.execute({ sql: 'DELETE FROM synonyms WHERE word_id = ?', args: [id] })

    for (let i = 0; i < definitions.length; i++) {
      if (definitions[i]?.trim()) {
        await db.execute({
          sql: 'INSERT INTO definitions (word_id, definition, order_num) VALUES (?, ?, ?)',
          args: [id, definitions[i].trim(), i]
        })
      }
    }

    if (examples && Array.isArray(examples)) {
      for (let i = 0; i < examples.length; i++) {
        if (examples[i]?.trim()) {
          await db.execute({
            sql: 'INSERT INTO examples (word_id, example, order_num) VALUES (?, ?, ?)',
            args: [id, examples[i].trim(), i]
          })
        }
      }
    }

    if (synonyms && Array.isArray(synonyms)) {
      for (const s of synonyms) {
        if (s?.word?.trim()) {
          await db.execute({
            sql: 'INSERT INTO synonyms (word_id, synonym, type) VALUES (?, ?, ?)',
            args: [id, s.word.trim(), s.type || 'sinonim']
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/words/[id] error:', error)
    return NextResponse.json({ error: 'Yeniləmə zamanı xəta baş verdi' }, { status: 500 })
  }
}

// DELETE word
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 })
    }

    const { id } = await params

    await db.execute({ sql: 'DELETE FROM words WHERE id = ?', args: [id] })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/words/[id] error:', error)
    return NextResponse.json({ error: 'Silmə zamanı xəta baş verdi' }, { status: 500 })
  }
}
