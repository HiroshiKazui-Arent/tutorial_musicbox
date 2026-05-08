'use client'

import { useState } from 'react'
import { ListPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface Playlist {
  id: string
  name: string
  _count: { songs: number }
}

export function AddToPlaylistMenu({ songId }: { songId: string }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function loadPlaylists() {
    setLoading(true)
    try {
      const res = await fetch('/api/playlists')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setPlaylists(data)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen) loadPlaylists()
  }

  async function addToPlaylist(playlistId: string) {
    const res = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    })
    if (res.ok) {
      toast.success('再生リストに追加しました')
    } else {
      toast.error('追加できませんでした')
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        data-testid="add-to-playlist-trigger"
        className="flex-shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
        aria-label="再生リストに追加"
      >
        <ListPlus className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-48 bg-zinc-800 border-zinc-700"
        side="bottom"
        align="end"
        sideOffset={6}
      >
        <p className="px-2 py-1.5 text-xs font-medium text-zinc-400">再生リストに追加</p>
        <DropdownMenuSeparator className="bg-zinc-700" />
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="px-2 py-3 text-xs text-zinc-500 text-center">再生リストがありません</div>
        ) : (
          playlists.map(pl => (
            <DropdownMenuItem
              key={pl.id}
              data-testid="playlist-menu-item"
              className="text-white hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer justify-between"
              onClick={() => addToPlaylist(pl.id)}
            >
              <span className="truncate mr-2">{pl.name}</span>
              <span className="text-zinc-500 text-xs flex-shrink-0">{pl._count.songs}曲</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
