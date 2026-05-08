import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/storage'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const name = formData.get('name') as string
  const thumbnail = formData.get('thumbnail') as File | null

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  let thumbnailPath: string | undefined
  if (thumbnail && thumbnail.size > 0) {
    try {
      thumbnailPath = await saveFile(thumbnail, 'artists')
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 })
    }
  }

  try {
    const artist = await prisma.artist.create({
      data: { name, thumbnailPath, bio: formData.get('bio') as string | undefined },
    })
    return NextResponse.json(artist, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
