'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ChangeRoleButtonProps {
  id: string
  currentRole: string
  isSelf: boolean
}

export function ChangeRoleButton({ id, currentRole, isSelf }: ChangeRoleButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange() {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    setLoading(true)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(`ロールを ${newRole} に変更しました`)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? '変更に失敗しました')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading || isSelf}
      onClick={handleChange}
      className="text-xs border-zinc-600 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
    >
      {currentRole === 'ADMIN' ? 'USERに変更' : 'ADMINに変更'}
    </Button>
  )
}
