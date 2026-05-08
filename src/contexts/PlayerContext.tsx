'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

export interface SongForPlayer {
  id: string
  title: string
  artistName: string
  thumbnailPath: string | null
  audioPath: string
}

export type RepeatMode = 'off' | 'one' | 'all'

interface PlayerContextType {
  currentSong: SongForPlayer | null
  queue: SongForPlayer[]
  isPlaying: boolean
  repeatMode: RepeatMode
  currentTime: number
  duration: number
  volume: number
  play: (song: SongForPlayer, queue?: SongForPlayer[]) => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  toggleRepeat: () => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<SongForPlayer | null>(null)
  const [queue, setQueue] = useState<SongForPlayer[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play()
      } else {
        next()
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [repeatMode, queue, currentSong])

  const play = (song: SongForPlayer, newQueue?: SongForPlayer[]) => {
    setCurrentSong(song)
    if (newQueue) setQueue(newQueue)
    const audio = audioRef.current
    if (audio) {
      audio.src = `/api/uploads/${song.audioPath}`
      audio.play()
      setIsPlaying(true)
    }
  }

  const pause = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play(); setIsPlaying(true) }
  }

  const next = () => {
    if (!currentSong || queue.length === 0) return
    const idx = queue.findIndex(s => s.id === currentSong.id)
    const nextIdx = (idx + 1) % queue.length
    if (idx === queue.length - 1 && repeatMode === 'off') {
      pause()
      return
    }
    play(queue[nextIdx], queue)
  }

  const prev = () => {
    if (!currentSong || queue.length === 0) return
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return }
    const idx = queue.findIndex(s => s.id === currentSong.id)
    const prevIdx = (idx - 1 + queue.length) % queue.length
    play(queue[prevIdx], queue)
  }

  const seek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time
  }

  const setVolume = (v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const toggleRepeat = () => {
    setRepeatMode(m => m === 'off' ? 'one' : m === 'one' ? 'all' : 'off')
  }

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, isPlaying, repeatMode, currentTime, duration, volume,
      play, pause, toggle, next, prev, seek, setVolume, toggleRepeat,
    }}>
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
