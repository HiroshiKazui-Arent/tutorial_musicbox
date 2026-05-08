import { test, expect } from '@playwright/test'
import path from 'path'

const audioFixture = path.join(process.cwd(), 'e2e', 'fixtures', 'test-audio.wav')
const imageFixture = path.join(process.cwd(), 'e2e', 'fixtures', 'test-image.jpg')

/** アーティスト追加ダイアログを開き、dialog が表示されるまで待機 */
async function openAddArtistDialog(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.getByTestId('add-artist-btn').click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

test.describe('管理者ダッシュボード', () => {
  test('管理者モードリンクがヘッダーに表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('nav-admin')).toBeVisible()
  })

  test('ダッシュボードが表示され統計が確認できる', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible()
    await expect(page.getByText('アーティスト', { exact: true })).toBeVisible()
    await expect(page.getByText('楽曲', { exact: true })).toBeVisible()
    await expect(page.getByText('ユーザー', { exact: true })).toBeVisible()
  })

  test('管理者ナビゲーションが機能する', async ({ page }) => {
    await page.goto('/admin')
    await page.getByTestId('admin-nav-artists').click()
    await expect(page).toHaveURL('/admin/artists')
  })

  test('「閲覧モード」リンクでトップページへ戻れる', async ({ page }) => {
    await page.goto('/admin')
    await page.getByTestId('admin-view-mode-link').click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('アーティスト管理', () => {
  test('アーティスト管理ページが表示される', async ({ page }) => {
    await page.goto('/admin/artists')
    await expect(page.getByRole('heading', { name: 'アーティスト管理' })).toBeVisible()
    await expect(page.getByTestId('add-artist-btn')).toBeVisible()
  })

  test('アーティストを追加できる', async ({ page }) => {
    await page.goto('/admin/artists')
    await openAddArtistDialog(page)

    const name = `E2Eアーティスト_${Date.now()}`
    await page.getByTestId('artist-name-input').fill(name)
    await page.getByTestId('artist-bio-input').fill('E2Eテスト用のバイオ')
    await page.getByTestId('artist-form-submit').click()

    await expect(page.getByText('アーティストを追加しました')).toBeVisible()
    await expect(page.getByText(name)).toBeVisible()
  })

  test('アーティストを画像付きで追加できる', async ({ page }) => {
    await page.goto('/admin/artists')
    await openAddArtistDialog(page)

    const name = `画像テスト_${Date.now()}`
    await page.getByTestId('artist-name-input').fill(name)
    await page.getByTestId('artist-thumbnail-input').setInputFiles(imageFixture)
    await page.getByTestId('artist-form-submit').click()

    await expect(page.getByText('アーティストを追加しました')).toBeVisible()
    await expect(page.getByText(name)).toBeVisible()
  })

  test('アーティスト詳細ページへ遷移できる', async ({ page }) => {
    await page.goto('/admin/artists')
    const items = page.getByTestId('admin-artist-item')
    const count = await items.count()
    if (count === 0) {
      await openAddArtistDialog(page)
      await page.getByTestId('artist-name-input').fill(`詳細テスト_${Date.now()}`)
      await page.getByTestId('artist-form-submit').click()
      await page.getByText('アーティストを追加しました').waitFor()
    }
    await page.getByTestId('admin-artist-item').first().locator('a').click()
    await expect(page).toHaveURL(/\/admin\/artists\//)
    await expect(page.getByRole('heading', { name: 'アーティスト詳細' })).toBeVisible()
  })

  test('アーティスト情報を編集できる', async ({ page }) => {
    await page.goto('/admin/artists')
    await openAddArtistDialog(page)
    const originalName = `編集前_${Date.now()}`
    await page.getByTestId('artist-name-input').fill(originalName)
    await page.getByTestId('artist-form-submit').click()
    await page.getByText('アーティストを追加しました').waitFor()

    await page.getByTestId('admin-artist-item').filter({ hasText: originalName }).locator('a').click()
    await expect(page).toHaveURL(/\/admin\/artists\//)

    await page.getByTestId('artist-edit-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const updatedName = `編集後_${Date.now()}`
    const nameInput = page.getByTestId('artist-name-input')
    await nameInput.clear()
    await nameInput.fill(updatedName)
    await page.getByTestId('artist-form-submit').click()

    await expect(page.getByText('アーティストを更新しました')).toBeVisible()
    await expect(page.getByText(updatedName)).toBeVisible()
  })

  test('アーティストを削除できる', async ({ page }) => {
    await page.goto('/admin/artists')
    await openAddArtistDialog(page)
    const name = `削除テスト_${Date.now()}`
    await page.getByTestId('artist-name-input').fill(name)
    await page.getByTestId('artist-form-submit').click()
    await page.getByText('アーティストを追加しました').waitFor()

    const item = page.getByTestId('admin-artist-item').filter({ hasText: name })
    await item.getByTestId('delete-artist-btn').click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByText('このアーティストと関連する全楽曲が削除されます。')).toBeVisible()
    await page.getByTestId('delete-artist-confirm').click()

    await expect(page.getByText('削除しました')).toBeVisible()
    await expect(page.getByText(name)).not.toBeVisible()
  })
})

test.describe('楽曲管理', () => {
  /** テスト用アーティストを作成して詳細ページへ移動する */
  async function createArtistAndNavigate(page: import('@playwright/test').Page, prefix: string) {
    await page.goto('/admin/artists')
    await openAddArtistDialog(page)
    const artistName = `${prefix}_${Date.now()}`
    await page.getByTestId('artist-name-input').fill(artistName)
    await page.getByTestId('artist-form-submit').click()
    await page.getByText('アーティストを追加しました').waitFor()
    await page.getByTestId('admin-artist-item').filter({ hasText: artistName }).locator('a').click()
    await expect(page).toHaveURL(/\/admin\/artists\//)
    await page.waitForLoadState('networkidle')
    return artistName
  }

  test('アーティスト詳細ページに楽曲追加ボタンが表示される', async ({ page }) => {
    await createArtistAndNavigate(page, '楽曲ボタン確認')
    await expect(page.getByTestId('add-song-btn')).toBeVisible()
  })

  test('楽曲を追加できる', async ({ page }) => {
    await createArtistAndNavigate(page, '楽曲追加テスト')
    await page.getByTestId('add-song-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const songTitle = `テスト楽曲_${Date.now()}`
    await page.getByTestId('song-title-input').fill(songTitle)
    await page.getByTestId('song-audio-input').setInputFiles(audioFixture)
    await page.getByTestId('song-form-submit').click()

    await expect(page.getByText('楽曲を追加しました')).toBeVisible()
    await expect(page.getByText(songTitle)).toBeVisible()
  })

  test('楽曲をサムネイル付きで追加できる', async ({ page }) => {
    await createArtistAndNavigate(page, 'サムネイルテスト')
    await page.getByTestId('add-song-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const songTitle = `サムネイル楽曲_${Date.now()}`
    await page.getByTestId('song-title-input').fill(songTitle)
    await page.getByTestId('song-audio-input').setInputFiles(audioFixture)
    await page.getByTestId('song-thumbnail-input').setInputFiles(imageFixture)
    await page.getByTestId('song-form-submit').click()

    await expect(page.getByText('楽曲を追加しました')).toBeVisible()
    await expect(page.getByText(songTitle)).toBeVisible()
  })

  test('楽曲追加後にダイアログが閉じる', async ({ page }) => {
    await createArtistAndNavigate(page, 'ダイアログテスト')
    await page.getByTestId('add-song-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByTestId('song-title-input').fill(`ダイアログ確認曲_${Date.now()}`)
    await page.getByTestId('song-audio-input').setInputFiles(audioFixture)
    await page.getByTestId('song-form-submit').click()

    await page.getByText('楽曲を追加しました').waitFor()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('楽曲を削除できる', async ({ page }) => {
    await createArtistAndNavigate(page, '楽曲削除テスト')
    await page.getByTestId('add-song-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const songTitle = `削除する楽曲_${Date.now()}`
    await page.getByTestId('song-title-input').fill(songTitle)
    await page.getByTestId('song-audio-input').setInputFiles(audioFixture)
    await page.getByTestId('song-form-submit').click()
    await page.getByText('楽曲を追加しました').waitFor()

    const songItem = page.getByTestId('admin-song-item').filter({ hasText: songTitle })
    await songItem.getByTestId('delete-song-btn').click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByTestId('delete-song-confirm').click()

    await expect(page.getByText('削除しました')).toBeVisible()
    await expect(page.getByText(songTitle)).not.toBeVisible()
  })
})

test.describe('管理者アクセス制御', () => {
  test('一般ユーザーは管理ページにアクセスできない', async ({ browser }) => {
    const userCtx = await browser.newContext({ storageState: '.auth/user.json' })
    const page = await userCtx.newPage()
    await page.goto('/admin')
    await expect(page).not.toHaveURL('/admin')
    await userCtx.close()
  })

  test('一般ユーザーが管理者ページへ遷移するとログインページへリダイレクトされる', async ({ browser }) => {
    const userCtx = await browser.newContext({ storageState: '.auth/user.json' })
    const page = await userCtx.newPage()
    await page.goto('/admin/artists')
    await expect(page).toHaveURL(/\/login/)
    await userCtx.close()
  })
})
