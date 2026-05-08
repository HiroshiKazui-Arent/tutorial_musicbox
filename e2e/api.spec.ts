import { test, expect } from '@playwright/test'

/**
 * バックエンドAPIの直接テスト
 * 認証が必要なエンドポイントは page.request（ブラウザのクッキーを共有）で呼び出す
 */

test.describe('お気に入りAPI', () => {
  test('お気に入りの追加・取得・削除が正常に機能する', async ({ page }) => {
    await page.goto('/')

    const songsRes = await page.request.get('/api/songs')
    expect(songsRes.ok()).toBeTruthy()
    const body = await songsRes.json()
    // API returns { songs: [...], total, page, limit }
    const songs = body.songs ?? body
    if (!Array.isArray(songs) || songs.length === 0) { test.skip(); return }

    const songId = songs[0].id

    // お気に入り追加
    const addRes = await page.request.post('/api/favorites', {
      data: { songId },
    })
    expect([200, 201]).toContain(addRes.status())

    // お気に入り一覧取得（各要素は { songId, userId, ... } の形式）
    const listRes = await page.request.get('/api/favorites')
    expect(listRes.ok()).toBeTruthy()
    const favorites = await listRes.json()
    expect(Array.isArray(favorites)).toBeTruthy()
    const found = favorites.some((f: { songId: string }) => f.songId === songId)
    expect(found).toBeTruthy()

    // お気に入り削除
    const delRes = await page.request.delete(`/api/favorites/${songId}`)
    expect(delRes.ok()).toBeTruthy()

    // 削除後に一覧から消えている
    const afterRes = await page.request.get('/api/favorites')
    const afterFavs = await afterRes.json()
    const stillFound = afterFavs.some((f: { songId: string }) => f.songId === songId)
    expect(stillFound).toBeFalsy()
  })

  test('未認証のお気に入り追加は401を返す', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/')

    const songsRes = await page.request.get('/api/songs')
    const body = await songsRes.json()
    const songs = body.songs ?? body
    if (!Array.isArray(songs) || songs.length === 0) { await ctx.close(); test.skip(); return }

    const res = await page.request.post('/api/favorites', {
      data: { songId: songs[0].id },
    })
    expect(res.status()).toBe(401)
    await ctx.close()
  })
})

test.describe('再生リストAPI', () => {
  test('再生リストのCRUDが正常に機能する', async ({ page }) => {
    await page.goto('/')
    const name = `APIテストリスト_${Date.now()}`

    // 作成
    const createRes = await page.request.post('/api/playlists', {
      data: { name },
    })
    expect(createRes.status()).toBe(201)
    const playlist = await createRes.json()
    expect(playlist.name).toBe(name)
    const playlistId = playlist.id

    // 取得
    const getRes = await page.request.get(`/api/playlists/${playlistId}`)
    expect(getRes.ok()).toBeTruthy()
    const fetched = await getRes.json()
    expect(fetched.name).toBe(name)

    // 削除
    const delRes = await page.request.delete(`/api/playlists/${playlistId}`)
    expect(delRes.ok()).toBeTruthy()

    // 削除後は取得できない（404）
    const afterRes = await page.request.get(`/api/playlists/${playlistId}`)
    expect(afterRes.status()).toBe(404)
  })

  test('再生リストに曲を追加・削除できる', async ({ page }) => {
    await page.goto('/')

    const songsRes = await page.request.get('/api/songs')
    const songsBody = await songsRes.json()
    const songs = songsBody.songs ?? songsBody
    if (!Array.isArray(songs) || songs.length === 0) { test.skip(); return }
    const songId = songs[0].id

    const createRes = await page.request.post('/api/playlists', {
      data: { name: `曲追加APIテスト_${Date.now()}` },
    })
    const playlist = await createRes.json()
    const playlistId = playlist.id

    // 曲を追加
    const addSongRes = await page.request.post(`/api/playlists/${playlistId}/songs`, {
      data: { songId },
    })
    expect(addSongRes.status()).toBe(201)

    // 再生リストに曲が含まれている
    const getRes = await page.request.get(`/api/playlists/${playlistId}`)
    const fetched = await getRes.json()
    const hasSong = fetched.songs.some((ps: { song: { id: string } }) => ps.song.id === songId)
    expect(hasSong).toBeTruthy()

    // 曲を削除
    const delSongRes = await page.request.delete(`/api/playlists/${playlistId}/songs/${songId}`)
    expect(delSongRes.ok()).toBeTruthy()

    // クリーンアップ
    await page.request.delete(`/api/playlists/${playlistId}`)
  })

  test('空名称での再生リスト作成は拒否される', async ({ page }) => {
    await page.goto('/')
    const res = await page.request.post('/api/playlists', {
      data: { name: '' },
    })
    expect(res.status()).toBe(400)
  })

  test('未認証の再生リスト作成は401を返す', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/')
    const res = await page.request.post('/api/playlists', {
      data: { name: 'Unauthorized' },
    })
    expect(res.status()).toBe(401)
    await ctx.close()
  })
})

test.describe('アーティスト・楽曲APIの公開エンドポイント', () => {
  test('アーティスト一覧APIが正常に取得できる', async ({ page }) => {
    await page.goto('/')
    const res = await page.request.get('/api/artists')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.artists ?? data)).toBeTruthy()
  })

  test('楽曲一覧APIが正常に取得できる', async ({ page }) => {
    await page.goto('/')
    const res = await page.request.get('/api/songs')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.songs ?? data)).toBeTruthy()
  })

  test('存在しない楽曲IDは404を返す', async ({ page }) => {
    await page.goto('/')
    const res = await page.request.get('/api/songs/non-existent-id')
    expect(res.status()).toBe(404)
  })

  test('存在しないアーティストIDは404を返す', async ({ page }) => {
    await page.goto('/')
    const res = await page.request.get('/api/artists/non-existent-id')
    expect(res.status()).toBe(404)
  })
})
