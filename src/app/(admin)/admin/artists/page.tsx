import { prisma } from '@/lib/prisma'
import Link from 'next/link'
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
          <div key={artist.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
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
