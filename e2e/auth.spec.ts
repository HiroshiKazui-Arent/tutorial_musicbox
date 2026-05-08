import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('認証', () => {
  test('正しい認証情報でログインできる', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#email').fill('user@example.com')
    await page.locator('#password').fill('user123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('logout-btn')).toBeVisible()
  })

  test('誤ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#email').fill('user@example.com')
    await page.locator('#password').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('ログアウトするとログインページへ遷移する', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#email').fill('user@example.com')
    await page.locator('#password').fill('user123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('/')
    await page.getByTestId('logout-btn').click()
    await expect(page).toHaveURL('/login')
  })

  test('未ログイン時にお気に入りページへアクセスするとリダイレクトされる', async ({ page }) => {
    await page.goto('/favorites')
    await expect(page).toHaveURL(/\/login/)
  })

  test('未ログイン時に再生リストページへアクセスするとリダイレクトされる', async ({ page }) => {
    await page.goto('/playlists')
    await expect(page).toHaveURL(/\/login/)
  })
})
