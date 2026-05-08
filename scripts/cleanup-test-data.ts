/**
 * E2Eテストで作成されたデータを削除するスクリプト
 * 対象: 名前が "_<13桁タイムスタンプ>" で終わるアーティスト・再生リスト、およびそれらに紐づく曲
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const UPLOADS_ROOT = path.join(process.cwd(), 'data', 'uploads')

function deleteFile(relativePath: string | null) {
  if (!relativePath) return
  const fullPath = path.join(UPLOADS_ROOT, relativePath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
    console.log('  deleted file:', relativePath)
  }
}

async function main() {
  // テストデータのパターン: "_" + 13桁の数字 (Date.now()) で終わる名前
  const TIMESTAMP_PATTERN = /_\d{13}$/

  // --- 再生リスト ---
  const allPlaylists = await prisma.playlist.findMany({ select: { id: true, name: true } })
  const testPlaylists = allPlaylists.filter(p => TIMESTAMP_PATTERN.test(p.name))
  console.log(`再生リスト: ${testPlaylists.length} 件を削除します`)
  testPlaylists.forEach(p => console.log(' ', p.name))

  // --- テストアーティスト ---
  const allArtists = await prisma.artist.findMany({
    select: { id: true, name: true, thumbnailPath: true, songs: { select: { id: true, audioPath: true, thumbnailPath: true } } },
  })
  const testArtists = allArtists.filter(a => TIMESTAMP_PATTERN.test(a.name))
  console.log(`\nアーティスト: ${testArtists.length} 件を削除します`)
  testArtists.forEach(a => {
    console.log(' ', a.name, `(曲 ${a.songs.length} 件)`)
  })

  // --- テストアーティスト配下ではない孤立テスト曲 ---
  const testArtistIds = new Set(testArtists.map(a => a.id))
  const allSongs = await prisma.song.findMany({
    select: { id: true, title: true, audioPath: true, thumbnailPath: true },
  })
  const orphanTestSongs = allSongs.filter(
    s => TIMESTAMP_PATTERN.test(s.title) && !testArtists.some(a => a.songs.some(song => song.id === s.id))
  )
  if (orphanTestSongs.length > 0) {
    console.log(`\n孤立テスト曲: ${orphanTestSongs.length} 件を削除します`)
    orphanTestSongs.forEach(s => console.log(' ', s.title))
  }

  const totalToDelete =
    testPlaylists.length + testArtists.length + testArtists.reduce((n, a) => n + a.songs.length, 0) + orphanTestSongs.length

  if (totalToDelete === 0) {
    console.log('\nテストデータは見つかりませんでした。')
    return
  }

  console.log('\n削除を実行します...')

  // 1. 再生リスト削除 (PlaylistSong は cascade)
  if (testPlaylists.length > 0) {
    await prisma.playlist.deleteMany({ where: { id: { in: testPlaylists.map(p => p.id) } } })
    console.log(`再生リスト ${testPlaylists.length} 件を削除しました`)
  }

  // 2. 孤立テスト曲削除（ファイルも）
  for (const song of orphanTestSongs) {
    deleteFile(song.audioPath)
    deleteFile(song.thumbnailPath)
  }
  if (orphanTestSongs.length > 0) {
    await prisma.song.deleteMany({ where: { id: { in: orphanTestSongs.map(s => s.id) } } })
    console.log(`孤立テスト曲 ${orphanTestSongs.length} 件を削除しました`)
  }

  // 3. テストアーティスト削除（曲・ファイルも cascade）
  for (const artist of testArtists) {
    deleteFile(artist.thumbnailPath)
    for (const song of artist.songs) {
      deleteFile(song.audioPath)
      deleteFile(song.thumbnailPath)
    }
  }
  if (testArtists.length > 0) {
    await prisma.artist.deleteMany({ where: { id: { in: testArtists.map(a => a.id) } } })
    console.log(`アーティスト ${testArtists.length} 件（関連曲含む）を削除しました`)
  }

  console.log('\n完了しました。')
}

main().catch(console.error).finally(() => prisma.$disconnect())
