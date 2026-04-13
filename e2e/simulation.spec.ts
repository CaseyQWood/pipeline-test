import { test, expect } from '@playwright/test';

test.describe('Simulation flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('full simulation flow: quick-create profiles and run simulation', async ({ page }) => {
    await page.goto('/');

    // Wait for page to settle
    await page.waitForLoadState('networkidle');

    // Use quick-create for attack profile
    // Find the "+" button in the Attack Profile section
    const attackSection = page.locator('text=Attack Profile').first().locator('..');
    // Click the quick-create toggle button
    await attackSection.getByRole('button').first().click();

    // Fill in the attack profile name
    await page.locator('form input[type="text"]').first().fill('Test Space Marines');

    // Submit attack form
    await page.getByRole('button', { name: /^add profile$/i }).last().click();

    // Verify attack profile is selected (the name appears under the header)
    await expect(page.getByText('Test Space Marines')).toBeVisible();

    // Now do defense quick-create
    const defenseSection = page.locator('text=Defense Profile').first().locator('..');
    await defenseSection.getByRole('button').first().click();

    await page.locator('form input[type="text"]').last().fill('Test Orks');

    await page.getByRole('button', { name: /^add profile$/i }).last().click();

    await expect(page.getByText('Test Orks')).toBeVisible();

    // Run simulation
    await page.getByRole('button', { name: /^simulate$/i }).click();

    // Wait for loading to complete and modal to appear
    await expect(page.getByRole('heading', { name: /simulation results/i })).toBeVisible({ timeout: 15000 });

    // Verify modal has stats
    await expect(page.getByText(/median wounds/i)).toBeVisible();
    await expect(page.getByText(/mean wounds/i)).toBeVisible();
    await expect(page.getByText(/80% confidence/i)).toBeVisible();

    // Verify chart container is present
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('mobile viewport: no horizontal overflow at 375px', async ({ page }) => {
    // Viewport is already 375px from config
    await page.goto('/');

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // allow 1px rounding

    // Navigate to profiles
    await page.getByText('Profiles').click();
    await expect(page).toHaveURL('/profiles');

    const profilesBodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(profilesBodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

    // Check tap targets on the bottom nav
    const navLinks = page.locator('nav a, nav button');
    const count = await navLinks.count();
    for (let i = 0; i < count; i++) {
      const box = await navLinks.nth(i).boundingBox();
      if (box) {
        // Height should be >= 44px for touch targets
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Navigate to Settings
    await page.getByText('Settings').click();
    await expect(page).toHaveURL('/settings');
  });
});
