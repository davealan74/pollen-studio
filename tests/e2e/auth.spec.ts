import { test, expect } from '@playwright/test';

test('connect button surfaces when no key is set', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Connect', exact: true })).toBeVisible();
});

test('paste-key fallback connects and lands on /simple', async ({ page }) => {
  await page.goto('/auth/start');
  await page.getByRole('button', { name: /or paste a key/i }).click();
  await page.locator('textarea').fill('sk_paste_test_abcdef1234');
  await page.getByRole('button', { name: 'Use this key' }).click();
  await expect(page).toHaveURL(/\/simple$/);
  await expect(page.getByText('connected')).toBeVisible();
});
