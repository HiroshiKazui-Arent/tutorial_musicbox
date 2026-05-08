'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SongForm } from './SongForm'

interface AddSongDialogProps {
  artistId: string
}

export function AddSongDialog({ artistId }: AddSongDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button data-testid="add-song-btn" size="sm" className="gap-1" />}>
        <Plus className="w-4 h-4" />楽曲を追加
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader><DialogTitle className="text-white">楽曲を追加</DialogTitle></DialogHeader>
        <SongForm artistId={artistId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
