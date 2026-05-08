'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export function DeleteSongButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/admin/songs/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('削除しました'); router.refresh() }
    else toast.error('削除に失敗しました')
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button data-testid="delete-song-btn" variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" />}>
        <Trash2 className="w-4 h-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">削除の確認</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">この楽曲を削除します。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white">キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} data-testid="delete-song-confirm" className="bg-red-600 hover:bg-red-700">削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
