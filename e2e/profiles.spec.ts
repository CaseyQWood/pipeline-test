import { test, expect } from '@playwright/test';

test.describe('Profile persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/profiles');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('saves, persists on reload, then deletes an attack profile', async ({ page }) => {
    const profileName = `Test Attack ${Date.now()}`;

    // Navigate to profiles
    await page.goto('/profiles');

    // Click Add Profile
    await page.getByRole('button', { name: /add profile/i }).click();

    // Fill in the name (first text input in the form)
    await page.locator('form input[type="text"]').first().fill(profileName);

    // Submit the form
    await page.getByRole('button', { name: /^add profile$/i }).last().click();

    // Profile should appear in the list
    await expect(page.getByText(profileName)).toBeVisible();

    // Reload the page
    await page.reload();

    // Profile should still be there (localStorage persistence)
    await expect(page.getByText(profileName)).toBeVisible();

    // Delete the profile
    await page.getByRole('button', { name: `Delete ${profileName}` }).click();

    // Profile should be gone
    await expect(page.getByText(profileName)).not.toBeVisible();

    // localStorage should not contain the profile
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('mathhammer:attack-profiles') ??
                  localStorage.getItem('attack-profiles') ?? '[]';
      return raw;
    });
    // Either key might be used; just confirm no entry with this name
    expect(stored).not.toContain(profileName);
  });
});
