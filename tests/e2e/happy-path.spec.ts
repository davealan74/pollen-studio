import { test, expect } from '@playwright/test';

test('connect → simple run → share link → second context runs with second key', async ({
  browser
}) => {
  const ctx1 = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page1 = await ctx1.newPage();
  await page1.goto('/auth/start');
  await page1.getByRole('button', { name: /or paste a key/i }).click();
  await page1.locator('textarea').fill('sk_user_one_aaaaaaaaaa');
  await page1.getByRole('button', { name: 'Use this key' }).click();
  await expect(page1).toHaveURL(/\/simple$/);

  await page1.getByPlaceholder(/Describe what you want/).fill('a hummingbird');
  await page1.getByRole('button', { name: 'Generate' }).click();
  await expect(page1.locator('img')).toBeVisible({ timeout: 10_000 });

  await page1.getByRole('button', { name: 'Share link' }).click();
  const shareUrl = await page1.evaluate(() => navigator.clipboard.readText());
  expect(shareUrl).toContain('/simple#run=');

  const ctx2 = await browser.newContext({ permissions: ['clipboard-read'] });
  const page2 = await ctx2.newPage();
  await page2.goto('/auth/start');
  await page2.getByRole('button', { name: /or paste a key/i }).click();
  await page2.locator('textarea').fill('sk_user_two_bbbbbbbbbb');
  await page2.getByRole('button', { name: 'Use this key' }).click();
  await page2.goto(shareUrl);
  await expect(page2.getByPlaceholder(/Describe what you want/)).toHaveValue('a hummingbird');
  await page2.getByRole('button', { name: 'Generate' }).click();
  await expect(page2.locator('img')).toBeVisible({ timeout: 10_000 });
});
