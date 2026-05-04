import { NextRequest, NextResponse } from 'next/server'
import { createSession, destroySession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Şifrə səhvdir' },
        { status: 401 }
      )
    }

    await createSession()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Giriş zamanı xəta baş verdi' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  await destroySession()
  return NextResponse.json({ success: true })
}
