import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [artistCount, songCount, userCount] = await Promise.all([
    prisma.artist.count(),
    prisma.song.count(),
    prisma.user.count(),
  ])

  const cards = [
    { label: 'アーティスト', count: artistCount, href: '/admin/artists' },
    { label: '楽曲', count: songCount, href: '/admin/songs' },
    { label: 'ユーザー', count: userCount, href: '/admin/users' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, count, href }) => (
          <Link key={label} href={href} className="block bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors group">
            <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">{label}</p>
            <p className="text-3xl font-bold text-white mt-1">{count}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
