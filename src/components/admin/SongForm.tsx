'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SongFormProps {
  artists?: { id: string; name: string }[]
  artistId?: string
  onSuccess?: () => void
}

export function SongForm({ artists, artistId: fixedArtistId, onSuccess }: SongFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const resolvedArtistId = fixedArtistId ?? selectedArtistId
    if (!resolvedArtistId) { toast.error('アーティストを選択してください'); return }
    setLoading(true)
    const form = new FormData(e.currentTarget)
    form.set('artistId', resolvedArtistId)
    const res = await fetch('/api/admin/songs', { method: 'POST', body: form })
    setLoading(false)
    if (res.ok) {
      toast.success('楽曲を追加しました')
      router.refresh()
      onSuccess?.()
    } else {
      let errorMessage = 'エラーが発生しました'
      try {
        const data = await res.json()
        errorMessage = data.error ?? errorMessage
      } catch { /* empty or non-JSON error response */ }
      toast.error(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>タイトル *</Label>
        <Input name="title" required data-testid="song-title-input" className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
      {!fixedArtistId && (
        <div className="space-y-2">
          <Label>アーティスト *</Label>
          <Select onValueChange={setSelectedArtistId}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {(artists ?? []).map(a => (
                <SelectItem key={a.id} value={a.id} className="text-white">{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>音楽ファイル * (MP3/WAV/OGG・最大50MB)</Label>
        <Input name="audio" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" required data-testid="song-audio-input" className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
      <div className="space-y-2">
        <Label>サムネイル画像（カバー画像）</Label>
        <Input name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp" data-testid="song-thumbnail-input" className="bg-zinc-800 border-zinc-700 text-white" />
      </div>
      <Button type="submit" disabled={loading} data-testid="song-form-submit">{loading ? '保存中...' : '追加'}</Button>
    </form>
  )
}
