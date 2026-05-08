import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Music2 } from 'lucide-react'

export async function Header() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <header className="bg-zinc-950/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
              <Music2 className="w-4 h-4 text-black" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">musicbox</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/songs" data-testid="nav-songs" className="text-zinc-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              曲一覧
            </Link>
            <Link href="/artists" data-testid="nav-artists" className="text-zinc-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              アーティスト
            </Link>
            {session && (
              <>
                <Link href="/favorites" data-testid="nav-favorites" className="text-zinc-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  お気に入り
                </Link>
                <Link href="/playlists" data-testid="nav-playlists" className="text-zinc-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  再生リスト
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              data-testid="nav-admin"
              className="text-zinc-500 hover:text-white text-xs transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-zinc-800 hover:border-zinc-700"
            >
              管理者モード
            </Link>
          )}
          {session ? (
            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}>
              <Button data-testid="logout-btn" variant="ghost" size="sm" type="submit" className="text-zinc-400 hover:text-white hover:bg-white/5 text-sm">
                ログアウト
              </Button>
            </form>
          ) : (
            <Link href="/login" data-testid="login-link">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 text-sm font-semibold px-4">
                ログイン
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
