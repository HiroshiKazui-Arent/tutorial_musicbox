import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads')

export type UploadCategory = 'artists' | 'songs' | 'audio'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_AUDIO_SIZE = 50 * 1024 * 1024

export function validateFile(file: File, category: UploadCategory): string | null {
  const isImage = category === 'artists' || category === 'songs'
  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE

  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type: ${file.type}`
  }
  if (file.size > maxSize) {
    return `File too large: max ${maxSize / 1024 / 1024}MB`
  }
  return null
}

export async function saveFile(file: File, category: UploadCategory): Promise<string> {
  const error = validateFile(file, category)
  if (error) throw new Error(error)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = path.extname(file.name).toLowerCase()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const dir = path.join(UPLOAD_DIR, category)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  return `${category}/${filename}`
}

export { getFileUrl } from './file-url'
