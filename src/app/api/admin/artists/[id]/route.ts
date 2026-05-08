import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/storage'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const formData = await req.formData()
  const name = formData.get('name') as string | null
  const thumbnail = formData.get('thumbnail') as File | null

  let thumbnailPath: string | undefined
  if (thumbnail && thumbnail.size > 0) {
    try {
      thumbnailPath = await saveFile(thumbnail, 'artists')
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 })
    }
  }

  const artist = await prisma.artist.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(thumbnailPath && { thumbnailPath }),
      ...(formData.get('bio') !== null && { bio: formData.get('bio') as string }),
    },
  })
  return NextResponse.json(artist)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.artist.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
