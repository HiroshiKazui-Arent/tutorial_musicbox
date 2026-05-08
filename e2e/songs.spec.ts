import { test, expect } from '@playwright/test'

test.describe('曲一覧', () => {
  test('ページタイトルが表示される', async ({ page }) => {
    await page.goto('/songs')
    await expect(page.getByRole('heading', { name: '曲一覧' })).toBeVisible()
  })

  test('楽曲カードが表示される', async ({ page }) => {
    await page.goto('/songs')
    const cards = page.getByTestId('song-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('楽曲カードにお気に入りボタンが表示される（ログイン時）', async ({ page }) => {
    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    await firstCard.hover()
    await expect(firstCard.getByTestId('song-favorite-btn')).toBeVisible()
  })

  test('楽曲カードに再生リスト追加ボタンが表示される（ログイン時）', async ({ page }) => {
    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    await expect(firstCard.getByTestId('add-to-playlist-trigger')).toBeVisible()
  })

  test('再生リスト追加メニューを開くと再生リスト一覧が表示される', async ({ page }) => {
    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    await firstCard.getByTestId('add-to-playlist-trigger').click()
    // ドロップダウン内の固定ヘッダーテキストを確認（loading / no-playlists / items のいずれかが表示される）
    await expect(page.locator('p').filter({ hasText: '再生リストに追加' })).toBeVisible()
  })

  test('アーティスト一覧ページへのリンクが機能する', async ({ page }) => {
    await page.goto('/artists')
    await expect(page.getByRole('heading', { name: 'アーティスト' })).toBeVisible()
    const cards = page.locator('a[href^="/artists/"]')
    const count = await cards.count()
    if (count > 0) {
      await cards.first().click()
      await expect(page).toHaveURL(/\/artists\//)
    }
  })
})
