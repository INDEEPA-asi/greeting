import { chromium, expect, test } from '@playwright/test';

test('waits for Enter Our Garden even when autoplay is permitted, and respects the off switch', async ({ baseURL }) => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ baseURL, reducedMotion: 'reduce' });
    await page.goto('/');
    const music = page.locator('audio').first();
    await page.getByRole('button', { name: 'Music settings' }).click();
    await expect(music).not.toHaveAttribute('src');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Enter Our Garden' }).click();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Music on' }).click();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.paused)).toBe(true);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Enter Our Garden' }).click();
    await expect(page.getByRole('heading', { name: 'Happy Birthday, My Love' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Music off' })).toBeVisible();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.paused)).toBe(true);
  } finally {
    await browser.close();
  }
});

test('starts music on keyboard entry when autoplay is blocked and navigates without Web Animations', async ({ baseURL }) => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=document-user-activation-required'] });
  try {
    const page = await browser.newPage({ baseURL });
    await page.addInitScript(() => {
      Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: undefined });
    });
    await page.goto('/');
    const music = page.locator('audio').first();
    await expect(music).not.toHaveAttribute('src');
    await expect(page.getByRole('button', { name: 'Music off' })).toBeVisible();
    await page.getByRole('button', { name: 'Enter Our Garden' }).focus();
    await page.keyboard.press('Enter');
    const heading = page.getByRole('heading', { name: 'Happy Birthday, My Love' });
    await expect(heading).toBeFocused();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(0);
  } finally {
    await browser.close();
  }
});

test('skips the intro quietly and allows playback from the music switch', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.getByRole('heading', { name: 'Happy Birthday, My Love' })).toBeFocused();
  const music = page.locator('audio').first();
  await expect(music).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Music off' }).click();
  await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(0);
});
