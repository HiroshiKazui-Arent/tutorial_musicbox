export function getFileUrl(storedPath: string | null | undefined): string | null {
  if (!storedPath) return null
  return `/api/uploads/${storedPath.replace(/\\/g, '/')}`
}
