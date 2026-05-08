import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addSchema = z.object({ songId: z.string(), order: z.number().optional() })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const playlist = await prisma.playlist.findUnique({ where: { id } })
  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (playlist.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const entry = await prisma.playlistSong.upsert({
    where: { playlistId_songId: { playlistId: id, songId: parsed.data.songId } },
    update: {},
    create: { playlistId: id, songId: parsed.data.songId, order: parsed.data.order ?? 0 },
  })
  return NextResponse.json(entry, { status: 201 })
}
