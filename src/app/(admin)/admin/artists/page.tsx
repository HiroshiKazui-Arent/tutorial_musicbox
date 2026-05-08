import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getFileUrl } from '@/lib/file-url'
import { DeleteArtistButton } from './DeleteArtistButton'
import { AddArtistDialog } from './AddArtistDialog'

export default async function AdminArtistsPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { songs: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">アーティスト管理</h1>
        <AddArtistDialog />
      </div>
      <div className="space-y-2">
        {artists.map(artist => (
          <div key={artist.id} data-testid="admin-artist-item" className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-3">
            <div className="relative w-10 h-10 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
              {artist.thumbnailPath ? (
                <Image src={getFileUrl(artist.thumbnailPath)!} alt={artist.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">♪</div>
              )}
            </div>
            <Link href={`/admin/artists/${artist.id}`} className="flex-1 min-w-0">
              <p className="text-white font-medium hover:text-zinc-300 transition-colors">{artist.name}</p>
              <p className="text-zinc-400 text-sm">{artist._count.songs}曲</p>
            </Link>
            <DeleteArtistButton id={artist.id} />
          </div>
        ))}
        {artists.length === 0 && <p className="text-zinc-400">アーティストがいません</p>}
      </div>
    </div>
  )
}
