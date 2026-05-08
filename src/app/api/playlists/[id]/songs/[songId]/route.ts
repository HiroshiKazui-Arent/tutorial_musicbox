import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, songId } = await params
  const playlist = await prisma.playlist.findUnique({ where: { id } })
  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (playlist.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.playlistSong.deleteMany({ where: { playlistId: id, songId } })
  return NextResponse.json({ ok: true })
}
