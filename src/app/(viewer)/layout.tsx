import { PlayerProvider } from '@/contexts/PlayerContext'
import { Header } from '@/components/Header'
import { MiniPlayer } from '@/components/player/MiniPlayer'

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 pb-24">
          {children}
        </main>
        <MiniPlayer />
      </div>
    </PlayerProvider>
  )
}
