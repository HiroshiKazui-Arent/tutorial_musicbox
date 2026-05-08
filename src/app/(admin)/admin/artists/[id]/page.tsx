import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArtistForm } from '@/components/admin/ArtistForm'
import { AddSongDialog } from '@/components/admin/AddSongDialog'
import { DeleteSongButton } from './DeleteSongButton'
import { DeleteArtistButton } from '../DeleteArtistButton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Music, Pencil } from 'lucide-react'

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { songs: { orderBy: { createdAt: 'desc' } } },
  })

  if (!artist) notFound()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/admin/artists" className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">アーティスト詳細</h1>
      </div>

      {/* Artist info */}
      <div className="bg-zinc-800 rounded-lg p-6 flex items-start gap-6">
        {artist.thumbnailPath ? (
          <img
            src={`/api/uploads/${artist.thumbnailPath}`}
            alt={artist.name}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Music className="w-10 h-10 text-zinc-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-white">{artist.name}</p>
          {artist.bio && <p className="text-zinc-400 mt-1 text-sm">{artist.bio}</p>}
          <p className="text-zinc-500 text-sm mt-2">{artist.songs.length}曲</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Dialog>
            <DialogTrigger render={<Button data-testid="artist-edit-btn" variant="outline" size="sm" className="border-zinc-600 text-zinc-300 hover:text-white gap-1" />}>
              <Pencil className="w-3 h-3" />編集
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader><DialogTitle className="text-white">アーティストを編集</DialogTitle></DialogHeader>
              <ArtistForm artist={artist} />
            </DialogContent>
          </Dialog>
          <DeleteArtistButton id={artist.id} />
        </div>
      </div>

      {/* Songs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">楽曲一覧</h2>
          <AddSongDialog artistId={artist.id} />
        </div>

        <div className="space-y-2">
          {artist.songs.map(song => (
            <div key={song.id} data-testid="admin-song-item" className="flex items-center gap-4 bg-zinc-800 rounded-lg px-4 py-3">
              {song.thumbnailPath ? (
                <img
                  src={`/api/uploads/${song.thumbnailPath}`}
                  alt={song.title}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-zinc-500" />
                </div>
              )}
              <p className="flex-1 text-white font-medium">{song.title}</p>
              <DeleteSongButton id={song.id} />
            </div>
          ))}
          {artist.songs.length === 0 && (
            <p className="text-zinc-400 text-sm">楽曲がまだありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
