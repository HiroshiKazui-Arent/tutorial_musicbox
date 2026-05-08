'use client'

import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1 } from 'lucide-react'
import { usePlayer } from '@/contexts/PlayerContext'
import { getFileUrl } from '@/lib/file-url'
import { Button } from '@/components/ui/button'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export function MiniPlayer() {
  const { currentSong, isPlaying, repeatMode, currentTime, duration, volume, toggle, next, prev, seek, setVolume, toggleRepeat } = usePlayer()

  if (!currentSong) return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 flex items-center px-4">
      <span className="text-zinc-500 text-sm">曲を選択して再生</span>
    </div>
  )

  const thumbnailUrl = getFileUrl(currentSong.thumbnailPath)

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 gap-4 z-50">
      {/* 曲情報 */}
      <div className="flex items-center gap-3 w-64 flex-shrink-0">
        <div className="relative w-12 h-12 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={currentSong.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">♪</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-zinc-400 text-xs truncate">{currentSong.artistName}</p>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-8 w-8" onClick={prev}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white h-9 w-9 bg-white/10 hover:bg-white/20 rounded-full" onClick={toggle}>
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-8 w-8" onClick={next}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${repeatMode !== 'off' ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`}
            onClick={toggleRepeat}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-zinc-500 text-xs w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            className="flex-1 h-1 accent-white"
          />
          <span className="text-zinc-500 text-xs w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ボリューム */}
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        <span className="text-zinc-500 text-xs">🔊</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1 h-1 accent-white"
        />
      </div>
    </div>
  )
}
