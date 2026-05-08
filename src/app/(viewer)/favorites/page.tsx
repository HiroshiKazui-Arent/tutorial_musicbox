import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'
import { Heart } from 'lucide-react'

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { song: { include: { artist: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  const songs = favorites.map(f => f.song)
  const queue: SongForPlayer[] = songs.map(s => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    thumbnailPath: s.thumbnailPath,
    audioPath: s.audioPath,
  }))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
        </div>
        <h1 className="text-2xl font-bold">お気に入り</h1>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">お気に入りの曲はまだありません</p>
          <p className="text-zinc-600 text-sm mt-1">曲カードの ♡ アイコンで追加できます</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              queue={queue}
              initialFavorited={true}
              isLoggedIn={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
