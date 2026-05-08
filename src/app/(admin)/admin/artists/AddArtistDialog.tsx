'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ArtistForm } from '@/components/admin/ArtistForm'

export function AddArtistDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="w-4 h-4" />追加
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader><DialogTitle className="text-white">アーティストを追加</DialogTitle></DialogHeader>
        <ArtistForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
