import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    console.error('DB init error:', error)
    return NextResponse.json(
      { error: 'Database initialization failed', details: String(error) },
      { status: 500 }
    )
  }
}
