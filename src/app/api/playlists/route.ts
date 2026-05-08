import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({ name: z.string().min(1).max(50) })

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const playlists = await prisma.playlist.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { songs: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(playlists)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const playlist = await prisma.playlist.create({
    data: { name: parsed.data.name, userId: session.user.id },
  })
  return NextResponse.json(playlist, { status: 201 })
}
