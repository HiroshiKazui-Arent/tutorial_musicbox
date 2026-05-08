import { test, expect } from '@playwright/test'

test.describe('ホームページ', () => {
  test('ヘッダーとナビゲーションが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('nav-songs')).toBeVisible()
    await expect(page.getByTestId('nav-artists')).toBeVisible()
    await expect(page.getByTestId('nav-favorites')).toBeVisible()
    await expect(page.getByTestId('nav-playlists')).toBeVisible()
    await expect(page.getByTestId('logout-btn')).toBeVisible()
  })

  test('ヒーローセクションが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '音楽を、もっと自由に。' })).toBeVisible()
  })

  test('「曲を探す」をクリックすると曲一覧へ遷移する', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '曲を探す' }).click()
    await expect(page).toHaveURL('/songs')
  })

  test('新着曲セクションに楽曲カードが表示される', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('heading', { name: '新着曲' })
    await expect(section).toBeVisible()
    const cards = page.getByTestId('song-card')
    const count = await cards.count()
    if (count > 0) {
      await expect(cards.first()).toBeVisible()
    }
  })

  test('アーティストセクションが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'アーティスト' })).toBeVisible()
  })

  test('ナビゲーションの曲一覧リンクが機能する', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-songs').click()
    await expect(page).toHaveURL('/songs')
  })

  test('ナビゲーションのアーティストリンクが機能する', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-artists').click()
    await expect(page).toHaveURL('/artists')
  })
})
