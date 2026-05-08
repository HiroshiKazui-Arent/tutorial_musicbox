import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ songId: z.string() })

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { song: { include: { artist: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(favorites)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const favorite = await prisma.favorite.upsert({
    where: { userId_songId: { userId: session.user.id, songId: parsed.data.songId } },
    update: {},
    create: { userId: session.user.id, songId: parsed.data.songId },
  })
  return NextResponse.json(favorite, { status: 201 })
}
