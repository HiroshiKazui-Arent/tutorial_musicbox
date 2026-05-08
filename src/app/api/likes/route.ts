import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ songId: z.string() })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const like = await prisma.like.upsert({
    where: { userId_songId: { userId: session.user.id, songId: parsed.data.songId } },
    update: {},
    create: { userId: session.user.id, songId: parsed.data.songId },
  })
  return NextResponse.json(like, { status: 201 })
}
