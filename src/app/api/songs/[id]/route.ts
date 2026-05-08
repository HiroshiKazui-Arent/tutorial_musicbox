import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      artist: { select: { id: true, name: true } },
      _count: { select: { likes: true } },
    },
  })
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let isLiked = false
  if (userId) {
    const like = await prisma.like.findUnique({ where: { userId_songId: { userId, songId: id } } })
    isLiked = !!like
  }

  return NextResponse.json({ ...song, likeCount: song._count.likes, isLiked })
}
