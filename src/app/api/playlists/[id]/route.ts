import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedPlaylist(id: string, userId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id } })
  if (!playlist) return { error: 'Not found', status: 404 }
  if (playlist.userId !== userId) return { error: 'Forbidden', status: 403 }
  return { playlist }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const result = await getOwnedPlaylist(id, session.user.id)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      songs: {
        orderBy: { order: 'asc' },
        include: { song: { include: { artist: { select: { id: true, name: true } } } } },
      },
    },
  })
  return NextResponse.json(playlist)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const result = await getOwnedPlaylist(id, session.user.id)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  await prisma.playlist.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
