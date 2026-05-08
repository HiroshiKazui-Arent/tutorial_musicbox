import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getFileUrl } from '@/lib/file-url'
import { Card, CardContent } from '@/components/ui/card'

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { songs: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アーティスト</h1>
      {artists.length === 0 ? (
        <p className="text-zinc-400">アーティストがまだ登録されていません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artists.map(artist => {
            const thumbnailUrl = getFileUrl(artist.thumbnailPath)
            return (
              <Link key={artist.id} href={`/artists/${artist.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
                  <CardContent className="p-3">
                    <div className="relative aspect-square mb-3 rounded-full overflow-hidden bg-zinc-800 mx-auto w-24">
                      {thumbnailUrl ? (
                        <Image src={thumbnailUrl} alt={artist.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-3xl">👤</div>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium truncate text-center">{artist.name}</p>
                    <p className="text-zinc-400 text-xs text-center">{artist._count.songs}曲</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
