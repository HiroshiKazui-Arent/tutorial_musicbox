import { test, expect } from '@playwright/test'

test.describe('再生リスト', () => {
  test('再生リストページが表示される', async ({ page }) => {
    await page.goto('/playlists')
    await expect(page.getByRole('heading', { name: '再生リスト' })).toBeVisible()
    await expect(page.getByTestId('create-playlist-btn')).toBeVisible()
  })

  test('「新規作成」ボタンをクリックするとダイアログが開く', async ({ page }) => {
    await page.goto('/playlists')
    await page.getByTestId('create-playlist-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByTestId('playlist-name-input')).toBeVisible()
  })

  test('再生リストを作成できる', async ({ page }) => {
    await page.goto('/playlists')
    await page.getByTestId('create-playlist-btn').click()

    const playlistName = `テストリスト_${Date.now()}`
    await page.getByTestId('playlist-name-input').fill(playlistName)
    await page.getByTestId('playlist-create-submit').click()

    await expect(page.getByText('再生リストを作成しました')).toBeVisible()
    await expect(page.getByText(playlistName)).toBeVisible()
  })

  test('Enterキーで再生リストを作成できる', async ({ page }) => {
    await page.goto('/playlists')
    await page.getByTestId('create-playlist-btn').click()

    const playlistName = `Enterテスト_${Date.now()}`
    await page.getByTestId('playlist-name-input').fill(playlistName)
    await page.getByTestId('playlist-name-input').press('Enter')

    await expect(page.getByText('再生リストを作成しました')).toBeVisible()
    await expect(page.getByText(playlistName)).toBeVisible()
  })

  test('作成された再生リストをクリックすると詳細ページへ遷移する', async ({ page }) => {
    await page.goto('/playlists')

    const items = page.getByTestId('playlist-item')
    const count = await items.count()

    if (count === 0) {
      await page.getByTestId('create-playlist-btn').click()
      await page.getByTestId('playlist-name-input').fill(`遷移テスト_${Date.now()}`)
      await page.getByTestId('playlist-create-submit').click()
      await page.getByText('再生リストを作成しました').waitFor({ state: 'visible' })
    }

    await page.getByTestId('playlist-item').first().click()
    await expect(page).toHaveURL(/\/playlists\//)
  })

  test('曲を再生リストに追加できる', async ({ page }) => {
    await page.goto('/playlists')
    await page.getByTestId('create-playlist-btn').click()
    const playlistName = `曲追加テスト_${Date.now()}`
    await page.getByTestId('playlist-name-input').fill(playlistName)
    await page.getByTestId('playlist-create-submit').click()
    await page.getByText('再生リストを作成しました').waitFor({ state: 'visible' })

    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    await firstCard.getByTestId('add-to-playlist-trigger').click()

    const menuItem = page.getByTestId('playlist-menu-item').filter({ hasText: playlistName })
    await expect(menuItem).toBeVisible()
    await menuItem.click()

    await expect(page.getByText('再生リストに追加しました')).toBeVisible()
  })
})
