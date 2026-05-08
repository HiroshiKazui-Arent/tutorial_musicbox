import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-zinc-400 mb-6">ページが見つかりません</p>
      <Link href="/" className="text-blue-400 hover:underline">トップへ戻る</Link>
    </div>
  )
}
