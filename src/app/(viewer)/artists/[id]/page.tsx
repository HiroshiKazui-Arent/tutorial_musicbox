import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getFileUrl } from '@/lib/file-url'
import { SongCard } from '@/components/SongCard'
import { SongForPlayer } from '@/contexts/PlayerContext'
import { Music2 } from 'lucide-react'

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const isLoggedIn = !!session?.user?.id

  const [artist, favoritedIds] = await Promise.all([
    prisma.artist.findUnique({
      where: { id },
      include: { songs: { orderBy: { createdAt: 'desc' } } },
    }),
    session?.user?.id
      ? prisma.favorite
          .findMany({ where: { userId: session.user.id }, select: { songId: true } })
          .then(favs => new Set(favs.map(f => f.songId)))
      : Promise.resolve(new Set<string>()),
  ])

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
      {/* アーティストヘッダー */}
      <div className="relative rounded-2xl overflow-hidden bg-zinc-900 mb-8">
        {thumbnailUrl && (
          <div className="absolute inset-0 opacity-15">
            <Image src={thumbnailUrl} alt={artist.name} fill className="object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent pointer-events-none" />
        <div className="relative flex items-end gap-6 p-8">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 shadow-2xl ring-1 ring-white/10">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={artist.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center">
                <Music2 className="w-14 h-14 text-zinc-500" />
              </div>
            )}
          </div>
          <div>
            <p className="text-zinc-400 text-sm mb-1">アーティスト</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{artist.name}</h1>
            {artist.bio && <p className="text-zinc-400 text-sm max-w-lg">{artist.bio}</p>}
            <p className="text-zinc-500 text-sm mt-2">{artist.songs.length}曲</p>
          </div>
        </div>
      </div>

      {artist.songs.length === 0 ? (
        <p className="text-zinc-500">楽曲がまだ登録されていません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artist.songs.map(song => (
            <SongCard
              key={song.id}
              song={{ ...song, artist: { id: artist.id, name: artist.name } }}
              queue={queue}
              initialFavorited={favoritedIds.has(song.id)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </div>
  )
}
