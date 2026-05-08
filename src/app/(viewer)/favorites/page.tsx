import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'

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
      <h1 className="text-2xl font-bold mb-6">お気に入り</h1>
      {songs.length === 0 ? (
        <p className="text-zinc-400">お気に入りの曲はまだありません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map(song => (
            <SongCard key={song.id} song={song} queue={queue} />
          ))}
        </div>
      )}
    </div>
  )
}
