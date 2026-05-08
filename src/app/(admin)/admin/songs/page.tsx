import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getFileUrl } from '@/lib/file-url'
import { EditSongDialog } from '@/components/admin/EditSongDialog'
import { AddSongDialogGlobal } from './AddSongDialogGlobal'
import { DeleteSongButton } from './DeleteSongButton'

export default async function AdminSongsPage() {
  const [songs, artists] = await Promise.all([
    prisma.song.findMany({
      orderBy: { createdAt: 'desc' },
      include: { artist: { select: { id: true, name: true } } },
    }),
    prisma.artist.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">楽曲管理</h1>
        <AddSongDialogGlobal artists={artists} />
      </div>
      <div className="space-y-2">
        {songs.map(song => (
          <div key={song.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-3">
            <div className="relative w-10 h-10 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
              {song.thumbnailPath ? (
                <Image src={getFileUrl(song.thumbnailPath)!} alt={song.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">♪</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{song.title}</p>
              <p className="text-zinc-400 text-sm truncate">{song.artist.name}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <EditSongDialog song={{ id: song.id, title: song.title, artistId: song.artist.id }} artists={artists} />
              <DeleteSongButton id={song.id} />
            </div>
          </div>
        ))}
        {songs.length === 0 && <p className="text-zinc-400">楽曲がありません</p>}
      </div>
    </div>
  )
}
