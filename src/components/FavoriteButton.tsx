'use client'

import { useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FavoriteButtonProps {
  songId: string
  initialIsFavorited: boolean
  isLoggedIn: boolean
}

export function FavoriteButton({ songId, initialIsFavorited, isLoggedIn }: FavoriteButtonProps) {
  const [optimisticFav, setOptimisticFav] = useOptimistic(initialIsFavorited)
  const [, startTransition] = useTransition()

  const toggle = () => {
    if (!isLoggedIn) { alert('お気に入りにはログインが必要です'); return }
    startTransition(async () => {
      setOptimisticFav(!optimisticFav)
      if (optimisticFav) {
        await fetch(`/api/favorites/${songId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId }) })
      }
    })
  }

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
      <Heart className={`w-4 h-4 ${optimisticFav ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`} />
    </Button>
  )
}
