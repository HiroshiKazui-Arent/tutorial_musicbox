'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditSongDialogProps {
  song: { id: string; title: string; artistId: string }
  artists: { id: string; name: string }[]
}

export function EditSongDialog({ song, artists }: EditSongDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(song.artistId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedArtistId) { toast.error('アーティストを選択してください'); return }
    setLoading(true)
    const form = new FormData(e.currentTarget)
    form.set('artistId', selectedArtistId)
    const res = await fetch(`/api/admin/songs/${song.id}`, { method: 'PUT', body: form })
    setLoading(false)
    if (res.ok) {
      toast.success('楽曲を更新しました')
      router.refresh()
      setOpen(false)
    } else {
      toast.error('更新に失敗しました')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10" />
      }>
        <Pencil className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>楽曲を編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>タイトル *</Label>
            <Input name="title" defaultValue={song.title} required className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label>アーティスト *</Label>
            <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {artists.map(a => (
                  <SelectItem key={a.id} value={a.id} className="text-white">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>サムネイル画像（変更する場合のみ）</Label>
            <Input name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <Button type="submit" disabled={loading}>{loading ? '保存中...' : '更新'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
