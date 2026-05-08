import { prisma } from '@/lib/prisma'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'

export default async function SongsPage() {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: 'desc' },
    include: { artist: { select: { id: true, name: true } } },
  })

  const queue: SongForPlayer[] = songs.map(s => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    thumbnailPath: s.thumbnailPath,
    audioPath: s.audioPath,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">曲一覧</h1>
      {songs.length === 0 ? (
        <p className="text-zinc-400">楽曲がまだ登録されていません</p>
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
