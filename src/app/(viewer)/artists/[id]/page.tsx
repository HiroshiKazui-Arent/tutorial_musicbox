import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getFileUrl } from '@/lib/file-url'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { songs: { orderBy: { createdAt: 'desc' } } },
  })
  if (!artist) notFound()

  const queue: SongForPlayer[] = artist.songs.map(s => ({
    id: s.id,
    title: s.title,
    artistName: artist.name,
    thumbnailPath: s.thumbnailPath,
    audioPath: s.audioPath,
  }))

  const thumbnailUrl = getFileUrl(artist.thumbnailPath)

  return (
    <div>
      <div className="flex items-center gap-6 mb-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={artist.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-5xl">👤</div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          {artist.bio && <p className="text-zinc-400 mt-2">{artist.bio}</p>}
          <p className="text-zinc-500 text-sm mt-1">{artist.songs.length}曲</p>
        </div>
      </div>

      {artist.songs.length === 0 ? (
        <p className="text-zinc-400">楽曲がまだ登録されていません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artist.songs.map(song => (
            <SongCard key={song.id} song={{ ...song, artist: { id: artist.id, name: artist.name } }} queue={queue} />
          ))}
        </div>
      )}
    </div>
  )
}
