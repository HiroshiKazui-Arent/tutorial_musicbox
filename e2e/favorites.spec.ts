import { test, expect } from '@playwright/test'

test.describe('お気に入り', () => {
  test('お気に入りページが表示される', async ({ page }) => {
    await page.goto('/favorites')
    await expect(page.getByRole('heading', { name: 'お気に入り' })).toBeVisible()
  })

  test('お気に入りが空の場合、空状態メッセージが表示される', async ({ page }) => {
    await page.goto('/favorites')
    const cards = page.getByTestId('song-card')
    const count = await cards.count()
    if (count === 0) {
      await expect(page.getByText('お気に入りの曲はまだありません')).toBeVisible()
    }
  })

  test('曲一覧でお気に入りボタンをクリックするとトーストが表示される', async ({ page }) => {
    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    await firstCard.hover()
    const favBtn = firstCard.getByTestId('song-favorite-btn')
    await favBtn.waitFor({ state: 'visible' })

    const isAlreadyFavorited = await favBtn.getAttribute('aria-label') === 'お気に入りから削除'

    await favBtn.click()
    if (isAlreadyFavorited) {
      await expect(page.getByText('お気に入りから削除しました')).toBeVisible()
    } else {
      await expect(page.getByText('お気に入りに追加しました')).toBeVisible()
    }
  })

  test('お気に入りに追加した曲がお気に入りページに表示される', async ({ page }) => {
    await page.goto('/songs')
    const firstCard = page.getByTestId('song-card').first()
    const titleEl = firstCard.locator('p.text-white')
    const songTitle = await titleEl.textContent()

    await firstCard.hover()
    const favBtn = firstCard.getByTestId('song-favorite-btn')
    await favBtn.waitFor({ state: 'visible' })

    const isFavorited = await favBtn.getAttribute('aria-label') === 'お気に入りから削除'
    if (!isFavorited) {
      await favBtn.click()
      await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
    }

    await page.goto('/favorites')
    if (songTitle) {
      await expect(page.getByText(songTitle, { exact: false })).toBeVisible()
    }
  })
})
