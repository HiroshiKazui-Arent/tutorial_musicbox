'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ArtistFormProps {
  artist?: { id: string; name: string; bio: string | null; thumbnailPath?: string | null }
  onSuccess?: () => void
}

export function ArtistForm({ artist, onSuccess }: ArtistFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const url = artist ? `/api/admin/artists/${artist.id}` : '/api/admin/artists'
    const method = artist ? 'PUT' : 'POST'
    const res = await fetch(url, { method, body: form })
    setLoading(false)
    if (res.ok) {
      toast.success(artist ? 'アーティストを更新しました' : 'アーティストを追加しました')
      router.refresh()
      onSuccess?.()
    } else {
      toast.error('エラーが発生しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">名前 *</Label>
        <Input id="name" name="name" required defaultValue={artist?.name} data-testid="artist-name-input" className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={artist?.bio ?? ''} data-testid="artist-bio-input" className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
      <div className="space-y-2">
        <Label>サムネイル画像</Label>
        {artist?.thumbnailPath && (
          <img src={`/api/uploads/${artist.thumbnailPath}`} alt="現在のサムネイル" className="w-20 h-20 object-cover rounded" />
        )}
        <Input ref={fileRef} name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp" data-testid="artist-thumbnail-input" className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
      <Button type="submit" disabled={loading} data-testid="artist-form-submit">{loading ? '保存中...' : artist ? '更新' : '追加'}</Button>
    </form>
  )
}
