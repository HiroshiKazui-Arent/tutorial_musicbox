import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'
import PlayAllButton from './PlayAllButton'

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      songs: {
        orderBy: { order: 'asc' },
        include: { song: { include: { artist: { select: { id: true, name: true } } } } },
      },
    },
  })
  if (!playlist || playlist.userId !== session.user.id) notFound()

  const songs = playlist.songs.map(ps => ps.song)
  const queue: SongForPlayer[] = songs.map(s => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    thumbnailPath: s.thumbnailPath,
    audioPath: s.audioPath,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          <p className="text-zinc-400 text-sm">{songs.length}曲</p>
        </div>
        {songs.length > 0 && <PlayAllButton queue={queue} />}
      </div>
      {songs.length === 0 ? (
        <p className="text-zinc-400">曲が追加されていません</p>
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
