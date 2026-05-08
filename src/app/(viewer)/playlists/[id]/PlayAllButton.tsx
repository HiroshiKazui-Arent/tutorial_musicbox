'use client'

import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlayer, SongForPlayer } from '@/contexts/PlayerContext'

export default function PlayAllButton({ queue }: { queue: SongForPlayer[] }) {
  const { play } = usePlayer()
  return (
    <Button onClick={() => play(queue[0], queue)} className="gap-2">
      <Play className="w-4 h-4 fill-current" />すべて再生
    </Button>
  )
}
