import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getFileUrl } from '@/lib/file-url'
import { Music2 } from 'lucide-react'

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { songs: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アーティスト</h1>
      {artists.length === 0 ? (
        <p className="text-zinc-500">アーティストがまだ登録されていません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {artists.map(artist => {
            const thumbnailUrl = getFileUrl(artist.thumbnailPath)
            return (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="group flex flex-col items-center gap-3 text-center">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 ring-2 ring-transparent group-hover:ring-emerald-500/50 transition-all duration-300 shadow-lg">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={artist.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center">
                      <Music2 className="w-12 h-12 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">{artist.name}</p>
                  <p className="text-zinc-500 text-xs">{artist._count.songs}曲</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
