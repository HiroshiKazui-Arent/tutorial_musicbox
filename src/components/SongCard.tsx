'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Heart } from 'lucide-react'
import { usePlayer, SongForPlayer } from '@/contexts/PlayerContext'
import { getFileUrl } from '@/lib/file-url'
import { toast } from 'sonner'
import { AddToPlaylistMenu } from './AddToPlaylistMenu'

interface SongCardProps {
  song: {
    id: string
    title: string
    thumbnailPath: string | null
    audioPath: string
    artist: { id: string; name: string }
  }
  queue?: SongForPlayer[]
  initialFavorited?: boolean
  isLoggedIn?: boolean
}

export function SongCard({ song, queue, initialFavorited = false, isLoggedIn = false }: SongCardProps) {
  const { play } = usePlayer()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [favLoading, setFavLoading] = useState(false)

  const songForPlayer: SongForPlayer = {
    id: song.id,
    title: song.title,
    artistName: song.artist.name,
    thumbnailPath: song.thumbnailPath,
    audioPath: song.audioPath,
  }

  const thumbnailUrl = getFileUrl(song.thumbnailPath)

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    if (favLoading) return
    setFavLoading(true)
    try {
      if (favorited) {
        const res = await fetch(`/api/favorites/${song.id}`, { method: 'DELETE' })
        if (res.ok) { setFavorited(false); toast.success('お気に入りから削除しました') }
        else toast.error('削除できませんでした')
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: song.id }),
        })
        if (res.ok) { setFavorited(true); toast.success('お気に入りに追加しました') }
        else toast.error('追加できませんでした')
      }
    } finally {
      setFavLoading(false)
    }
  }

  return (
    <div data-testid="song-card" className="group relative bg-zinc-900 rounded-xl overflow-hidden transition-all duration-200 hover:bg-zinc-800 hover:shadow-xl hover:shadow-black/50">
      {/* サムネイル */}
      <div className="relative aspect-square overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={song.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center">
            <span className="text-4xl text-zinc-500">♪</span>
          </div>
        )}

        {/* ホバーオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* 再生ボタン */}
        <button
          data-testid="song-play-btn"
          aria-label={`${song.title}を再生`}
          className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 hover:bg-emerald-400 active:scale-95 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-10"
          onClick={() => play(songForPlayer, queue ?? [songForPlayer])}
        >
          <Play className="w-4 h-4 fill-black text-black ml-0.5" />
        </button>

        {/* お気に入りボタン */}
        {isLoggedIn && (
          <button
            data-testid="song-favorite-btn"
            aria-label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
              favorited
                ? 'opacity-100 bg-black/60 text-pink-500'
                : 'opacity-0 group-hover:opacity-100 bg-black/60 text-white hover:text-pink-400'
            }`}
            onClick={toggleFavorite}
            disabled={favLoading}
          >
            <Heart className={`w-4 h-4 transition-transform ${favorited ? 'fill-pink-500 scale-110' : ''}`} />
          </button>
        )}
      </div>

      {/* 情報 */}
      <div className="p-3 flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <p data-testid="song-title" className="text-white text-sm font-semibold truncate">{song.title}</p>
          <p data-testid="song-artist-name" className="text-zinc-400 text-xs truncate mt-0.5">{song.artist.name}</p>
        </div>
        {isLoggedIn && <AddToPlaylistMenu songId={song.id} />}
      </div>
    </div>
  )
}
