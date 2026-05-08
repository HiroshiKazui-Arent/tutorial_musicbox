import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { AdminNavLinks } from './AdminNavLinks'

export async function AdminHeader() {
  const session = await auth()

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-white font-bold text-lg">musicbox</Link>
          <AdminNavLinks />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" data-testid="admin-view-mode-link" className="text-zinc-400 hover:text-white text-sm transition-colors">閲覧モード</Link>
          {session && (
            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}>
              <Button variant="ghost" size="sm" type="submit" className="text-zinc-400 hover:text-white">
                ログアウト
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  )
}
