import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4 gap-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">管理者</p>
        <Link href="/admin" className="text-zinc-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-zinc-800 transition-colors">ダッシュボード</Link>
        <Link href="/admin/artists" className="text-zinc-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-zinc-800 transition-colors">アーティスト管理</Link>
        <div className="mt-auto">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm px-2 py-1 rounded hover:bg-zinc-800 transition-colors block">← 閲覧モード</Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
