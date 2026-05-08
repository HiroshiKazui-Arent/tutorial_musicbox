import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'
import { getFileUrl } from '@/lib/file-url'

export default async function HomePage() {
  const session = await auth()
  const isLoggedIn = !!session?.user?.id

  const [recentSongs, artists, favoritedIds] = await Promise.all([
    prisma.song.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { artist: { select: { id: true, name: true } } },
    }),
    prisma.artist.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { songs: true } } },
    }),
    session?.user?.id
      ? prisma.favorite
          .findMany({ where: { userId: session.user.id }, select: { songId: true } })
          .then(favs => new Set(favs.map(f => f.songId)))
      : Promise.resolve(new Set<string>()),
  ])

  const queue: SongForPlayer[] = recentSongs.map(s => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    thumbnailPath: s.thumbnailPath,
    audioPath: s.audioPath,
  }))

  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            音楽を、もっと自由に。
          </h1>
          <p className="text-zinc-400 text-base md:text-lg mb-6">
            お気に入りの曲を見つけて、自分だけの再生リストを作ろう
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/songs"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-full text-sm transition-colors shadow-lg shadow-emerald-500/20"
            >
              曲を探す
            </Link>
            {!isLoggedIn && (
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-colors border border-white/10"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 新着曲 */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">新着曲</h2>
          <Link href="/songs" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">
            すべて見る →
          </Link>
        </div>
        {recentSongs.length === 0 ? (
          <p className="text-zinc-500">楽曲がまだ登録されていません</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                queue={queue}
                initialFavorited={favoritedIds.has(song.id)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </section>

      {/* アーティスト */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">アーティスト</h2>
          <Link href="/artists" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">
            すべて見る →
          </Link>
        </div>
        {artists.length === 0 ? (
          <p className="text-zinc-500">アーティストがまだ登録されていません</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {artists.map(artist => {
              const thumbUrl = getFileUrl(artist.thumbnailPath)
              return (
                <Link key={artist.id} href={`/artists/${artist.id}`} className="group flex flex-col items-center gap-2 text-center">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-zinc-800 ring-2 ring-transparent group-hover:ring-emerald-500 transition-all duration-200 shadow-md">
                    {thumbUrl ? (
                      <Image src={thumbUrl} alt={artist.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xl">👤</div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 group-hover:text-white transition-colors truncate w-full">{artist.name}</p>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
