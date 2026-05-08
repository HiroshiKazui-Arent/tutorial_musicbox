import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { role } = await req.json()
  if (role !== 'USER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  // 自分自身のロールは変更不可
  if (session.user?.id === id) {
    return NextResponse.json({ error: '自分自身のロールは変更できません' }, { status: 400 })
  }
  // 最後のADMINは降格不可
  if (role === 'USER') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: '最後の管理者は降格できません' }, { status: 400 })
    }
  }
  try {
    const user = await prisma.user.update({ where: { id }, data: { role } })
    return NextResponse.json(user)
  } catch (err) {
    console.error('[PUT /api/admin/users]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  // 自分自身は削除不可
  if (session.user?.id === id) {
    return NextResponse.json({ error: '自分自身を削除できません' }, { status: 400 })
  }
  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/users]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
