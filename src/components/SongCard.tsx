'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'
import { usePlayer, SongForPlayer } from '@/contexts/PlayerContext'
import { getFileUrl } from '@/lib/file-url'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SongCardProps {
  song: {
    id: string
    title: string
    thumbnailPath: string | null
    audioPath: string
    artist: { id: string; name: string }
  }
  queue?: SongForPlayer[]
}

export function SongCard({ song, queue }: SongCardProps) {
  const { play } = usePlayer()

  const songForPlayer: SongForPlayer = {
    id: song.id,
    title: song.title,
    artistName: song.artist.name,
    thumbnailPath: song.thumbnailPath,
    audioPath: song.audioPath,
  }

  const thumbnailUrl = getFileUrl(song.thumbnailPath)

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors group">
      <CardContent className="p-3">
        <div className="relative aspect-square mb-3 rounded overflow-hidden bg-zinc-800">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={song.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <span className="text-3xl">♪</span>
            </div>
          )}
          <Button
            size="icon"
            className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={() => play(songForPlayer, queue ?? [songForPlayer])}
          >
            <Play className="w-4 h-4 fill-black text-black" />
          </Button>
        </div>
        <p className="text-white text-sm font-medium truncate">{song.title}</p>
        <p className="text-zinc-400 text-xs truncate">{song.artist.name}</p>
      </CardContent>
    </Card>
  )
}
