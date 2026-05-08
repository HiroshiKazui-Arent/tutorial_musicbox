import { test, expect } from '@playwright/test'

test.describe('再生リスト詳細', () => {
  async function createPlaylist(page: import('@playwright/test').Page, name: string) {
    await page.goto('/playlists')
    await page.getByTestId('create-playlist-btn').click()
    await page.getByTestId('playlist-name-input').fill(name)
    await page.getByTestId('playlist-create-submit').click()
    await page.getByText('再生リストを作成しました').waitFor({ state: 'visible' })
  }

  test('再生リスト詳細ページが表示される', async ({ page }) => {
    const name = `詳細テスト_${Date.now()}`
    await createPlaylist(page, name)
    await page.getByTestId('playlist-item').filter({ hasText: name }).click()

    await expect(page).toHaveURL(/\/playlists\//)
    await expect(page.getByRole('heading', { name })).toBeVisible()
  })

  test('空の再生リストには空状態メッセージが表示される', async ({ page }) => {
    const name = `空テスト_${Date.now()}`
    await createPlaylist(page, name)
    await page.getByTestId('playlist-item').filter({ hasText: name }).click()

    await expect(page.getByText('曲が追加されていません')).toBeVisible()
    await expect(page.getByTestId('play-all-btn')).not.toBeVisible()
  })

  test('曲がある再生リストに「すべて再生」ボタンが表示される', async ({ page }) => {
    const playlistName = `再生テスト_${Date.now()}`
    await createPlaylist(page, playlistName)

    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    const count = await firstCard.count()
    if (count === 0) {
      test.skip()
      return
    }
    await firstCard.getByTestId('add-to-playlist-trigger').click()
    const menuItem = page.getByTestId('playlist-menu-item').filter({ hasText: playlistName })
    await expect(menuItem).toBeVisible()
    await menuItem.click()
    await page.getByText('再生リストに追加しました').waitFor()

    await page.goto('/playlists')
    await page.getByTestId('playlist-item').filter({ hasText: playlistName }).click()

    await expect(page.getByTestId('play-all-btn')).toBeVisible()
  })

  test('再生リストに追加した曲が一覧に表示される', async ({ page }) => {
    const playlistName = `曲確認テスト_${Date.now()}`
    await createPlaylist(page, playlistName)

    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    if (await firstCard.count() === 0) { test.skip(); return }

    const songTitle = await firstCard.getByTestId('song-title').textContent()
    await firstCard.getByTestId('add-to-playlist-trigger').click()
    await page.getByTestId('playlist-menu-item').filter({ hasText: playlistName }).click()
    await page.getByText('再生リストに追加しました').waitFor()

    await page.goto('/playlists')
    await page.getByTestId('playlist-item').filter({ hasText: playlistName }).click()

    if (songTitle) {
      await expect(page.getByTestId('song-title').filter({ hasText: songTitle })).toBeVisible()
    }
    await expect(page.getByTestId('song-card').first()).toBeVisible()
  })

  test('他ユーザーの再生リストへはアクセスできない', async ({ page, browser }) => {
    // 管理者ユーザーで再生リストを作成
    const adminCtx = await browser.newContext({ storageState: '.auth/admin.json' })
    const adminPage = await adminCtx.newPage()

    await adminPage.goto('/playlists')
    await adminPage.getByTestId('create-playlist-btn').click()
    const adminPlaylistName = `管理者限定リスト_${Date.now()}`
    await adminPage.getByTestId('playlist-name-input').fill(adminPlaylistName)
    await adminPage.getByTestId('playlist-create-submit').click()
    await adminPage.getByText('再生リストを作成しました').waitFor()

    const playlistLink = adminPage.getByTestId('playlist-item').filter({ hasText: adminPlaylistName })
    const href = await playlistLink.getAttribute('href')
    await adminCtx.close()

    if (!href) { test.skip(); return }

    // 一般ユーザーで管理者のプレイリストにアクセス → 404ページが表示される
    await page.goto(href)
    // Next.js の notFound() はURLを変えず 404ページを表示する
    await expect(page.getByRole('heading', { name: /404|Not Found|見つかりません/ })).toBeVisible()
  })
})
