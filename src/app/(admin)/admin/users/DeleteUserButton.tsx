'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface DeleteUserButtonProps {
  id: string
  isSelf: boolean
}

export function DeleteUserButton({ id, isSelf }: DeleteUserButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('ユーザーを削除しました'); router.refresh() }
    else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? '削除に失敗しました')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="ghost" size="icon" disabled={isSelf} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-40" />
      }>
        <Trash2 className="w-4 h-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">削除の確認</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">このユーザーを削除します。関連するプレイリスト・お気に入りも削除されます。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white">キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
