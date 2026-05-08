import { test as setup } from '@playwright/test'
import path from 'path'

const userAuthFile = path.join(process.cwd(), '.auth/user.json')
const adminAuthFile = path.join(process.cwd(), '.auth/admin.json')

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login')
  await page.locator('#email').fill('user@example.com')
  await page.locator('#password').fill('user123')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('/')
  await page.context().storageState({ path: userAuthFile })
})

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')
  await page.locator('#email').fill('admin@example.com')
  await page.locator('#password').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('/')
  await page.context().storageState({ path: adminAuthFile })
})
