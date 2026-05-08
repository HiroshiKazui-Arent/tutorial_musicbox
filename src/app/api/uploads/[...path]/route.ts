import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const safePath = segments.map(s => path.basename(s)).join(path.sep)
  const filePath = path.join(UPLOAD_DIR, safePath)

  try {
    const buffer = await readFile(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', mp3: 'audio/mpeg', mp4: 'audio/mp4',
      wav: 'audio/wav', ogg: 'audio/ogg',
    }
    const contentType = mimeMap[ext] ?? 'application/octet-stream'
    return new NextResponse(buffer, { headers: { 'Content-Type': contentType } })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
