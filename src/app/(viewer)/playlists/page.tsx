'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ListMusic, Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Playlist {
  id: string
  name: string
  _count: { songs: number }
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/playlists').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setPlaylists(data)
    })
  }, [])

  async function createPlaylist() {
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        const pl = await res.json()
        setPlaylists(prev => [{ ...pl, _count: { songs: 0 } }, ...prev])
        setName('')
        setOpen(false)
        toast.success('再生リストを作成しました')
      } else if (res.status === 401) {
        toast.error('ログインが必要です')
        window.location.href = '/login'
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error((data as { error?: string }).error ?? '作成できませんでした')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <ListMusic className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold">再生リスト</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button data-testid="create-playlist-btn" size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0" />}>
            <Plus className="w-4 h-4" />新規作成
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">再生リストを作成</DialogTitle>
            </DialogHeader>
            <Input
              data-testid="playlist-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="リスト名"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              autoFocus
              maxLength={50}
            />
            <Button
              data-testid="playlist-create-submit"
              onClick={createPlaylist}
              disabled={!name.trim() || creating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {creating ? '作成中...' : '作成'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20">
          <ListMusic className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">再生リストがありません</p>
          <p className="text-zinc-600 text-sm mt-1">「新規作成」から作ってみましょう</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map(pl => (
            <Link key={pl.id} href={`/playlists/${pl.id}`} data-testid="playlist-item" className="group">
              <div className="bg-zinc-900 hover:bg-zinc-800 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/30 border border-zinc-800/50 hover:border-zinc-700">
                <div className="aspect-square bg-gradient-to-br from-violet-900/40 to-zinc-800 flex items-center justify-center">
                  <Music2 className="w-10 h-10 text-violet-400/40 group-hover:text-violet-400/60 transition-colors" />
                </div>
                <div className="p-3">
                  <p className="text-white font-semibold truncate text-sm">{pl.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{pl._count.songs}曲</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
