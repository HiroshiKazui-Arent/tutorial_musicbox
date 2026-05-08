import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'

export default async function HomePage() {
  const [recentSongs, artists] = await Promise.all([
    prisma.song.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { artist: { select: { id: true, name: true } } },
    }),
    prisma.artist.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
  ])

  const queue: SongForPlayer[] = recentSongs.map(s => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    thumbnailPath: s.thumbnailPath,
    audioPath: s.audioPath,
  }))

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">新着曲</h2>
          <Link href="/songs" className="text-sm text-zinc-400 hover:text-white">すべて見る</Link>
        </div>
        {recentSongs.length === 0 ? (
          <p className="text-zinc-400">楽曲がまだ登録されていません</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentSongs.map(song => (
              <SongCard key={song.id} song={song} queue={queue} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">アーティスト</h2>
          <Link href="/artists" className="text-sm text-zinc-400 hover:text-white">すべて見る</Link>
        </div>
        {artists.length === 0 ? (
          <p className="text-zinc-400">アーティストがまだ登録されていません</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {artists.map(artist => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-sm transition-colors">
                {artist.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
