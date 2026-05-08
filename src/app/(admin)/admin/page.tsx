import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [artistCount, songCount, userCount] = await Promise.all([
    prisma.artist.count(),
    prisma.song.count(),
    prisma.user.count(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'アーティスト', count: artistCount },
          { label: '楽曲', count: songCount },
          { label: 'ユーザー', count: userCount },
        ].map(({ label, count }) => (
          <div key={label} className="bg-zinc-800 rounded-lg p-6">
            <p className="text-zinc-400 text-sm">{label}</p>
            <p className="text-3xl font-bold text-white mt-1">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
