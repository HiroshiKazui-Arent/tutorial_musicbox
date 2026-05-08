import Link from 'next/link'
import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export async function Header() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-bold text-lg">musicbox</Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/songs" className="text-zinc-400 hover:text-white text-sm transition-colors">曲一覧</Link>
            <Link href="/artists" className="text-zinc-400 hover:text-white text-sm transition-colors">アーティスト</Link>
            {session && (
              <>
                <Link href="/favorites" className="text-zinc-400 hover:text-white text-sm transition-colors">お気に入り</Link>
                <Link href="/playlists" className="text-zinc-400 hover:text-white text-sm transition-colors">再生リスト</Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-zinc-400 hover:text-white text-sm transition-colors">管理者モード</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}>
              <Button variant="ghost" size="sm" type="submit" className="text-zinc-400 hover:text-white">
                ログアウト
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">ログイン</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
