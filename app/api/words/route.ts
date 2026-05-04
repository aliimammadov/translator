import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

function createSlug(word: string): string {
  return word
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET all words
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    let query = 'SELECT * FROM words WHERE 1=1'
    const args: string[] = []

    if (search) {
      query += ' AND word LIKE ?'
      args.push(`%${search}%`)
    }

    if (category) {
      query += ' AND category = ?'
      args.push(category)
    }

    query += ' ORDER BY word ASC'

    const result = await db.execute({ sql: query, args })
    return NextResponse.json({ words: result.rows })
  } catch (error) {
    console.error('GET /api/words error:', error)
    return NextResponse.json(
      { error: 'Sözlər yüklənərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}

// POST new word
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 })
    }

    const body = await request.json()
    const { word, pronunciation, category, source, definitions, examples, synonyms } = body

    if (!word || !definitions || definitions.length === 0) {
      return NextResponse.json(
        { error: 'Söz və ən azı bir tərif tələb olunur' },
        { status: 400 }
      )
    }

    let slug = createSlug(word)

    // Ensure unique slug
    const existing = await db.execute({
      sql: 'SELECT id FROM words WHERE slug = ?',
      args: [slug]
    })

    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now()}`
    }

    // Insert word
    const wordResult = await db.execute({
      sql: 'INSERT INTO words (word, slug, pronunciation, category, source) VALUES (?, ?, ?, ?, ?)',
      args: [word, slug, pronunciation || null, category || 'isim', source || null]
    })

    const wordId = wordResult.lastInsertRowid

    // Insert definitions
    for (let i = 0; i < definitions.length; i++) {
      if (definitions[i]?.trim()) {
        await db.execute({
          sql: 'INSERT INTO definitions (word_id, definition, order_num) VALUES (?, ?, ?)',
          args: [wordId, definitions[i].trim(), i]
        })
      }
    }

    // Insert examples
    if (examples && Array.isArray(examples)) {
      for (let i = 0; i < examples.length; i++) {
        if (examples[i]?.trim()) {
          await db.execute({
            sql: 'INSERT INTO examples (word_id, example, order_num) VALUES (?, ?, ?)',
            args: [wordId, examples[i].trim(), i]
          })
        }
      }
    }

    // Insert synonyms
    if (synonyms && Array.isArray(synonyms)) {
      for (const s of synonyms) {
        if (s?.word?.trim()) {
          await db.execute({
            sql: 'INSERT INTO synonyms (word_id, synonym, type) VALUES (?, ?, ?)',
            args: [wordId, s.word.trim(), s.type || 'sinonim']
          })
        }
      }
    }

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('POST /api/words error:', error)
    return NextResponse.json(
      { error: 'Söz əlavə edilərkən xəta baş verdi' },
      { status: 500 }
    )
  }
}
