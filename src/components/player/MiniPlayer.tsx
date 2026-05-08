'use client'

import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Volume2 } from 'lucide-react'
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
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/95 backdrop-blur-md border-t border-white/5 flex items-center px-4 z-50">
      <span className="text-zinc-600 text-sm">曲を選択して再生</span>
    </div>
  )

  const thumbnailUrl = getFileUrl(currentSong.thumbnailPath)
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/95 backdrop-blur-md border-t border-white/5 flex items-center px-4 gap-4 z-50">
      {/* 曲情報 */}
      <div className="flex items-center gap-3 w-60 flex-shrink-0 min-w-0 ml-14">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 shadow-lg">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={currentSong.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-lg">♪</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
          <p className="text-zinc-400 text-xs truncate">{currentSong.artistName}</p>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white h-8 w-8 hover:bg-white/10"
            onClick={prev}
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full"
            onClick={toggle}
          >
            {isPlaying
              ? <Pause className="w-5 h-5 fill-white" />
              : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white h-8 w-8 hover:bg-white/10"
            onClick={next}
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 hover:bg-white/10 transition-colors ${repeatMode !== 'off' ? 'text-emerald-400' : 'text-zinc-600 hover:text-white'}`}
            onClick={toggleRepeat}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </Button>
        </div>

        {/* プログレスバー */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-zinc-600 text-xs w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            className="flex-1 h-1 rounded-full cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #10b981 ${progress}%, #3f3f46 ${progress}%)`,
            }}
          />
          <span className="text-zinc-600 text-xs w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ボリューム */}
      <div className="hidden md:flex items-center gap-2 w-28 flex-shrink-0 mr-12">
        <Volume2 className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1 h-1 rounded-full cursor-pointer appearance-none"
          style={{
            background: `linear-gradient(to right, #10b981 ${volume * 100}%, #3f3f46 ${volume * 100}%)`,
          }}
        />
      </div>
    </div>
  )
}
