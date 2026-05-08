import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const skip = (page - 1) * limit

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { artist: { select: { id: true, name: true } } },
    }),
    prisma.song.count(),
  ])

  return NextResponse.json({ songs, total, page, limit })
}
