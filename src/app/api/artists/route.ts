import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const skip = (page - 1) * limit

  const [artists, total] = await Promise.all([
    prisma.artist.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.artist.count(),
  ])

  return NextResponse.json({ artists, total, page, limit })
}
