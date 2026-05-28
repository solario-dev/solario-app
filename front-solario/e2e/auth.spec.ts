import { test, expect } from '@playwright/test'

test('successful login redirects to /dashboard', async ({ page }) => {
  await page.route('**/api/users/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'e2e-test-token',
        user: {
          id: 'usr-e2e-1',
          username: 'TestPilot',
          email: 'pilot@test.com',
          role: 'User',
          level: 1,
          credits: 0,
          quizzesCompleted: 0,
          wins: 0,
          conqueredPlanets: [],
          inventory: [],
          equippedSkin: 'default',
        },
      }),
    })
  })

  await page.route('**/simulations/state', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.goto('/login')

  await page.fill('input[type="email"]', 'pilot@test.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
