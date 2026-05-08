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
  const title = formData.get('title') as string
  const artistId = formData.get('artistId') as string
  const audioFile = formData.get('audio') as File | null
  const thumbnail = formData.get('thumbnail') as File | null

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  if (!artistId) return NextResponse.json({ error: 'Artist required' }, { status: 400 })
  if (!audioFile || audioFile.size === 0) return NextResponse.json({ error: 'Audio file required' }, { status: 400 })

  let audioPath: string
  try {
    audioPath = await saveFile(audioFile, 'audio')
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
  let thumbnailPath: string | undefined
  if (thumbnail && thumbnail.size > 0) {
    try {
      thumbnailPath = await saveFile(thumbnail, 'songs')
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 })
    }
  }

  const durationStr = formData.get('duration') as string | null
  const duration = durationStr ? parseInt(durationStr) : undefined

  const song = await prisma.song.create({
    data: { title, artistId, audioPath, thumbnailPath, duration },
    include: { artist: { select: { id: true, name: true } } },
  })

  return NextResponse.json(song, { status: 201 })
}
