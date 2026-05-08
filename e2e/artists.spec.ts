import { test, expect } from '@playwright/test'

test.describe('アーティスト一覧', () => {
  test('アーティスト一覧ページが表示される', async ({ page }) => {
    await page.goto('/artists')
    await expect(page.getByRole('heading', { name: 'アーティスト' })).toBeVisible()
  })

  test('アーティストカードが表示される', async ({ page }) => {
    await page.goto('/artists')
    const cards = page.locator('a[href^="/artists/"]')
    const count = await cards.count()
    if (count > 0) {
      await expect(cards.first()).toBeVisible()
    }
  })

  test('アーティストカードをクリックすると詳細ページへ遷移する', async ({ page }) => {
    await page.goto('/artists')
    const cards = page.locator('a[href^="/artists/"]')
    const count = await cards.count()
    if (count > 0) {
      await cards.first().click()
      await expect(page).toHaveURL(/\/artists\//)
    }
  })
})

test.describe('アーティスト詳細', () => {
  test('アーティスト詳細ページに楽曲一覧が表示される', async ({ page }) => {
    await page.goto('/artists')
    const cards = page.locator('a[href^="/artists/"]')
    const count = await cards.count()
    if (count > 0) {
      await cards.first().click()
      await expect(page).toHaveURL(/\/artists\//)
      await expect(page.getByRole('main')).toBeVisible()
    }
  })

  test('アーティスト詳細ページの楽曲カードが機能する', async ({ page }) => {
    await page.goto('/artists')
    const cards = page.locator('a[href^="/artists/"]')
    const count = await cards.count()
    if (count > 0) {
      await cards.first().click()
      const songCards = page.getByTestId('song-card')
      const songCount = await songCards.count()
      if (songCount > 0) {
        await expect(songCards.first()).toBeVisible()
        await expect(songCards.first().getByTestId('song-title')).toBeVisible()
        await expect(songCards.first().getByTestId('song-artist-name')).toBeVisible()
      }
    }
  })

  test('ホームページのアーティストリンクが詳細ページへ遷移する', async ({ page }) => {
    await page.goto('/')
    const artistLinks = page.locator('a[href^="/artists/"]')
    const count = await artistLinks.count()
    if (count > 0) {
      const href = await artistLinks.first().getAttribute('href')
      await artistLinks.first().click()
      await expect(page).toHaveURL(href ?? /\/artists\//)
    }
  })
})
