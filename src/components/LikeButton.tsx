'use client'

import { useOptimistic, useTransition } from 'react'
import { ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LikeButtonProps {
  songId: string
  initialIsLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}

export function LikeButton({ songId, initialIsLiked, initialCount, isLoggedIn }: LikeButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic({ isLiked: initialIsLiked, count: initialCount })
  const [, startTransition] = useTransition()

  const toggle = () => {
    if (!isLoggedIn) { alert('いいねにはログインが必要です'); return }
    startTransition(async () => {
      setOptimistic({ isLiked: !optimistic.isLiked, count: optimistic.count + (optimistic.isLiked ? -1 : 1) })
      if (optimistic.isLiked) {
        await fetch(`/api/likes/${songId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId }) })
      }
    })
  }

  return (
    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={toggle}>
      <ThumbsUp className={`w-3 h-3 ${optimistic.isLiked ? 'fill-blue-400 text-blue-400' : 'text-zinc-400'}`} />
      <span className="text-xs text-zinc-400">{optimistic.count}</span>
    </Button>
  )
}
