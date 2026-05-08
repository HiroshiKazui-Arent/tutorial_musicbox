'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'

interface Playlist {
  id: string
  name: string
  _count: { songs: number }
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/playlists').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setPlaylists(data)
    })
  }, [])

  async function createPlaylist() {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const pl = await res.json()
      setPlaylists(prev => [{ ...pl, _count: { songs: 0 } }, ...prev])
      setName('')
      setOpen(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">再生リスト</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-1" />}>
            <Plus className="w-4 h-4" />新規作成
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">再生リストを作成</DialogTitle>
            </DialogHeader>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="リスト名"
              className="bg-zinc-800 border-zinc-700 text-white"
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
            />
            <Button onClick={createPlaylist} disabled={!name.trim()}>作成</Button>
          </DialogContent>
        </Dialog>
      </div>
      {playlists.length === 0 ? (
        <p className="text-zinc-400">再生リストがありません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map(pl => (
            <Link key={pl.id} href={`/playlists/${pl.id}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
                <CardContent className="p-4">
                  <p className="text-white font-medium truncate">{pl.name}</p>
                  <p className="text-zinc-400 text-sm">{pl._count.songs}曲</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
