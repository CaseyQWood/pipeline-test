import { test, expect } from '@playwright/test';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const hasSupabase = SUPABASE_URL.length > 0 && !SUPABASE_URL.includes('your-project-id');

test.describe('Auth flow', () => {
  test.skip(!hasSupabase, 'Skipping: VITE_SUPABASE_URL not configured');

  test('sign up, save profile, logout, login, profile persists from cloud sync', async ({ page }) => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const profileName = `E2E Profile ${Date.now()}`;

    // Go to settings to sign up
    await page.goto('/settings');

    // Fill sign up form
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    // Wait for auth to complete
    await expect(page.getByText(/logged in|signed in|welcome/i)).toBeVisible({ timeout: 10000 });

    // Create a profile
    await page.goto('/profiles');
    await page.getByRole('button', { name: /add profile/i }).click();
    await page.locator('form input[type="text"]').first().fill(profileName);
    await page.getByRole('button', { name: /^add profile$/i }).last().click();
    await expect(page.getByText(profileName)).toBeVisible();

    // Log out
    await page.goto('/settings');
    await page.getByRole('button', { name: /log out|sign out/i }).click();

    // Clear localStorage to simulate a fresh session
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Log back in
    await page.goto('/settings');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /^log in|^sign in/i }).click();
    await expect(page.getByText(/logged in|signed in|welcome/i)).toBeVisible({ timeout: 10000 });

    // Profile should have synced from cloud
    await page.goto('/profiles');
    await expect(page.getByText(profileName)).toBeVisible({ timeout: 5000 });
  });
});
